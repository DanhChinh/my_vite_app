const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware');
// Nếu có validate middleware cho product, import tại đây:
// const { validate, productSchema } = require('../middlewares/validateMiddleware');

// ==========================================
// PUBLIC ROUTES (Không yêu cầu đăng nhập)
// ==========================================

// [GET] /api/products/categories - Lấy danh mục sản phẩm
router.get('/categories', productController.getCategories);

// [GET]  /api/products - Lấy danh sách sản phẩm (có lọc, phân trang, tìm kiếm)
// [POST] /api/products - Tạo sản phẩm mới (Chỉ Admin)
router.route('/')
  .get(productController.getProducts)
  .post(verifyToken, verifyAdmin, productController.createProduct);

// [GET]    /api/products/:id - Lấy chi tiết sản phẩm
// [PUT]    /api/products/:id - Cập nhật thông tin sản phẩm (Chỉ Admin)
// [DELETE] /api/products/:id - Xóa sản phẩm (Chỉ Admin)
router.route('/:id')
  .get(productController.getProductDetail)
  .put(verifyToken, verifyAdmin, productController.updateProduct)
  .delete(verifyToken, verifyAdmin, productController.deleteProduct);

module.exports = router;