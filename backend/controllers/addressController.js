const Address = require('../models/addressModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/responseHelper');

// [GET] /api/addresses - Danh sách địa chỉ của user
exports.getAddresses = catchAsync(async (req, res) => {
  const addresses = await Address.getByUserId(req.user.id);
  return sendSuccess(res, addresses, 'Lấy danh sách địa chỉ thành công');
});

// [POST] /api/addresses - Tạo địa chỉ mới
exports.createAddress = catchAsync(async (req, res) => {
  const insertId = await Address.create(req.user.id, req.body);
  const newAddress = await Address.getById(insertId, req.user.id);

  return sendSuccess(res, newAddress, 'Thêm địa chỉ thành công!', 201);
});

// [PUT] /api/addresses/:id - Cập nhật địa chỉ
exports.updateAddress = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const addressId = req.params.id;

  const existingAddress = await Address.getById(addressId, userId);
  if (!existingAddress) {
    throw new AppError('Địa chỉ không tồn tại!', 404, 'ADDRESS_NOT_FOUND');
  }

  const isUpdated = await Address.update(addressId, userId, {
    ...existingAddress,
    ...req.body
  });

  if (!isUpdated) {
    throw new AppError('Cập nhật địa chỉ thất bại!', 400, 'UPDATE_FAILED');
  }

  const updatedAddress = await Address.getById(addressId, userId);
  return sendSuccess(res, updatedAddress, 'Cập nhật địa chỉ thành công!');
});

// [PATCH] /api/addresses/:id/default - Đặt làm địa chỉ mặc định
exports.setDefaultAddress = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const addressId = req.params.id;

  const existingAddress = await Address.getById(addressId, userId);
  if (!existingAddress) {
    throw new AppError('Địa chỉ không tồn tại!', 404, 'ADDRESS_NOT_FOUND');
  }

  await Address.setDefault(addressId, userId);
  return sendSuccess(res, null, 'Đã thiết lập làm địa chỉ mặc định!');
});

// [DELETE] /api/addresses/:id - Xóa địa chỉ
exports.deleteAddress = catchAsync(async (req, res) => {
  const isDeleted = await Address.delete(req.params.id, req.user.id);
  if (!isDeleted) {
    throw new AppError('Địa chỉ không tồn tại hoặc đã bị xóa!', 404, 'ADDRESS_NOT_FOUND');
  }

  return sendSuccess(res, null, 'Xóa địa chỉ thành công!');
});