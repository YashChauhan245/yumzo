const { validationResult } = require('express-validator');
const OrderModel = require('../models/order');
const CartItemModel = require('../models/cartItem');
const MenuItemModel = require('../models/menuItem');

/**
 * POST /api/orders
 * Place an order from the current cart.
 * Body: { delivery_address, notes? }
 */
const placeOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const { delivery_address, notes } = req.body;
    const userId = req.user.id;

    // Load the user's cart
    const cartItems = await CartItemModel.getByUser(userId);
    if (cartItems.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Cart is empty. Add items before placing an order.' });
    }

    // Ensure all items belong to the same restaurant
    const restaurantIds = [...new Set(cartItems.map((i) => i.restaurant_id))];
    if (restaurantIds.length > 1) {
      return res.status(400).json({
        success: false,
        message: 'All cart items must belong to the same restaurant.',
      });
    }

    const restaurantId = restaurantIds[0];

    // Verify each menu item is still available
    for (const ci of cartItems) {
      const menuItem = await MenuItemModel.findById(ci.menu_item_id);
      if (!menuItem || !menuItem.is_available) {
        return res.status(400).json({
          success: false,
          message: `"${ci.item_name}" is no longer available. Please update your cart.`,
        });
      }
    }

    // Build order line items (use current DB price as source of truth)
    const items = cartItems.map((ci) => ({
      menuItemId: ci.menu_item_id,
      name: ci.item_name,
      price: parseFloat(ci.price),
      quantity: ci.quantity,
    }));

    const order = await OrderModel.createOrder({
      userId,
      restaurantId,
      deliveryAddress: delivery_address,
      notes,
      items,
    });

    // Clear the cart after a successful order
    await CartItemModel.clearCart(userId);

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: { order },
    });
  } catch (err) {
    console.error('placeOrder error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * GET /api/orders
 * Return all orders for the authenticated user (newest first).
 */
const getOrderHistory = async (req, res) => {
  try {
    const orders = await OrderModel.findByUser(req.user.id);
    return res.status(200).json({
      success: true,
      count: orders.length,
      data: { orders },
    });
  } catch (err) {
    console.error('getOrderHistory error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * GET /api/orders/:id
 * Return a single order with its line items.
 */
const getOrder = async (req, res) => {
  try {
    const order = await OrderModel.findById(req.params.id, req.user.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    return res.status(200).json({ success: true, data: { order } });
  } catch (err) {
    console.error('getOrder error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { placeOrder, getOrderHistory, getOrder };
