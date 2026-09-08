const express = require('express');
const router = express.Router();

const orderController = require('../controllers/staff/orderController');
const productController = require('../controllers/staff/productController');
const reviewController = require('../controllers/staff/reviewController');

const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');

// Áp dụng Middleware xác thực token & đảm bảo quyền là staff hoặc admin
router.use(verifyToken);
router.use(verifyRole(['staff', 'admin']));

// Quản lý Đơn hàng
router.get('/orders', orderController.getAllOrders);
router.get('/orders/:id', orderController.getOrderDetail);
router.put('/orders/:id/status', orderController.updateOrderStatus);

// Quản lý Sản phẩm & Tồn kho
router.post('/products', productController.createProduct);
router.put('/products/:id/stock', productController.updateStock);

// Duyệt Đánh giá
router.get('/reviews/pending', reviewController.getPendingReviews);
router.put('/reviews/:id/moderate', reviewController.moderateReview);

module.exports = router;