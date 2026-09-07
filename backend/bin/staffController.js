// server/controllers/staffController.js
const pool = require('../config/database');

// Lấy danh sách tất cả sản phẩm kèm thông tin danh mục (staff-side)
exports.getProducts = async (req, res) => {
  try {
    const { category } = req.query;
    let query = `
      SELECT p.*, c.name AS category_name, c.slug AS category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
    `;
    const params = [];

    if (category) {
      query += ' WHERE c.slug = ?';
      params.push(category);
    }

    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy danh sách tất cả đơn hàng kèm thông tin khách hàng
exports.getOrders = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filters = [];
    const params = [];
    if (status) {
      filters.push('o.status = ?');
      params.push(status);
    }
    if (search) {
      filters.push('(CAST(o.id AS CHAR) LIKE ? OR cu.full_name LIKE ? OR cu.phone LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const [data] = await pool.query(`
      SELECT o.id, o.user_id AS customer_id, o.created_at, o.shipping_address AS address,
             o.note, o.internal_note, o.payment_method, o.status, o.total_price,
             cu.full_name, cu.phone
      FROM orders o
      LEFT JOIN customers cu ON cu.user_id = o.user_id
      ${where}
      ORDER BY o.created_at DESC
    `, params);

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getIncompleteCarts = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.id AS cart_id, c.user_id, c.updated_at, cu.full_name, cu.phone, cu.address,
             COUNT(ci.id) AS item_count, COALESCE(SUM(ci.quantity * p.price), 0) AS total_price
      FROM carts c
      JOIN cart_items ci ON ci.cart_id = c.id
      JOIN products p ON p.id = ci.product_id
      LEFT JOIN customers cu ON cu.user_id = c.user_id
      WHERE NOT EXISTS (
        SELECT 1 FROM orders o
        WHERE o.user_id = c.user_id AND o.created_at >= c.updated_at AND o.status <> 'cancelled'
      )
      GROUP BY c.id, c.user_id, c.updated_at, cu.full_name, cu.phone, cu.address
      ORDER BY c.updated_at DESC
    `);
    res.json({ success: true, data: rows.map((row) => ({ ...row, item_count: Number(row.item_count), total_price: Number(row.total_price) })) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật trạng thái đơn hàng (Pending -> Shipping -> Completed)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, internal_note } = req.body;
    const allowedStatuses = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'];

    const [rows] = await pool.query('SELECT id, status FROM orders WHERE id = ?', [orderId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng!' });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Thiếu trạng thái cần cập nhật!' });
    }

    const transitions = {
      pending: ['pending', 'confirmed', 'cancelled'],
      confirmed: ['confirmed', 'shipping', 'cancelled'],
      shipping: ['shipping', 'completed', 'cancelled'],
      completed: ['completed'],
      cancelled: ['cancelled']
    };
    if (!transitions[rows[0].status]?.includes(status)) {
      return res.status(400).json({ success: false, message: 'Không thể chuyển sang trạng thái này.' });
    }

    await pool.query(
      'UPDATE orders SET status = ?, internal_note = COALESCE(?, internal_note) WHERE id = ?',
      [status, internal_note, orderId]
    );
    res.json({
      success: true,
      message: 'Cập nhật trạng thái đơn hàng thành công.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, cu.full_name, cu.phone
       FROM orders o LEFT JOIN customers cu ON cu.user_id = o.user_id WHERE o.id = ?`,
      [req.params.orderId]
    );
    if (orders.length === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng!' });
    const [items] = await pool.query(
      `SELECT oi.product_id, oi.quantity, oi.unit_price, p.name
       FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = ?`,
      [req.params.orderId]
    );
    res.json({ success: true, data: { ...orders[0], items } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};