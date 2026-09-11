const pool = require('../../config/database');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');
const { sendSuccess } = require('../../utils/responseHelper');

// [GET] /api/management/users - Lấy danh sách tất cả người dùng (Admin)
exports.getAllUsers = catchAsync(async (req, res) => {
  const { role } = req.query;
  let query = `SELECT id, username, email, phone, role, is_active, created_at FROM users`;
  const params = [];

  if (role) {
    query += ` WHERE role = ?`;
    params.push(role);
  }
  query += ` ORDER BY created_at DESC`;

  const [users] = await pool.query(query, params);
  return sendSuccess(res, users, 'Lấy danh sách người dùng thành công');
});

// [PATCH] /api/management/users/:id/status - Khóa / Mở khóa tài khoản (Admin)
exports.toggleUserStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  // Tránh việc Admin tự khóa chính mình
  if (req.user.id === Number(id)) {
    throw new AppError('Bạn không thể tự khóa tài khoản của chính mình', 400, 'SELF_LOCK_DISALLOWED');
  }

  const [result] = await pool.query(
    'UPDATE users SET is_active = ? WHERE id = ?',
    [is_active ? 1 : 0, id]
  );

  if (result.affectedRows === 0) {
    throw new AppError('Người dùng không tồn tại', 404, 'USER_NOT_FOUND');
  }

  return sendSuccess(res, null, 'Cập nhật trạng thái tài khoản thành công');
});