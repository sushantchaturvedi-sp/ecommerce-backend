const express = require('express');
const router = express.Router();
const { placeOrder } = require('../controllers/order.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/checkout', protect, placeOrder);

module.exports = router;
