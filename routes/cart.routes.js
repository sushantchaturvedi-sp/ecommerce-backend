// routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.Controller');

// Add an item to the cart
router.post('/add', cartController.addToCart);

// Remove an item from the cart
router.delete('/remove/:userId/:productId', cartController.removeFromCart);

// Get all items in the cart
router.get('/:userId', cartController.getCart);

// Clear the cart
router.delete('/clear/:userId', cartController.clearCart);

module.exports = router;
