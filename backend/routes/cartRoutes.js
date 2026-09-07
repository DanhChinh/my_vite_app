const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController'); 

const {verifyToken, verifyCustomer} = require("../middlewares/authMiddleware")


router.get('/',  cartController.getCart);
router.post('/add',  cartController.addToCart);
router.post('/merge', verifyToken, verifyCustomer, cartController.mergeGuestCart);

module.exports = router;