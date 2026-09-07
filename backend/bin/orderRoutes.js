const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/orders', verifyToken, customerController.createOrder);

module.exports = router;