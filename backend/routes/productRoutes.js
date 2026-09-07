const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');

// Public Products

router.get('/categories', categoryController.getCategories);

router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductDetail);



module.exports = router;