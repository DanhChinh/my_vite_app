// server/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware');

router.use(verifyToken, verifyAdmin);

// Các route bên dưới ĐÃ CÓ tiền tố /admin nên không cần lặp lại chữ /admin nữa
router.get('/statistics', adminController.getStatistics);

router.get('/staff', adminController.getStaffs);
router.post('/staff', adminController.createStaff);
router.put('/staff/:id/reset-password', adminController.resetStaffPassword);
router.delete('/staff/:id', adminController.deleteStaff);

router.get('/partners', adminController.getPartners);
router.post('/partners', adminController.createPartner);
router.put('/partners/:id', adminController.updatePartner);
router.delete('/partners/:id', adminController.deletePartner);

router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

module.exports = router;