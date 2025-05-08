const asyncHandler = require('../middleware/async.middleware');
const ErrorResponse = require('../utils/errorResponse.utils');
const Cart = require('../models/Cart.models');
const Product = require('../models/Product.models');

// Add items to cart
exports.addToCart = asyncHandler(async (req, res, next) => {
  const userId = req.user?._id || req.body.userId;
  const { items } = req.body;

  if (!userId || !Array.isArray(items) || items.length === 0) {
    return next(new ErrorResponse('Invalid cart data', 400));
  }

  for (const item of items) {
    const { productId, quantity } = item;
    if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
      return next(
        new ErrorResponse('Invalid product or quantity in item list', 400)
      );
    }
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      continue;
    }

    const existingItemIndex = cart.items.findIndex(
      (i) => i.product.toString() === item.productId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity = item.quantity;
    } else {
      cart.items.push({ product: item.productId, quantity: item.quantity });
    }
  }

  await cart.save();

  res.status(200).json({
    message: 'Cart updated successfully',
    cart: cart.items,
  });
});

// Remove item from cart
exports.removeFromCart = asyncHandler(async (req, res, next) => {
  const { userId, productId } = req.params;

  if (!userId || !productId) {
    return next(new ErrorResponse('User ID and Product ID are required', 400));
  }

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  await cart.save();

  res.status(200).json({
    message: 'Item removed from cart',
    cart: cart.items,
  });
});

// Get cart items
exports.getCart = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    return next(new ErrorResponse('User ID is required', 400));
  }

  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }

  res.status(200).json({ cart: cart.items });
});

// Clear entire cart
exports.clearCart = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    return next(new ErrorResponse('User ID is required', 400));
  }

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }

  cart.items = [];
  await cart.save();

  res.status(200).json({ message: 'Cart cleared successfully' });
});
