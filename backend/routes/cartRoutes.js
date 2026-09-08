const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken);

router.get('/cart', cartController.getCart);
router.post('/cart', cartController.addToCart);
router.post('/cart/merge', cartController.mergeCart);
router.put('/cart/item', cartController.updateCartItem);
router.delete('/cart/item/:cart_item_id', cartController.removeCartItem);

module.exports = router;