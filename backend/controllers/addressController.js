// controllers/addressController.js
const Address = require('../models/addressModel');

// [GET] /api/addresses - Danh sách địa chỉ của user
exports.getAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const addresses = await Address.getByUserId(userId);

    res.status(200).json({
      success: true,
      data: addresses
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách địa chỉ:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

// [POST] /api/addresses - Tạo địa chỉ mới
exports.createAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipient_name, phone, address_line } = req.body;

    // Validation cơ bản
    if (!recipient_name || !phone || !address_line) {
      return res.status(400).json({
        success: false,
        message: 'Tên người nhận, số điện thoại và địa chỉ chi tiết là bắt buộc!'
      });
    }

    const insertId = await Address.create(userId, req.body);
    const newAddress = await Address.getById(insertId, userId);

    res.status(201).json({
      success: true,
      message: 'Thêm địa chỉ thành công!',
      data: newAddress
    });
  } catch (error) {
    console.error('Lỗi khi tạo địa chỉ:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

// [PUT] /api/addresses/:id - Cập nhật địa chỉ
exports.updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;

    const existingAddress = await Address.getById(addressId, userId);
    if (!existingAddress) {
      return res.status(404).json({ success: false, message: 'Địa chỉ không tồn tại!' });
    }

    const isUpdated = await Address.update(addressId, userId, {
      ...existingAddress,
      ...req.body
    });

    if (!isUpdated) {
      return res.status(400).json({ success: false, message: 'Cập nhật thất bại!' });
    }

    const updatedAddress = await Address.getById(addressId, userId);

    res.status(200).json({
      success: true,
      message: 'Cập nhật địa chỉ thành công!',
      data: updatedAddress
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật địa chỉ:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

// [PATCH] /api/addresses/:id/default - Đặt làm địa chỉ mặc định
exports.setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;

    const existingAddress = await Address.getById(addressId, userId);
    if (!existingAddress) {
      return res.status(404).json({ success: false, message: 'Địa chỉ không tồn tại!' });
    }

    await Address.setDefault(addressId, userId);

    res.status(200).json({
      success: true,
      message: 'Đã thiết lập làm địa chỉ mặc định!'
    });
  } catch (error) {
    console.error('Lỗi khi đặt địa chỉ mặc định:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

// [DELETE] /api/addresses/:id - Xóa địa chỉ
exports.deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;

    const isDeleted = await Address.delete(addressId, userId);
    if (!isDeleted) {
      return res.status(404).json({ success: false, message: 'Địa chỉ không tồn tại hoặc đã bị xóa!' });
    }

    res.status(200).json({
      success: true,
      message: 'Xóa địa chỉ thành công!'
    });
  } catch (error) {
    console.error('Lỗi khi xóa địa chỉ:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};