const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
});

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;
