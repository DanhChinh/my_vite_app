const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken } = require('../middlewares/authMiddleware');
// Nếu có validate middleware cho đơn hàng, import tại đây:
// const { validate, createOrderSchema } = require('../middlewares/validateMiddleware');

// Tự động xác thực JWT cho tất cả các endpoint thuộc Order
router.use(verifyToken);

// [POST] /api/orders     - Tạo đơn hàng mới
// [GET]  /api/orders     - Lấy danh sách đơn hàng của người dùng
router.route('/')
  .post(orderController.createOrder)
  .get(orderController.getMyOrders);

// [GET] /api/orders/:id  - Xem chi tiết đơn hàng
router.get('/:id', orderController.getMyOrderDetails);

// [PUT] /api/orders/:id/cancel - Hủy đơn hàng
router.put('/:id/cancel', orderController.cancelOrder);

module.exports = router;