const Coupon = require('../models/coupons.models');
const asyncHandler = require('../middleware/async.middleware');
const ErrorResponse = require('../utils/errorResponse.utils');
 
// @desc    Add a new coupon (Admin)
// @route   POST /api/coupons
// @access  Private/Admin
exports.createCoupon  = asyncHandler(async (req, res, next) => {
  const {
    code,
    discountType,
    discountValue,
    minOrderAmount,
    expiresAt,
    usageLimit,
  } = req.body;
 
  // Check if coupon code already exists
  const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (existingCoupon) {
    return next(new ErrorResponse('Coupon code already exists', 400));
  }
 
  // Create new coupon
  const newCoupon = await Coupon.create({
    code: code.toUpperCase(),
    discountType,
    discountValue,
    minOrderAmount,
    expiresAt,
    usageLimit,
  });
 
  res.status(201).json({
    success: true,
    data: newCoupon,
  });
});
 
// @desc    Validate coupon and calculate discount
// @route   POST /api/coupons/validate
// @access  Private
exports.validateCoupon = asyncHandler(async (req, res, next) => {
  const { code, cartTotal } = req.body;
 
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
 
  if (!coupon) {
    return next(new ErrorResponse('Invalid coupon code', 400));
  }
 
  if (new Date(coupon.expiresAt) < new Date()) {
    return next(new ErrorResponse('Coupon has expired', 400));
  }
 
  if (coupon.usedCount >= coupon.usageLimit) {
    return next(new ErrorResponse('Coupon usage limit reached', 400));
  }
 
  if (cartTotal < coupon.minOrderAmount) {
    return next(
      new ErrorResponse(
        `Minimum order amount ₹${coupon.minOrderAmount} required`,
        400
      )
    );
  }
 
  let discount =
    coupon.discountType === 'percentage'
      ? (cartTotal * coupon.discountValue) / 100
      : coupon.discountValue;
 
  discount = Math.min(discount, cartTotal);
 
  res.status(200).json({
    success: true,
    discount,
    newTotal: cartTotal - discount,
  });
});
 
// @desc    Get all coupons (Admin)
// @route   GET /api/coupons
// @access  Private/Admin
exports.getAllCoupons = asyncHandler(async (req, res, next) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
 
  res.status(200).json({
    success: true,
    count: coupons.length,
    data: coupons,
  });
});
 
// @desc    Get single coupon by ID (Admin)
// @route   GET /api/coupons/:id
// @access  Private/Admin
exports.getCouponById = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);
 
  if (!coupon) {
    return next(new ErrorResponse('Coupon not found', 404));
  }
 
  res.status(200).json({
    success: true,
    data: coupon,
  });
});
 
// @desc    Update coupon by ID (Admin)
// @route   PUT /api/coupons/:id
// @access  Private/Admin
exports.updateCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);
 
  if (!coupon) {
    return next(new ErrorResponse('Coupon not found', 404));
  }
 
  // Update fields
  const {
    code,
    discountType,
    discountValue,
    minOrderAmount,
    expiresAt,
    usageLimit,
  } = req.body;
 
  coupon.code = code ? code.toUpperCase() : coupon.code;
  coupon.discountType = discountType || coupon.discountType;
  coupon.discountValue = discountValue !== undefined ? discountValue : coupon.discountValue;
  coupon.minOrderAmount = minOrderAmount !== undefined ? minOrderAmount : coupon.minOrderAmount;
  coupon.expiresAt = expiresAt || coupon.expiresAt;
  coupon.usageLimit = usageLimit !== undefined ? usageLimit : coupon.usageLimit;

  await coupon.save();
 
  res.status(200).json({
    success: true,
    data: coupon,
  });
});
 
// @desc    Delete coupon by ID (Admin)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
exports.deleteCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);
 
  if (!coupon) {
    return next(new ErrorResponse('Coupon not found', 404));
  }
 
  await coupon.remove();
 
  res.status(200).json({
    success: true,
    message: 'Coupon deleted successfully',
  });
});
 
 
// @desc    Delete coupon by ID (Admin)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
exports.deleteCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);
 
  if (!coupon) {
    return next(new ErrorResponse('Coupon not found', 404));
  }
 
  await coupon.deleteOne();
 
  res.status(200).json({
    success: true,
    message: 'Coupon deleted successfully',
  });
});