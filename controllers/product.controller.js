const Product = require('../models/Product.models.js');
const asyncHandler = require('../middleware/async.middleware.js');

exports.createProduct = asyncHandler(async function (req, res) {
  const productData = req.body;

  if (req.file) {
    productData.image = req.file.path;
  }

  const product = new Product(productData);
  await product.save();

  res.status(201).json(product);
});

exports.getAllProducts = asyncHandler(async function (req, res) {
  const products = await Product.find();
  res.status(200).json(products);
});

exports.getProductById = asyncHandler(async function (req, res) {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.status(200).json(product);
});

exports.updateProduct = asyncHandler(async function (req, res) {
  const productData = req.body;

  if (req.file) {
    productData.image = req.file.path;
  }

  const updated = await Product.findByIdAndUpdate(req.params.id, productData, {
    new: true,
  });

  if (!updated) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.status(200).json(updated);
});

exports.deleteProduct = asyncHandler(async function (req, res) {
  const deleted = await Product.findByIdAndDelete(req.params.id);

  if (!deleted) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.status(200).json({ message: 'Product deleted successfully' });
});
