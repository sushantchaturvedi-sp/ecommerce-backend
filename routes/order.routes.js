const express = require('express');
const router = express.Router();
const {
  updateOrderStatus,
  placeOrder,
  getUserOrders,
  getAllOrders,
  deleteOrder,
} = require('../controllers/order.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
 
router.post('/checkout', protect, placeOrder);
 
router.get('/my', protect, getUserOrders);
 
router.get('/', protect, authorize('admin'), getAllOrders);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);
router.delete('/:id', protect, authorize('admin'), deleteOrder);
 
 
module.exports = router;