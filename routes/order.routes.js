const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getUserOrders,
  getTopSellingProducts,
} = require('../controllers/order.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/checkout', protect, placeOrder);

router.get('/my', protect, getUserOrders);

router.get('/top-selling', protect, getTopSellingProducts);

module.exports = router;
