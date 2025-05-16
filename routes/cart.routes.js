// routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.Controller');

// Add an item to the cart
router.post('/:userId/items', cartController.addToCart);

// Remove an item from the cart
router.delete('/:userId/items/:productId', cartController.removeFromCart);

// Get all items in the cart
router.get('/:userId/items', cartController.getCart);

// Clear the cart
router.delete('/:userId/items', cartController.clearCart);

module.exports = router;
