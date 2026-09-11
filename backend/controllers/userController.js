const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const User = require('../models/userModel');
const { sendSuccess } = require('../utils/responseHelper');

// 1. Lấy thông tin bản thân (GET /users/me)
exports.getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {throw new AppError('Không tìm thấy thông tin cá nhân', 404, 'USER_NOT_FOUND');}
  return sendSuccess(res, user, 'Lấy thông tin cá nhân thành công');
});

// 2. Admin xem thông tin user bất kỳ (GET /users/:id)
exports.getUserById = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { throw new AppError('Không tìm thấy người dùng trong hệ thống', 404, 'USER_NOT_FOUND');}
  return sendSuccess(res, user, 'Lấy chi tiết người dùng thành công');
});