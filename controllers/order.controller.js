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

// @desc    Get orders of the logged-in user
// @route   GET /api/orders/my
// @access  Private

exports.getUserOrders = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = 5;
  const skip = (page - 1) * limit;

  const userId = req.user._id;

  const orders = await Order.aggregate([
    {
      $match: { user: userId },
    },
    {
      $unwind: '$items',
    },
    {
      $lookup: {
        from: 'products',
        localField: 'items.productId',
        foreignField: '_id',
        as: 'productDetails',
      },
    },
    {
      $unwind: {
        path: '$productDetails',
      },
    },
    {
      $addFields: {
        'items.name': '$productDetails.name',
        'items.image': {
          $cond: {
            if: {
              $gt: [{ $size: { $ifNull: ['$productDetails.images', []] } }, 0],
            },
            then: { $arrayElemAt: ['$productDetails.images', 0] },
            else: '',
          },
        },
      },
    },
    {
      $group: {
        _id: '$_id',
        shippingAddress: { $first: '$shippingAddress' },
        user: { $first: '$user' },
        paymentMethod: { $first: '$paymentMethod' },
        totalAmount: { $first: '$totalAmount' },
        status: { $first: '$status' },
        createdAt: { $first: '$createdAt' },
        updatedAt: { $first: '$updatedAt' },
        __v: { $first: '$__v' },
        items: { $push: '$items' },
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
    {
      $project: {
        _id: 1,
        shippingAddress: 1,
        user: 1,
        items: 1,
        paymentMethod: 1,
        totalAmount: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
        __v: 1,
      },
    },
  ]);

  res.status(200).json({
    success: true,
    page,
    limit,
    data: orders,
  });
});
