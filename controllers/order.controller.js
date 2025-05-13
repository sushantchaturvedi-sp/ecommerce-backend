const asyncHandler = require('../middleware/async.middleware');
const Order = require('../models/Order.models');
const Cart = require('../models/Cart.models');

// @desc    Place a new order
// @route   POST /api/orders/checkout
// @access  Private

exports.placeOrder = asyncHandler(async (req, res) => {
  const { items, paymentMethod, shippingAddress } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart is empty' });
  }

  if (!shippingAddress?.street) {
    return res
      .status(400)
      .json({ success: false, message: 'Shipping address not found' });
  }

  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  const order = await Order.create({
    user: req.user._id,
    items,
    shippingAddress,
    paymentMethod,
    totalAmount,
  });

  // Clear the cart after successful order placement

  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    await cart.save();
  }

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    data: order,
  });
});
