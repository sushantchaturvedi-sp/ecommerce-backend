import express from 'express';
import {
  createCoupon,
  validateCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
} from '../controllers/coupons.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
 
const router = express.Router();
 
// @route   POST /api/coupons
// @desc    Create new coupon (Admin only)
// @access  Private/Admin
router.post('/', protect, authorize('admin'), createCoupon);
 
// @route   POST /api/coupons/validate
// @desc    Validate a coupon during checkout
// @access  Private
router.post('/validate', protect, validateCoupon);
 
// @route   GET /api/coupons
// @desc    Get all coupons (Admin only)
// @access  Private/Admin
router.get('/', protect, authorize('admin'), getAllCoupons);
 
// @route   GET /api/coupons/:id
// @desc    Get a single coupon by ID (Admin only)
// @access  Private/Admin
router.get('/:id', protect, authorize('admin'), getCouponById);
 
// @route   PUT /api/coupons/:id
// @desc    Update coupon by ID (Admin only)
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), updateCoupon);
 
// @route   DELETE /api/coupons/:id
// @desc    Delete coupon by ID (Admin only)
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), deleteCoupon);
 
export default router;