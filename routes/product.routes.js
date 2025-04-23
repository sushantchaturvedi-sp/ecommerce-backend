const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller.js');
const { protect, authorize} = require('../middleware/auth.middleware.js');
const upload = require('../middleware/upload.js');



//CRUD
// router.post('/', protect, authorize('admin'), productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
// router.put('/:id', protect, authorize('admin'), productController.updateProduct);
router.delete('/:id', protect, authorize('admin'), productController.deleteProduct);


// Upload product image
router.post('/', protect, authorize('admin'), upload.single('image'), productController.createProduct);
router.put('/:id', protect, authorize('admin'), upload.single('image'), productController.updateProduct);

module.exports = router;
