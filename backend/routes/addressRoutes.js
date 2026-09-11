const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { validate, addressSchema } = require('../middlewares/validateMiddleware');

router.use(verifyToken);

router.route('/')
  .get(addressController.getAddresses)
  .post(validate(addressSchema), addressController.createAddress);

router.route('/:id')
  .put(validate(addressSchema), addressController.updateAddress)
  .delete(addressController.deleteAddress);

router.patch('/:id/default', addressController.setDefaultAddress);

module.exports = router;