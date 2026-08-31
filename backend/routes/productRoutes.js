// server/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/categories', productController.getCategories);
router.get('/products', productController.getProducts);

module.exports = router;