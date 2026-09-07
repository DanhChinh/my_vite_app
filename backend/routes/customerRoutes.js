const express = require('express');
const router = express.Router();
const profileController = require('../controllers/customer/profileController');
const cartController = require('../controllers/customer/cartController');
const orderController = require('../controllers/customer/orderController');
const reviewController = require('../controllers/customer/reviewController');
const { verifyToken, verifyCustomer } = require('../middlewares/authMiddleware'); // Middleware xác thực đăng nhập

// Áp dụng middleware bảo vệ tất cả các route của customer
router.use(verifyToken, verifyCustomer);

// Profile & Địa chỉ
router.get('/profile', profileController.getProfile);
router.put('/profile', profileController.updateProfile);
router.get('/addresses', profileController.getAddresses);
router.post('/addresses', profileController.addAddress);

// Cart
router.get('/cart', cartController.getCart);
router.post('/cart/add', cartController.addToCart);
router.post('/cart/merge', cartController.mergeGuestCart);

// Orders
router.post('/orders', orderController.createOrder);
router.get('/orders', orderController.getMyOrders);
router.get('/orders/:id', orderController.getOrderDetail);
router.put('/orders/:id/cancel', orderController.cancelOrder);

// Reviews
router.post('/reviews', reviewController.createReview);

module.exports = router;