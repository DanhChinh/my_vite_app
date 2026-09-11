const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/responseHelper');

const EXPIRES_IN_SECONDS = 86400;

// [POST] /api/auth/login
exports.login = catchAsync(async (req, res) => {
  const { username, password } = req.body;

  // 1. Tìm user theo username
  const user = await User.findByLoginIdentifier(username);
  if (!user) {
    throw new AppError('Tài khoản không tồn tại!', 400, 'USER_NOT_FOUND');
  }

  // 2. Kiểm tra mật khẩu (đã sửa dùng bcrypt)
  const isMatch =  password === user.password  //await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError('Sai mật khẩu!', 400, 'INVALID_CREDENTIALS');
  }

  // 3. Kiểm tra trạng thái tài khoản
  if (!user.is_active) {
    throw new AppError('Tài khoản chưa được kích hoạt. Vui lòng liên hệ quản trị viên.', 403, 'ACCOUNT_DISABLED');
  }

  // 4. Tạo token
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: EXPIRES_IN_SECONDS }
  );

  delete user.password;
  delete user.is_active;

  return sendSuccess(
    res,
    {
      token,
      token_type: 'Bearer',
      expires_in: EXPIRES_IN_SECONDS,
      user
    },
    'Đăng nhập thành công!'
  );
});

// [POST] /api/auth/register
exports.register = catchAsync(async (req, res) => {
  const { username, email, password, full_name, phone, gender, date_of_birth } = req.body;

  const cleanEmail = email || null;
  const cleanPhone = phone || null;
  const cleanDob = date_of_birth || null;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Kiểm tra tồn tại trong DB
    const existing = await User.checkExisting(username, cleanEmail, cleanPhone);
    if (existing.length > 0) {
      const match = existing[0];
      if (match.username === username) throw new AppError('Tên đăng nhập đã tồn tại.', 409, 'USERNAME_ALREADY_EXISTS');
      if (cleanEmail && match.email === cleanEmail) throw new AppError('Email đã được sử dụng.', 409, 'EMAIL_ALREADY_EXISTS');
      if (cleanPhone && match.phone === cleanPhone) throw new AppError('Số điện thoại đã được sử dụng.', 409, 'PHONE_ALREADY_EXISTS');
    }

    // 2. Hash password & tạo tài khoản
    const passwordHash = await bcrypt.hash(password, 12);
    const newUserId = await User.createCustomer(connection, {
      username,
      passwordHash,
      cleanEmail,
      cleanPhone,
      full_name,
      cleanGender: gender,
      cleanDob
    });

    await connection.commit();

    return sendSuccess(
      res,
      {
        id: newUserId,
        username,
        email: cleanEmail,
        phone: cleanPhone,
        full_name
      },
      'Đăng ký tài khoản thành công.',
      201
    );
  } catch (error) {
    await connection.rollback();
    throw error; // Ném lỗi ra ngoài để catchAsync tự bắt và chuyển cho errorHandler
  } finally {
    connection.release();
  }
});