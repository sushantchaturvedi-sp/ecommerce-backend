const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getUserOrders,
} = require('../controllers/order.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/checkout', protect, placeOrder);

router.get('/my', protect, getUserOrders);

module.exports = router;
