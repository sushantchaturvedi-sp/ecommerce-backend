const Product = require('../models/Product.models.js');
const asyncHandler = require('../middleware/async.middleware.js');
const ErrorResponse = require('../utils/errorResponse.utils');

// CREATE a new product

exports.createProduct = asyncHandler(async (req, res) => {
  const productData = req.body;

  // If Cloudinary upload is used via multer
  if (req.files?.length > 0) {
    productData.images = req.files.map((file) => file.path); // file.path is the Cloudinary URL
  }

  const product = new Product(productData);
  await product.save();

  res.status(201).json(product);
});

// GET all products with optional filters, search, sort, and pagination
exports.getAllProducts = asyncHandler(async (req, res) => {
  const {
    category,
    minPrice,
    maxPrice,
    search,
    sort,
    page = 1,
    limit = 10,
  } = req.query;

  const query = { deletedOn: { $exists: false } };
  if (category) {
    query.category = category;
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) {
      query.price.$gte = parseFloat(minPrice);
    }
    if (maxPrice) {
      query.price.$lte = parseFloat(maxPrice);
    }
  }

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  let sortOption = {};

  switch (sort) {
    case 'name_asc':
      sortOption.name = 1;
      break;

    case 'name_desc':
      sortOption.name = -1;
      break;

    case 'price_asc':
      sortOption.price = 1;
      break;

    case 'price_desc':
      sortOption.price = -1;
      break;

    case 'orders_desc':
      sortOption.orderCount = -1;
      break;

    default:
      sortOption.createdAt = -1; // Default sort by newest
      break;
  }

  const pageNumber = parseInt(page);
  const pageSize = parseInt(limit);
  const skip = (pageNumber - 1) * pageSize;

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(pageSize);

  res.status(200).json({
    total,
    page: pageNumber,
    limit: pageSize,
    products,
  });
});

// GET a single product by ID
exports.getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.status(200).json(product);
});

// UPDATE a product

exports.updateProduct = asyncHandler(async (req, res, next) => {
  const productData = req.body;

  if (req.files?.length > 0) {
    productData.images = req.files.map((file) => file.path); // Cloudinary image URLs
  }

  const updated = await Product.findByIdAndUpdate(req.params.id, productData, {
    new: true,
  });

  if (!updated) {
    return next(new ErrorResponse('Product not found', 404));
  }

  res.status(200).json(updated);
});

// DELETE a product
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const deleted = await Product.findByIdAndUpdate(req.params.id, {
    deletedOn: Date.now(),
  });

  if (!deleted) {
    return next(new ErrorResponse('Product not found', 404));
  }

  res.status(200).json({ message: 'Product deleted successfully' });
});
