const asyncHandler = require('../middleware/async.middleware');
const ErrorResponse = require('../utils/errorResponse.utils');
const Banner = require('../models/Banner.models');
const cloudinary = require('cloudinary').v2;

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
// exports.deleteBanner = asyncHandler(async (req, res, next) => {
//   const banner = await Banner.findById(req.params.id);

//   if (!banner) {
//     return next(new ErrorResponse('Banner not found', 404));
//   }

//   // Delete image from local storage
//   const imagePath = path.join(__dirname, '..', 'public', 'images', path.basename(banner.image));

//   fs.unlink(imagePath, (err) => {
//     if (err) {
//       console.warn(`⚠️ Failed to delete image file from disk: ${err.message}`);
//     }
//   });

//   // Remove banner document
//   await banner.deleteOne();

//   res.status(200).json({ message: 'Banner and image deleted successfully' });
// });
exports.deleteBanner = asyncHandler(async (req, res, next) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    return next(new ErrorResponse('Banner not found', 404));
  }

  const imageUrl = banner.image;
  const segments = imageUrl.split('/');
  const publicIdWithExtension = segments.slice(-2).join('/');
  const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '');

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn(`⚠️ Failed to delete image from Cloudinary: ${err.message}`);
  }

  await banner.deleteOne();
  res
    .status(200)
    .json({ message: 'Banner and image deleted successfully from Cloudinary' });
});
