const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Nhân viên hoặc admin mới được truy cập
router.get('/staff/products', verifyToken, staffController.getProducts);
router.get('/staff/orders', verifyToken, staffController.getOrders);
router.put('/staff/orders/:orderId', verifyToken, staffController.updateOrderStatus);

module.exports = router;