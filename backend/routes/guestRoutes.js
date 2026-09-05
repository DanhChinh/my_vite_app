const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const guestController = require('../controllers/guestController');

router.post('/login', authController.login);
router.get('/categories', guestController.getCategories);
router.get('/products', guestController.getProducts);

module.exports = router;
