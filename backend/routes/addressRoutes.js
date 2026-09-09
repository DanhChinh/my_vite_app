// routes/addressRoutes.js
const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Tất cả route địa chỉ đều yêu cầu đăng nhập

router.get('/addresses', verifyToken, addressController.getAddresses);
router.post('/addresses', verifyToken, addressController.createAddress);
router.put('/addresses/:id', verifyToken, addressController.updateAddress);
router.patch('/addresses/:id/default', verifyToken, addressController.setDefaultAddress);
router.delete('/addresses/:id', verifyToken, addressController.deleteAddress);

module.exports = router;