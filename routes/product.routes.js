const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller.js');
const { protect, authorize } = require('../middleware/auth.middleware.js');
const upload = require('../middleware/upload.middleware.js');

//CRUD
router.post(
  '/',
  protect,
  authorize('admin'),
  upload.array('image', 10),
  productController.createProduct
);
router.get(
  '/',
  // protect,
  // authorize('admin'), //To authorize admin to view the panel
  productController.getAllProducts
);
router.get('/:id', productController.getProductById);
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  productController.deleteProduct
);

// Upload product image
router.put(
  '/:id',
  protect,
  authorize('admin'),
  upload.array('image', 10),
  productController.updateProduct
);

module.exports = router;
