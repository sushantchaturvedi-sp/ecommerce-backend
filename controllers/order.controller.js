const asyncHandler = require('../middleware/async.middleware');
const Order = require('../models/Order.models');

// @desc    Place a new order
// @route   POST /api/orders/checkout
// @access  Private
exports.placeOrder = asyncHandler(async (req, res) => {
  const { items, paymentMethod } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart is empty' });
  }

  const user = req.user;

  if (!user?.shippingAddress?.street) {
    return res
      .status(400)
      .json({ success: false, message: 'Shipping address not found' });
  }

  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  const order = await Order.create({
    user: user._id,
    items,
    shippingAddress: user.shippingAddress,
    paymentMethod,
    totalAmount,
  });

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    data: order,
  });
});
