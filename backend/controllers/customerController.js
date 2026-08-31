// server/controllers/customerController.js
const pool = require('../config/db');

// Lấy thông tin hồ sơ cá nhân của khách hàng
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy từ token sau khi qua middleware xác thực

    // Join bảng users và customers dựa vào user_id
    const [rows] = await pool.query(
      `SELECT u.username, c.full_name, c.phone, c.address 
       FROM users u 
       JOIN customers c ON u.id = c.user_id 
       WHERE u.id = ?`, 
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin khách hàng!' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật thông tin hồ sơ (Họ tên, SĐT, Địa chỉ giao hàng)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, phone, address } = req.body;

    // Cập nhật dữ liệu vào bảng customers
    const [result] = await pool.query(
      `UPDATE customers SET full_name = ?, phone = ?, address = ? WHERE user_id = ?`,
      [full_name, phone, address, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Cập nhật thất bại, không tìm thấy hồ sơ khách hàng!' });
    }

    res.json({ success: true, message: 'Cập nhật thông tin giao hàng thành công!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};