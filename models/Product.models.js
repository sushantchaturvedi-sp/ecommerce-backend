const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    images: [{ type: String }],

    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,

      required: true,
    },
    stock: {
      type: Number,
      // default: 0,
      required: false,
    },
    sku: {
      type: String,
      required: false,
    },
    deletedOn: {
      type: Date,
    },
    orderCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);

// const ProductModel = mongoose.model('Product', productSchema);

// module.exports = {ProductModel};
