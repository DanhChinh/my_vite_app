// Ví dụ API Login (backend/controllers/authController.js)
const pool = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Tìm user trong bảng chung `users`
    const [users] = await pool.query(
      'SELECT * FROM users WHERE (username = ? OR email = ?) AND is_active = 1',
      [username, username]
    );
    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'Tài khoản không tồn tại!' });
    }

    const user = users[0];

    // 2. Kiểm tra mật khẩu mã hóa
    const isMatch = user.password?.startsWith('$2')
      ? await bcrypt.compare(password, user.password)
      : password === user.password;
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Sai mật khẩu!' });
    }

    // 3. Tạo JWT Token chứa id và role
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      token,
      role: user.role,
      username: user.username
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.register = async (req, res) => {
  const { username, email, password, full_name, phone, gender, date_of_birth } = req.body;
  console.log(username, email, password, full_name, phone, gender, date_of_birth)

  // 1. Validate các trường bắt buộc
  if (!username || !password || !full_name) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập đầy đủ các thông tin bắt buộc (Tên đăng nhập, Mật khẩu, Họ tên).'
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Mật khẩu phải có ít nhất 8 ký tự.'
    });
  }

  // 2. Chuẩn hóa dữ liệu rỗng thành NULL để tránh lỗi UNIQUE Key trên MySQL
  const cleanEmail = email && email.trim() !== '' ? email.trim() : null;
  const cleanPhone = phone && phone.trim() !== '' ? phone.trim() : null;
  const cleanGender = ['male', 'female', 'other'].includes(gender) ? gender : 'other';
  const cleanDob = date_of_birth && date_of_birth.trim() !== '' ? date_of_birth : null;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 3. Kiểm tra trùng lặp Username, Email hoặc Phone
    const [existing] = await connection.query(
      `SELECT username, email, phone FROM users 
       WHERE username = ? 
          OR (email IS NOT NULL AND email = ?) 
          OR (phone IS NOT NULL AND phone = ?)`,
      [username, cleanEmail, cleanPhone]
    );

    if (existing.length > 0) {
      await connection.rollback();
      const match = existing[0];
      if (match.username === username) {
        return res.status(409).json({ success: false, message: 'Tên đăng nhập đã tồn tại.' });
      }
      if (cleanEmail && match.email === cleanEmail) {
        return res.status(409).json({ success: false, message: 'Email đã được sử dụng.' });
      }
      if (cleanPhone && match.phone === cleanPhone) {
        return res.status(409).json({ success: false, message: 'Số điện thoại đã được sử dụng.' });
      }
    }

    // 4. Hash mật khẩu
    const passwordHash = await bcrypt.hash(password, 12);

    // 5. Thêm vào bảng `users` (chứa username, password, email, phone, role)
    const [userResult] = await connection.query(
      `INSERT INTO users (username, password, email, phone, role, is_active) 
       VALUES (?, ?, ?, ?, 'customer', 1)`,
      [username, passwordHash, cleanEmail, cleanPhone]
    );

    const userId = userResult.insertId;

    // 6. Thêm vào bảng `customers` (chứa user_id, full_name, gender, date_of_birth)
    await connection.query(
      `INSERT INTO customers (user_id, full_name, gender, date_of_birth) 
       VALUES (?, ?, ?, ?)`,
      [userId, full_name.trim(), cleanGender, cleanDob]
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công.'
    });

  } catch (error) {
    await connection.rollback();
    return res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra trong quá trình đăng ký.',
      error: error.message
    });
  } finally {
    connection.release();
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const genericMessage = 'Nếu email tồn tại, hướng dẫn khôi phục mật khẩu đã được tạo.';

  if (!email) return res.status(400).json({ success: false, message: 'Vui lòng nhập email.' });

  try {
    const [users] = await pool.query(
      "SELECT id FROM users WHERE email = ? AND is_active = 1 AND role = 'customer'",
      [email]
    );
    if (users.length === 0) return res.json({ success: true, message: genericMessage });

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    await pool.query(
      'UPDATE password_resets SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL',
      [users[0].id]
    );
    await pool.query(
      'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))',
      [users[0].id, tokenHash]
    );

    const response = { success: true, message: genericMessage };
    if (process.env.NODE_ENV !== 'production') response.resetToken = rawToken;
    return res.json(response);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, new_password } = req.body;
  if (!token || !new_password || new_password.length < 8) {
    return res.status(400).json({ success: false, message: 'Token và mật khẩu mới hợp lệ là bắt buộc.' });
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [resets] = await connection.query(
      `SELECT id, user_id FROM password_resets
       WHERE token_hash = ? AND used_at IS NULL AND expires_at > NOW()
       FOR UPDATE`,
      [tokenHash]
    );
    if (resets.length === 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }

    const passwordHash = await bcrypt.hash(new_password, 12);
    await connection.query('UPDATE users SET password = ? WHERE id = ?', [passwordHash, resets[0].user_id]);
    await connection.query('UPDATE password_resets SET used_at = NOW() WHERE id = ?', [resets[0].id]);
    await connection.commit();
    res.json({ success: true, message: 'Đặt lại mật khẩu thành công.' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};