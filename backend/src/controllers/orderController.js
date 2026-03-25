const { validationResult } = require('express-validator');
const prismaOrderService = require('../services/prismaOrderService');
const prismaCartService = require('../services/prismaCartService');
const prismaAddressService = require('../services/prismaAddressService');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { emitOrderUpdate, emitOrderStatusUpdate } = require('../config/socket');

// POST /api/user/orders - place an order from current cart items
const placeOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const { delivery_address, address_id, notes } = req.body;
    const userId = req.user.id;

    // Step 1: Resolve final delivery address.
    let resolvedAddress = String(delivery_address || '').trim();
    if (address_id) {
      const selectedAddress = await prismaAddressService.findByIdForUser({
        addressId: address_id,
        userId,
      });

      if (!selectedAddress) {
        return res.status(404).json({ success: false, message: 'Selected address not found' });
      }

      resolvedAddress = prismaAddressService.formatAddressText(selectedAddress);
    }

    if (!resolvedAddress) {
      return res.status(400).json({ success: false, message: 'Delivery address is required' });
    }

    // Step 2: Load cart items.
    const cartItems = await prismaCartService.getByUser(userId);
    if (cartItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty. Add items before placing an order.' });
    }

    // Step 3: All cart items must belong to one restaurant.
    const restaurantIds = [...new Set(cartItems.map((i) => i.restaurant_id))];
    if (restaurantIds.length > 1) {
      return res.status(400).json({
        success: false,
        message: 'All cart items must belong to the same restaurant.',
      });
    }

    const restaurantId = restaurantIds[0];

    // Step 4: Validate each menu item is still available.
    for (const ci of cartItems) {
      const menuItem = await prismaCartService.findMenuItemById(ci.menu_item_id);
      if (!menuItem || !menuItem.is_available) {
        return res.status(400).json({
          success: false,
          message: `"${ci.item_name}" is no longer available. Please update your cart.`,
        });
      }
    }

    // Step 5: Build order item payload.
    const items = cartItems.map((ci) => ({
      menuItemId: ci.menu_item_id,
      name: ci.item_name,
      price: parseFloat(ci.price),
      quantity: ci.quantity,
    }));

    // Step 6: Create order and notify via socket.
    const order = await prismaOrderService.createOrder({
      userId,
      restaurantId,
      deliveryAddress: resolvedAddress,
      notes,
      items,
    });

    emitOrderUpdate({
      id: order.id,
      user_id: order.user_id,
      restaurant_id: order.restaurant_id,
      status: order.status,
      created_at: order.created_at,
    });

    // Step 7: Clear cart after successful order creation.
    await prismaCartService.clearCart(userId);

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

// GET /api/user/orders - list order history for logged in user
const getOrderHistory = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query, { defaultLimit: 6, maxLimit: 30 });
    const { rows, total } = await prismaOrderService.findByUser(req.user.id, { skip, limit });

    return res.status(200).json({
      success: true,
      count: rows.length,
      pagination: buildPaginationMeta({ page, limit, total }),
      data: { orders: rows },
    });
  } catch (err) {
    console.error('getOrderHistory error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/user/orders/:id - get a single order with its items
const getOrder = async (req, res) => {
  try {
    const order = await prismaOrderService.findById(req.params.id, req.user.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    return res.status(200).json({ success: true, data: { order } });
  } catch (err) {
    console.error('getOrder error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PATCH /api/user/orders/:id/cancel - customer can cancel own pending/confirmed order
const cancelOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const reason = String(req.body?.reason || '').trim();
    const order = await prismaOrderService.cancelByUser({
      orderId: req.params.id,
      userId: req.user.id,
      reason,
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    emitOrderStatusUpdate({
      id: order.id,
      user_id: order.user_id,
      driver_id: order.driver_id,
      status: order.status,
      updated_at: order.updated_at,
    });

    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order },
    });
  } catch (err) {
    console.error('cancelOrder error:', err);
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { placeOrder, getOrderHistory, getOrder, cancelOrder };
