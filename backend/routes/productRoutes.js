const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const {verifyToken, verifyAdmin} = require("../middlewares/authMiddleware")


router.get('/categories', productController.getCategories);
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductDetail);


router.post('/admin/products',verifyToken, verifyAdmin, productController.createProduct);
router.put('/admin/products/:id',verifyToken, verifyAdmin, productController.updateProduct);
router.delete('/admin/products/:id',verifyToken, verifyAdmin, productController.deleteProduct);



module.exports = router;