const { validationResult } = require('express-validator');
const CartItemModel = require('../models/cartItem');
const MenuItemModel = require('../models/menuItem');

/**
 * GET /api/cart
 * Return the authenticated user's cart with item details.
 */
const getCart = async (req, res) => {
  try {
    const items = await CartItemModel.getByUser(req.user.id);

    const totalAmount = items.reduce(
      (sum, i) => sum + parseFloat(i.price) * i.quantity,
      0,
    );

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

/**
 * POST /api/cart
 * Add a menu item to the cart (or increment quantity).
 * Body: { menu_item_id, quantity? }
 */
const addToCart = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const { menu_item_id, quantity = 1 } = req.body;

    // Verify menu item exists and is available
    const menuItem = await MenuItemModel.findById(menu_item_id);
    if (!menuItem) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    if (!menuItem.is_available) {
      return res
        .status(400)
        .json({ success: false, message: 'Menu item is currently unavailable' });
    }

    const cartItem = await CartItemModel.upsertItem({
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

/**
 * PUT /api/cart/:itemId
 * Update the quantity of a cart item.
 * Body: { quantity }
 */
const updateQuantity = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const updated = await CartItemModel.updateQuantity(itemId, req.user.id, quantity);
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

/**
 * DELETE /api/cart/:itemId
 * Remove a single item from the cart.
 */
const removeItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const deleted = await CartItemModel.removeItem(itemId, req.user.id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    return res.status(200).json({ success: true, message: 'Item removed from cart' });
  } catch (err) {
    console.error('removeItem error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * DELETE /api/cart
 * Clear all items from the authenticated user's cart.
 */
const clearCart = async (req, res) => {
  try {
    await CartItemModel.clearCart(req.user.id);
    return res.status(200).json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    console.error('clearCart error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getCart, addToCart, updateQuantity, removeItem, clearCart };
