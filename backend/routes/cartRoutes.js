const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { verifyToken } = require('../middlewares/authMiddleware');

// router.use(verifyToken);

router.get('/carts', verifyToken, cartController.getCart);
router.post('/carts', verifyToken, cartController.addToCart);
router.post('/carts/merge', verifyToken, cartController.mergeCart);
router.put('/carts/item', verifyToken, cartController.updateCartItem);
router.delete('/carts/item/:cart_item_id', verifyToken, cartController.removeCartItem);

module.exports = router;