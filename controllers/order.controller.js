const Order = require('../models/Order.models');
const ErrorResponse = require('../utils/errorResponse.utils');

// @desc    Place a new order
// @route   POST /api/orders/checkout
// @access  Private
exports.placeOrder = async (req, res, next) => {
  const { items, paymentMethod } = req.body;

  if (!items || items.length === 0) {
    return next(new ErrorResponse('Cart is empty', 400));
  }

  try {
    const user = req.user;

    if (!user.shippingAddress || !user.shippingAddress.street) {
      return next(new ErrorResponse('Shipping address not found', 400));
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
  } catch (err) {
    console.error('Error placing order:', err);
    next(new ErrorResponse('Failed to place order', 500));
  }
};
