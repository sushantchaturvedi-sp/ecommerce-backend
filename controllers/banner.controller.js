const path = require('path');
const fs = require('fs');
const asyncHandler = require('../middleware/async.middleware');
const ErrorResponse = require('../utils/errorResponse.utils');
const Banner = require('../models/Banner.models');

// @desc    Get all banners
// @route   GET /api/v1/banners
// @access  Public
exports.getAllBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find();
  res.status(200).json(banners);
});

// @desc    Create a new banner
// @route   POST /api/v1/banners
// @access  Admin
exports.createBanner = asyncHandler(async (req, res, next) => {
  const { productId } = req.body;

  if (!req.file) {
    return next(new ErrorResponse('Image is required', 400));
  }

  const newBanner = new Banner({
    image: req.file.path,
    productId,
  });

  const created = await newBanner.save();
  res.status(201).json(created);
});

// @desc    Delete a banner
// @route   DELETE /api/v1/banners/:id
// @access  Admin
exports.deleteBanner = asyncHandler(async (req, res, next) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    return next(new ErrorResponse('Banner not found', 404));
  }

  // Attempt to delete the image file from disk
  const imagePath = path.join(__dirname, '../public', banner.image);
  fs.unlink(imagePath, (err) => {
    if (err) {
      console.warn(`Failed to delete image file: ${err.message}`);
    }
  });

  await banner.deleteOne();
  res.status(200).json({ message: 'Banner deleted successfully' });
});
