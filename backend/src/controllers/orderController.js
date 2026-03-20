const { validationResult } = require('express-validator');
const OrderModel = require('../models/order');
const CartItemModel = require('../models/cartItem');
const MenuItemModel = require('../models/menuItem');

// POST /api/orders - place an order from the cart
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
      return res.status(400).json({ success: false, message: 'Cart is empty. Add items before placing an order.' });
    }

    // All items must be from the same restaurant
    const restaurantIds = [...new Set(cartItems.map((i) => i.restaurant_id))];
    if (restaurantIds.length > 1) {
      return res.status(400).json({
        success: false,
        message: 'All cart items must belong to the same restaurant.',
      });
    }

    const restaurantId = restaurantIds[0];

    // Check that each item is still available
    for (const ci of cartItems) {
      const menuItem = await MenuItemModel.findById(ci.menu_item_id);
      if (!menuItem || !menuItem.is_available) {
        return res.status(400).json({
          success: false,
          message: `"${ci.item_name}" is no longer available. Please update your cart.`,
        });
      }
    }

    // Build the order line items
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

    // Clear the cart after ordering
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

// GET /api/orders - get order history for logged in user
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

// GET /api/orders/:id - get a single order with its items
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
