const path = require('path');
const fs = require('fs');
const asyncHandler = require('../middleware/async.middleware');
const Banner = require('../models/Banner.models');

// @desc    Get all banners
// @route   GET /api/v1/banners
// @access  Public
exports.getAllBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find();
  res.json(banners);
});

// @desc    Create a new banner
// @route   POST /api/v1/banners
// @access  Private (admin)
exports.createBanner = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!req.file) {
    res.status(400);
    throw new Error('Image is required');
  }

  const newBanner = new Banner({
    image: `images/${req.file.filename}`, // stored relative to /public
    productId,
  });

  const created = await newBanner.save();
  res.status(201).json(created);
});

// @desc    Delete a banner
// @route   DELETE /api/v1/banners/:id
// @access  Private (admin)
exports.deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    res.status(404);
    throw new Error('Banner not found');
  }

  const imagePath = path.join(__dirname, '../public', banner.image);
  fs.unlink(imagePath, (err) => {
    if (err) {
      console.warn('Image not deleted:', err.message);
    }
  });

  await banner.deleteOne();
  res.json({ message: 'Banner deleted' });
});
