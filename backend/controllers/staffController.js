// server/controllers/staffController.js
const pool = require('../config/db');

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
    const [rows] = await pool.query(`
      SELECT c.id,
             c.user_id AS customer_id,
             c.updated_at AS created_at,
             cu.full_name,
             cu.phone,
             cu.address,
             COALESCE(SUM(ci.quantity * p.price), 0) AS total_price,
             'Pending' AS status
      FROM carts c
      LEFT JOIN customers cu ON cu.user_id = c.user_id
      LEFT JOIN cart_items ci ON ci.cart_id = c.id
      LEFT JOIN products p ON p.id = ci.product_id
      GROUP BY c.id, c.user_id, c.updated_at, cu.full_name, cu.phone, cu.address
      ORDER BY c.updated_at DESC
    `);

    const data = rows.map((row) => ({
      ...row,
      total_price: Number(row.total_price || 0),
      status: row.status || 'Pending'
    }));

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật trạng thái đơn hàng (Pending -> Shipping -> Completed)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const [rows] = await pool.query('SELECT id FROM carts WHERE id = ?', [orderId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng!' });
    }

    if (!status) {
      return res.status(400).json({ success: false, message: 'Thiếu trạng thái cần cập nhật!' });
    }

    res.json({
      success: true,
      message: 'Bảng carts không có cột trạng thái, việc cập nhật sẽ được quản lý ở tầng giao diện.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};