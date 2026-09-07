const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public/publicController');
const loginController = require('../controllers/authController');

// Public Products

router.get('/categories', publicController.getCategories);

router.get('/products', publicController.getProducts);
router.get('/products/:id', publicController.getProductDetail);

// Guest Cart
// router.get('/cart', publicController.getGuestCart);
// router.post('/cart/add', publicController.addToGuestCart);
// router.put('/cart/update', publicController.updateGuestCartItem);
// router.delete('/cart/item/:cart_item_id', publicController.removeGuestCartItem);

// Guest Checkout & Tracking
router.post('/checkout', publicController.guestCheckout);
router.get('/order-tracking', publicController.trackGuestOrder);

// Guest Authentication
router.post('/login', loginController.login);
router.post('/register', loginController.register);

module.exports = router;