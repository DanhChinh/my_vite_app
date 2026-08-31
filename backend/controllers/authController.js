// Ví dụ API Login (backend/controllers/authController.js)
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Tìm user trong bảng chung `users`
    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'Tài khoản không tồn tại!' });
    }

    const user = users[0];

    // 2. Kiểm tra mật khẩu mã hóa
    const isMatch = password == user.password  //await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Sai mật khẩu!' });
    }

    // 3. Tạo JWT Token chứa id và role
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      token,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};