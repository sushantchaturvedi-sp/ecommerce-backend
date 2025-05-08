const Cart = require('../models/Cart.models');
const Product = require('../models/Product.models');

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;
    const { items } = req.body; // Accept an array of product items

    if (!userId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Invalid cart data' });
    }

    // Validate each item
    for (const item of items) {
      if (
        !item.productId ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return res
          .status(400)
          .json({ message: 'Invalid product or quantity in item list' });
      }
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
      });
    }

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        continue;
      }

      const index = cart.items.findIndex(
        (i) => i.product.toString() === item.productId
      );

      if (index > -1) {
        cart.items[index].quantity = item.quantity;
      } else {
        cart.items.push({ product: item.productId, quantity: item.quantity });
      }
    }

    await cart.save();
    res.status(200).json({
      message: 'Cart updated successfully',
      cart: cart.items,
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  const { userId, productId } = req.params;

  if (!userId || !productId) {
    return res
      .status(400)
      .json({ message: 'User ID and Product ID are required' });
  }

  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );
    await cart.save();

    res
      .status(200)
      .json({ message: 'Item removed from cart', cart: cart.items });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res
      .status(500)
      .json({ message: 'Internal server error', error: error.message });
  }
};

// Get all items in the cart
exports.getCart = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    res.status(200).json({ cart: cart.items });
  } catch (error) {
    console.error('Get cart error:', error);
    res
      .status(500)
      .json({ message: 'Internal server error', error: error.message });
  }
};

// Clear the cart
exports.clearCart = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res
      .status(500)
      .json({ message: 'Internal server error', error: error.message });
  }
};
