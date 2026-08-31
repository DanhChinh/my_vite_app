// server/controllers/staffController.js
const pool = require('../config/db');

// Lấy danh sách tất cả đơn hàng kèm thông tin khách hàng
exports.getOrders = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT o.id, o.total_price, o.status, o.created_at, 
             c.full_name, c.phone, c.address 
      FROM orders o
      JOIN customers c ON o.customer_id = c.user_id
      ORDER BY o.created_at DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật trạng thái đơn hàng (Pending -> Shipping -> Completed)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body; // Ví dụ: 'Shipping' hoặc 'Completed'

    const [result] = await pool.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, orderId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng!' });
    }

    res.json({ success: true, message: 'Cập nhật trạng thái đơn hàng thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};