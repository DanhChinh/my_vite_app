const express = require('express');
const router = express.Router();

const orderManagementController = require('../controllers/management/orderManagementController');
const productManagementController = require('../controllers/management/productManagementController');
const userManagementController = require('../controllers/management/userManagementController');

const { verifyToken, restrictTo } = require('../middlewares/authMiddleware');

// ===================================================
// BẮT BUỘC ĐĂNG NHẬP CHO TOÀN BỘ ROUTE QUẢN TRỊ
// ===================================================
router.use(verifyToken);

// ---------------------------------------------------
// 1. QUẢN LÝ ĐƠN HÀNG (Cho phép CẢ Staff và Admin)
// ---------------------------------------------------
router.get('/orders', restrictTo('staff', 'admin'), orderManagementController.getAllOrders);
router.get('/orders/:id', restrictTo('staff', 'admin'), orderManagementController.getOrderDetail);
router.patch('/orders/:id/status', restrictTo('staff', 'admin'), orderManagementController.updateOrderStatus);

// ---------------------------------------------------
// 2. QUẢN LÝ SẢN PHẨM & KHO (Thêm/Sửa: Staff + Admin | Xóa: Chỉ Admin)
// ---------------------------------------------------
router.post('/products', restrictTo('staff', 'admin'), productManagementController.createProduct);
router.put('/products/:id', restrictTo('staff', 'admin'), productManagementController.updateProduct);
router.delete('/products/:id', restrictTo('admin'), productManagementController.deleteProduct);

// ---------------------------------------------------
// 3. QUẢN LÝ NGƯỜI DÙNG & TÀI KHOẢN (Chỉ Admin)
// ---------------------------------------------------
router.get('/users', restrictTo('admin'), userManagementController.getAllUsers);
router.patch('/users/:id/status', restrictTo('admin'), userManagementController.toggleUserStatus);

module.exports = router;