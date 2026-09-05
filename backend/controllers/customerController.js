// server/controllers/customerController.js
const pool = require('../config/db');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT u.username, c.full_name, c.phone, c.address
       FROM users u
       LEFT JOIN customers c ON u.id = c.user_id
       WHERE u.id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin khách hàng!'
      });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, phone, address } = req.body;

    const [existing] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [userId]);

    if (existing.length === 0) {
      await pool.query(
        'INSERT INTO customers (user_id, full_name, phone, address, created_at) VALUES (?, ?, ?, ?, NOW())',
        [userId, full_name || '', phone || '', address || '']
      );
    } else {
      await pool.query(
        `UPDATE customers
         SET full_name = ?, phone = ?, address = ?
         WHERE user_id = ?`,
        [full_name || '', phone || '', address || '', userId]
      );
    }

    res.json({ success: true, message: 'Cập nhật thông tin giao hàng thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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

exports.createOrder = async (req, res) => {
  const userId = req.user.id;
  const { items, total_price, shipping_address } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Giỏ hàng trống!' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [cartResult] = await connection.query(
      `INSERT INTO carts (user_id, updated_at) VALUES (?, NOW())
       ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id), updated_at = NOW()`,
      [userId]
    );
    const cartId = cartResult.insertId;

    await connection.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

    for (const item of items) {
      await connection.query(
        'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)',
        [cartId, item.product_id, item.quantity]
      );
    }

    await connection.commit();

    const orderTotal = Number(total_price || 0);
    res.json({
      success: true,
      message: 'Đặt hàng thành công!',
      orderId: cartId,
      total_price: orderTotal,
      shipping_address: shipping_address || ''
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};