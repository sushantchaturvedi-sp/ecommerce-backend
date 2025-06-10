const asyncHandler = require('../middleware/async.middleware');
const Order = require('../models/Order.models');
const Cart = require('../models/Cart.models');
const Product = require('../models/Product.models');
const { default: mongoose } = require('mongoose');
const sendEmail = require('../utils/sendEmail.utils');
const User = require('../models/User.models');

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

  // Create the order
  const order = await Order.create({
    user: req.user._id,
    items,
    shippingAddress,
    paymentMethod,
    totalAmount,
  });

  const bulkOps = items.map((item) => ({
    updateOne: {
      filter: { _id: item.productId },
      update: { $inc: { orderCount: item.quantity } },
    },
  }));

  if (bulkOps.length > 0) {
    await Product.bulkWrite(bulkOps);
  }

  // Clear the cart
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $set: { items: [] } },
    { new: true }
  );

  const user = await User.findById(req.user._id);

  const emailContent = `Hi ${user.name || 'Customer'},
                        Thank you for your order! Your order has been placed successfully.
                        Order Details:
                        Order ID: ${order._id}
                        Payment Method: ${paymentMethod}
                        Total Amount: ₹${totalAmount.toFixed(2)}
 
                        Shipping Address:
                        ${shippingAddress.street}, ${shippingAddress.city}
 
                        Items Ordered:
                        ${items.map((item) => `- ${item.name} x ${item.quantity} (₹${item.price})`).join('\n')}
 
                        We will notify you once your order is shipped.
 
                        Thank you for shopping with us!
                        `;

  await sendEmail({
    email: user.email,
    subject: 'Order Confirmation - Your Order with Exclusive',
    message: emailContent,
  });

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
  const userId = new mongoose.Types.ObjectId(req.user._id);

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



// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id).populate('user', 'name email');


  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  order.status = status;
  await order.save();

  if (status === 'Delivered') {
    const user = order.user;


    const deliveryMessage = `Hi ${user.name || 'Customer'},

      Your order (ID: ${order._id}) has been successfully delivered.

      Thank you for shopping with us!

      Regards,
      ${process.env.FROM_NAME}`;

    await sendEmail({
      email: user.email,
      subject: 'Order Delivered - Thank you for your purchase!',
      message: deliveryMessage,
    });


  }


  res.status(200).json({ success: true, message: 'Status updated', data: order });
});

// @desc    Delete an order (Admin)
// @route   DELETE /api/orders/:id
// @access  Private/Admin
exports.deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  await order.deleteOne();
  res.status(200).json({ success: true, message: 'Order deleted' });
});