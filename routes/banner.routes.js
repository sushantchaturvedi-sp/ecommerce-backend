const express = require('express');
const {
  getAllBanners,
  createBanner,
  deleteBanner,
} = require('../controllers/banner.controller');
const upload = require('../middleware/upload.middleware');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// @route   GET /api/banners
// @desc    Fetch all banners
// @access  Public
router.get('/', getAllBanners);

// @route   POST /api/banners
// @desc    Create a new banner (with image upload)
// @access  Admin only
router.post(
  '/',
  protect,
  authorize('admin'),
  upload.single('image'),
  createBanner
);

// @route   DELETE /api/banners/:id
// @desc    Delete a banner by ID
// @access  Admin only
router.delete('/:id', protect, authorize('admin'), deleteBanner);

module.exports = router;
