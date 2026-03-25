const { validationResult } = require('express-validator');
const prismaCartService = require('../services/prismaCartService');

const cartService = prismaCartService;
const menuService = { findById: prismaCartService.findMenuItemById };

// GET /api/user/cart - return the logged in customer's cart
const getCart = async (req, res) => {
  try {
    // Step 1: Load all cart rows for logged-in user.
    const items = await cartService.getByUser(req.user.id);

    // Step 2: Calculate total price with a simple loop operation.
    const totalAmount = items.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0);

    return res.status(200).json({
      success: true,
      count: items.length,
      data: {
        items,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
      },
    });
  } catch (err) {
    console.error('getCart error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/user/cart - add item to cart (or increment quantity)
const addToCart = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const { menu_item_id, quantity = 1 } = req.body;

    // Step 1: Check menu item exists and is available.
    const menuItem = await menuService.findById(menu_item_id);
    if (!menuItem) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    if (!menuItem.is_available) {
      return res.status(400).json({ success: false, message: 'Menu item is currently unavailable' });
    }

    // Step 2: Add or increase quantity in cart.
    const cartItem = await cartService.upsertItem({
      userId: req.user.id,
      menuItemId: menu_item_id,
      restaurantId: menuItem.restaurant_id,
      quantity,
    });

    return res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: { cartItem },
    });
  } catch (err) {
    console.error('addToCart error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PUT /api/user/cart/:itemId - update quantity of a cart item
const updateQuantity = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    // Update quantity for only this user's item.
    const updated = await cartService.updateQuantity(itemId, req.user.id, quantity);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Cart item updated',
      data: { cartItem: updated },
    });
  } catch (err) {
    console.error('updateQuantity error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE /api/user/cart/:itemId - remove a single item from cart
const removeItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const deleted = await cartService.removeItem(itemId, req.user.id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    return res.status(200).json({ success: true, message: 'Item removed from cart' });
  } catch (err) {
    console.error('removeItem error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE /api/user/cart - clear the entire cart
const clearCart = async (req, res) => {
  try {
    // Delete every cart row for current user.
    await cartService.clearCart(req.user.id);
    return res.status(200).json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    console.error('clearCart error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getCart, addToCart, updateQuantity, removeItem, clearCart };
