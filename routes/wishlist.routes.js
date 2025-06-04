const express = require('express');
const router = express.Router();
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require('../controllers/wishlist.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.get('/', verifyToken, getWishlist);
router.post('/add', verifyToken, addToWishlist);
router.post('/remove', verifyToken, removeFromWishlist);

module.exports = router;
