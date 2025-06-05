const Wishlist = require('../models/Wishlist.model');
const Product = require('../models/Product.models');
const asyncHandler = require('../middleware/async.middleware');
const ErrorResponse = require('../utils/errorResponse.utils');


exports.getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user.id }).populate(
    'products'
  );
  res.status(200).json(wishlist?.products || []);
});

exports.addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id;

  const product = await Product.findById(productId);
  if (!product) {
    throw new ErrorResponse('Product not found', 404);
  }

  let wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    wishlist = new Wishlist({ user: userId, products: [productId] });
  } else {
    const alreadyExists = wishlist.products.some(
      (p) => p && p.toString() === productId
    );
    if (!alreadyExists) {
      wishlist.products.push(productId);
    }
  }

  await wishlist.save();

  const populatedWishlist = await Wishlist.findById(wishlist._id).populate('products');

  res.status(200).json({
    message: 'Product added to wishlist',
    wishlist: populatedWishlist,
  });
});


exports.removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    throw new ErrorResponse('Product ID is required', 400);
  }

  const updatedWishlist = await Wishlist.findOneAndUpdate(
    { user: req.user.id },
    { $pull: { products: productId } }, 
    { new: true }
  ).populate('products');

  if (!updatedWishlist) {
    throw new ErrorResponse('Wishlist not found', 404);
  }

  res.status(200).json({
    message: 'Product removed from wishlist',
    wishlist: updatedWishlist,
  });
});