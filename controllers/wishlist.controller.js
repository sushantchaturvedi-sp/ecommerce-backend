const Wishlist = require('../models/Wishlist.model');
const Product = require('../models/Product.models');
const asyncHandler = require('../middleware/async.middleware');

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
    return res.status(404).json({ message: 'Product not found' });
  }

  let wishlist = await Wishlist.findOne({ user: req.user.id });
  if (!wishlist) {
    wishlist = new Wishlist({ user: userId, products: [product.id] });
  }

  const alreadyExists = wishlist.products.some(
    (p) => p && p.toString() === productId
  );
  if (!alreadyExists) {
    wishlist.products.push(productId);
  }
  await wishlist.save();

  const populatedWishlist = await Wishlist.findById(wishlist._id).populate(
    'products'
  );
  res.status(200).json({
    message: 'Product added to wishlist',
    wishlist: populatedWishlist,
  });
});

exports.removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required' });
  }

  const wishlist = await Wishlist.findOne({ user: req.user.id });

  if (!wishlist) {
    return res.status(404).json({ message: 'Wishlist not found' });
  }

  const initialLength = wishlist.products.length;

  wishlist.products = wishlist.products.filter(
    (id) => id && id.toString() !== productId.toString()
  );

  if (wishlist.products.length === initialLength) {
    return res.status(404).json({ message: 'Product not found in wishlist' });
  }

  await wishlist.save();

  const populatedWishlist = await Wishlist.findById(wishlist._id).populate(
    'products'
  );
  return res.status(200).json({
    message: 'Product removed from wishlist',
    wishlist: populatedWishlist,
  });
});
