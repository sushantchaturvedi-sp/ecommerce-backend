const path = require('path');
const fs = require('fs');
const Banner = require('../models/Banner.models');

// GET all banners
exports.getAllBanners = async (req, res) => {
  const banners = await Banner.find();
  res.json(banners);
};

// // POST create a new banner
exports.createBanner = async (req, res) => {
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
};

// DELETE a banner
exports.deleteBanner = async (req, res) => {
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
};
