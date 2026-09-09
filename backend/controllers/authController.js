const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/database');
const User = require('../models/userModel');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findByLoginIdentifier(username);
    if (!user) {
      return res.status(400).json({ success: false, message: 'Tài khoản không tồn tại!' });
    }

    // const isMatch = user.password?.startsWith('$2')
    //   ? await bcrypt.compare(password, user.password)
    //   : password === user.password;
    const isMatch = user.password ===password;
      
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Sai mật khẩu!' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    if (user.is_active){
      delete user.password;
      delete user.is_active;
  
      res.json({
        success: true,
        message: 'Đăng nhập thành công!',
        token,
        user
      });
    }else{
      return res.status(403).json({ success: false, message: 'Tài khoản chưa được kích hoạt. Vui lòng liên hệ quản trị viên.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.register = async (req, res) => {
  const { username, email, password, full_name, phone, gender, date_of_birth } = req.body;

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

  const cleanEmail = email && email.trim() !== '' ? email.trim() : null;
  const cleanPhone = phone && phone.trim() !== '' ? phone.trim() : null;
  const cleanGender = ['male', 'female', 'other'].includes(gender) ? gender : 'other';
  const cleanDob = date_of_birth && date_of_birth.trim() !== '' ? date_of_birth : null;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const existing = await User.checkExisting(username, cleanEmail, cleanPhone);

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

    const passwordHash = await bcrypt.hash(password, 12);

    await User.createCustomer(connection, {
      username,
      passwordHash,
      cleanEmail,
      cleanPhone,
      full_name,
      cleanGender,
      cleanDob
    });

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

// exports.forgotPassword = async (req, res) => {
//   const { email } = req.body;
//   const genericMessage = 'Nếu email tồn tại, hướng dẫn khôi phục mật khẩu đã được tạo.';

//   if (!email) return res.status(400).json({ success: false, message: 'Vui lòng nhập email.' });

//   try {
//     const customer = await User.findCustomerEmail(email);
//     if (!customer) return res.json({ success: true, message: genericMessage });

//     const rawToken = crypto.randomBytes(32).toString('hex');
//     const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

//     const connection = await pool.getConnection();
//     try {
//       await connection.beginTransaction();
//       await User.expireExistingResets(connection, customer.id);
//       await User.createPasswordReset(connection, customer.id, tokenHash);
//       await connection.commit();
//     } catch (err) {
//       await connection.rollback();
//       throw err;
//     } finally {
//       connection.release();
//     }

//     const response = { success: true, message: genericMessage };
//     if (process.env.NODE_ENV !== 'production') response.resetToken = rawToken;
//     return res.json(response);
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// exports.resetPassword = async (req, res) => {
//   const { token, new_password } = req.body;
//   if (!token || !new_password || new_password.length < 8) {
//     return res.status(400).json({ success: false, message: 'Token và mật khẩu mới hợp lệ là bắt buộc.' });
//   }

//   const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
//   const connection = await pool.getConnection();
//   try {
//     await connection.beginTransaction();
    
//     const resetRecord = await User.findValidResetToken(connection, tokenHash);
//     if (!resetRecord) {
//       await connection.rollback();
//       return res.status(400).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn.' });
//     }

//     const passwordHash = await bcrypt.hash(new_password, 12);
//     await User.updatePassword(connection, resetRecord.user_id, passwordHash);
//     await User.markResetTokenAsUsed(connection, resetRecord.id);
    
//     await connection.commit();
//     res.json({ success: true, message: 'Đặt lại mật khẩu thành công.' });
//   } catch (error) {
//     await connection.rollback();
//     res.status(500).json({ success: false, message: error.message });
//   } finally {
//     connection.release();
//   }
// };





// [GET] /api/auth/profile - Lấy thông tin cá nhân
exports.getProfile = async (req, res) => {
  try {
    // 1. Lấy userId từ Token qua req.user
    const userId = req.user.id;
    console.log("userId", userId)

    // 2. Truy vấn dữ liệu từ CSDL
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Tài khoản không tồn tại trên hệ thống!'
      });
    }

    // 3. Phản hồi dữ liệu cho Frontend
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin profile:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống, không thể lấy thông tin cá nhân.'
    });
  }
};

// [PUT] /api/auth/profile - Cập nhật thông tin cá nhân
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, phone, address, avatar } = req.body;

    // Lấy thông tin hiện tại để giữ nguyên dữ liệu cũ nếu client không truyền
    const currentProfile = await User.findByLoginIdentifier(userId);
    if (!currentProfile) {
      return res.status(404).json({ success: false, message: 'Tài khoản không tồn tại!' });
    }

    const updatedData = {
      full_name: full_name !== undefined ? full_name : currentProfile.full_name,
      phone: phone !== undefined ? phone : currentProfile.phone,
      address: address !== undefined ? address : currentProfile.address,
      avatar: avatar !== undefined ? avatar : currentProfile.avatar
    };

    const isUpdated = await User.updateProfile(userId, updatedData);

    if (!isUpdated) {
      return res.status(400).json({ success: false, message: 'Cập nhật thất bại!' });
    }

    // Lấy lại thông tin mới nhất sau khi cập nhật
    const newProfile = await User.findByLoginIdentifier(userId);

    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin cá nhân thành công!',
      data: newProfile
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật profile:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống, không thể cập nhật thông tin.'
    });
  }
};