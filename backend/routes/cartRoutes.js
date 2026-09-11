const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { verifyToken } = require('../middlewares/authMiddleware');
// Nếu dự án có dùng validate middleware thì import thêm vào đây:
// const { validate, cartItemSchema } = require('../middlewares/validateMiddleware');

// Áp dụng middleware xác thực Token cho toàn bộ route giỏ hàng
router.use(verifyToken);

// [GET]  /api/carts - Lấy thông tin giỏ hàng
// [POST] /api/carts - Thêm sản phẩm vào giỏ hàng
router.route('/')
  .get(cartController.getCart)
  .post(cartController.addToCart);

// [POST] /api/carts/merge - Đồng bộ giỏ hàng từ Guest (Local) sang User khi đăng nhập
router.post('/merge', cartController.mergeCart);

// [PUT]    /api/carts/items - Cập nhật số lượng sản phẩm trong giỏ
// [DELETE] /api/carts/items/:id - Xóa sản phẩm khỏi giỏ hàng
router.put('/items', cartController.updateCartItem);
router.delete('/items/:cart_item_id', cartController.removeCartItem);

module.exports = router;