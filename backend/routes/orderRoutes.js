// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken } = require('../middlewares/authMiddleware');

// router.use(verifyToken);

router.post('/orders', verifyToken, orderController.createOrder);
router.get('/orders', verifyToken, orderController.getMyOrders);
router.get('/orders/:id', verifyToken, orderController.getMyOrderDetails);
router.put('/orders/:id/cancel', verifyToken, orderController.cancelOrder);

// Các route dành riêng cho Admin/Staff (Cần thêm middleware kiểm tra quyền admin/staff)
// router.get('/admin/orders', verifyAdminOrStaff, orderController.getAllOrdersForAdmin);
// router.get('/admin/orders/:id', verifyAdminOrStaff, orderController.getOrderDetailsForAdmin);
// router.put('/admin/orders/:id/status', verifyAdminOrStaff, orderController.updateOrderStatus);

module.exports = router;