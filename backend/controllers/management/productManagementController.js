const Product = require('../../models/productModel');
const pool = require('../../config/database');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');
const { sendSuccess } = require('../../utils/responseHelper');

// [POST] /api/management/products - Thêm sản phẩm mới (Staff + Admin)
exports.createProduct = catchAsync(async (req, res) => {
  const { category_id, partner_id, name, description, price, stock, attributes, images } = req.body;

  if (!name || !price || !category_id) {
    throw new AppError('Vui lòng điền đầy đủ các thông tin bắt buộc', 400, 'MISSING_REQUIRED_FIELDS');
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const productId = await Product.create(connection, {
      category_id,
      partner_id,
      name,
      description,
      price,
      stock,
      attributes
    }, images);

    await connection.commit();
    return sendSuccess(res, { id: productId }, 'Tạo sản phẩm thành công', 201);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});

// [PUT] /api/management/products/:id - Cập nhật thông tin sản phẩm (Staff + Admin)
exports.updateProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const isUpdated = await Product.update(id, req.body);

  if (!isUpdated) {
    throw new AppError('Sản phẩm không tồn tại hoặc không có gì thay đổi', 404, 'PRODUCT_NOT_FOUND');
  }

  return sendSuccess(res, null, 'Cập nhật thông tin sản phẩm thành công');
});

// [DELETE] /api/management/products/:id - Xóa sản phẩm (Chỉ Admin)
exports.deleteProduct = catchAsync(async (req, res) => {
  const { id } = req.params;
  const isDeleted = await Product.delete(id);

  if (!isDeleted) {
    throw new AppError('Sản phẩm không tồn tại', 404, 'PRODUCT_NOT_FOUND');
  }

  return sendSuccess(res, null, 'Xóa sản phẩm thành công');
});