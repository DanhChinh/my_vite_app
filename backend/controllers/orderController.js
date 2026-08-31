// server/controllers/orderController.js
const pool = require('../config/db');

// Đảm bảo dùng exports.createOrder
exports.createOrder = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const userId = req.user.id;
    const { items, total_price } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Giỏ hàng trống!' });
    }

    const [orderResult] = await connection.query(
      'INSERT INTO orders (customer_id, total_price) VALUES (?, ?)',
      [userId, total_price]
    );
    const orderId = orderResult.insertId;

    for (let item of items) {
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    await connection.commit();
    res.json({ success: true, message: 'Đặt hàng thành công!', orderId });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};