// server/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
// const { uploadProductImagesMiddleware } = require('../middlewares/uploadMiddleware');
// const reviewController = require('../controllers/reviewController');

const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware');
router.use(verifyToken, verifyAdmin);

const customerController = require('../controllers/admin/customerController');
const staffController = require('../controllers/admin/staffController');
const productController = require('../controllers/admin/productController');
const categoryController = require('../controllers/admin/categoryController');
const partnerController = require('../controllers/admin/partnerController');
const statisticController = require('../controllers/admin/statisticController');

// Quản lý Khách hàng
router.get('/customers', customerController.getCustomers);
router.get('/customers/:id', customerController.getCustomerById);
router.patch('/users/:id/active', customerController.toggleUserActiveStatus);

// Quản lý Nhân viên
router.get('/staffs', staffController.getStaffs);
router.post('/staffs', staffController.createStaff);
router.put('/staffs/:id', staffController.updateStaff);

//test api ok here

// Quản lý Sản phẩm
router.get('/products', productController.getProducts);
router.post('/products', productController.createProduct);
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

// Quản lý Danh mục
router.get('/categories', categoryController.getCategories);
router.post('/categories', categoryController.createCategory);
router.put('/categories/:id', categoryController.updateCategory);
router.delete('/categories/:id', categoryController.deleteCategory);

// Quản lý Đối tác
router.get('/partners', partnerController.getPartners);
router.post('/partners', partnerController.createPartner);
router.put('/partners/:id', partnerController.updatePartner);
router.delete('/partners/:id', partnerController.deletePartner);

// Báo cáo Thống kê
router.get('/statistics/dashboard', statisticController.getDashboardSummary);

module.exports = router;