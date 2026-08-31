// server/routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Tất cả các route bên dưới đều bắt buộc phải qua middleware `verifyToken` để bảo mật
// Đường dẫn thực tế sẽ là: /api/customer/profile

// Lấy thông tin hồ sơ
router.get('/profile', verifyToken, customerController.getProfile);

// Cập nhật thông tin hồ sơ
router.put('/profile', verifyToken, customerController.updateProfile);

module.exports = router;