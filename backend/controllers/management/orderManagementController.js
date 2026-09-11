const Order = require('../../models/orderModel');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');
const { sendSuccess } = require('../../utils/responseHelper');

// [GET] /api/management/orders - Lấy danh sách toàn bộ đơn hàng (có lọc theo status)
exports.getAllOrders = catchAsync(async (req, res) => {
  const { status } = req.query;
  const orders = await Order.getAllOrders(status); // Gọi hàm từ orderModel
  return sendSuccess(res, orders, 'Lấy danh sách đơn hàng thành công');
});

// [GET] /api/management/orders/:id - Chi tiết đơn hàng kèm thông tin người mua
exports.getOrderDetail = catchAsync(async (req, res) => {
  const { id } = req.params;
  const order = await Order.getOrderDetailsForAdmin(id); // Gọi hàm từ orderModel

  if (!order) {
    throw new AppError('Không tìm thấy đơn hàng', 404, 'ORDER_NOT_FOUND');
  }

  return sendSuccess(res, order, 'Lấy chi tiết đơn hàng thành công');
});

// [PATCH] /api/management/orders/:id/status - Cập nhật trạng thái đơn (pending -> processing -> shipped -> completed)
exports.updateOrderStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status, internal_note } = req.body;

  const validStatuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new AppError('Trạng thái đơn hàng không hợp lệ', 400, 'INVALID_STATUS');
  }

  const order = await Order.getOrderDetailsForAdmin(id);
  if (!order) {
    throw new AppError('Không tìm thấy đơn hàng', 404, 'ORDER_NOT_FOUND');
  }

  await Order.updateOrderStatus(id, status, internal_note);
  return sendSuccess(res, null, 'Cập nhật trạng thái đơn hàng thành công');
});