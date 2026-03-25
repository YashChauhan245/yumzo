const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const prismaAuthService = require('../services/prismaAuthService');
const prismaOrderService = require('../services/prismaOrderService');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const { emitOrderStatusUpdate } = require('../config/socket');

const DRIVER_STATUSES = ['picked_up', 'out_for_delivery', 'delivered'];
const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

// POST /api/driver/login - login endpoint restricted to driver role.
const loginDriver = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    // Step 1: Find user by email
    const user = await prismaAuthService.findByEmail(normalizedEmail);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Step 2: Make sure only driver accounts can use this login endpoint.
    if (user.role !== 'driver' && user.role !== 'delivery_agent') {
      return res.status(403).json({ success: false, message: 'Only driver accounts can login here' });
    }

    // Step 3: Verify password.
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: 'driver',
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    const { password: _hiddenPassword, ...safeUser } = user;
    safeUser.role = 'driver';

    return res.status(200).json({
      success: true,
      message: 'Driver login successful',
      data: {
        user: safeUser,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('loginDriver error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/driver/orders/available - unassigned orders drivers can accept.
const getAvailableOrders = async (_req, res) => {
  try {
    const orders = await prismaOrderService.findAvailableForDriver();

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: { orders },
    });
  } catch (error) {
    console.error('getAvailableOrders error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/driver/orders/:orderId/accept - assign current driver to an order.
const acceptOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const order = await prismaOrderService.acceptOrder({
      orderId: req.params.orderId,
      driverId: req.user.id,
    });

    if (!order) {
      return res.status(400).json({
        success: false,
        message: 'Order is not available for acceptance',
      });
    }

    emitOrderStatusUpdate({
      id: order.id,
      user_id: order.user_id,
      driver_id: order.driver_id,
      status: order.status,
      updated_at: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      message: 'Order accepted successfully',
      data: { order },
    });
  } catch (error) {
    console.error('acceptOrder error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/driver/orders/:orderId/reject - release assigned order back to queue.
const rejectOrder = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const reason = String(req.body?.reason || '').trim();

    const order = await prismaOrderService.rejectAssignedOrder({
      orderId: req.params.orderId,
      driverId: req.user.id,
      reason,
    });

    if (!order) {
      return res.status(400).json({
        success: false,
        message: 'Only preparing assigned orders can be rejected',
      });
    }

    emitOrderStatusUpdate({
      id: order.id,
      user_id: order.user_id,
      driver_id: order.driver_id,
      status: order.status,
      updated_at: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      message: 'Order rejected and returned to available queue',
      data: { order },
    });
  } catch (error) {
    console.error('rejectOrder error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/driver/orders/assigned - orders currently assigned to this driver.
const getAssignedOrders = async (req, res) => {
  try {
    const orders = await prismaOrderService.findAssignedToDriver(req.user.id);

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: { orders },
    });
  } catch (error) {
    console.error('getAssignedOrders error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PATCH /api/driver/orders/:orderId/status - driver updates delivery status.
const updateAssignedOrderStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const { status } = req.body;

    if (!DRIVER_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status for driver update',
      });
    }

    const order = await prismaOrderService.updateDriverOrderStatus({
      orderId: req.params.orderId,
      driverId: req.user.id,
      status,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Assigned order not found',
      });
    }

    emitOrderStatusUpdate({
      id: order.id,
      user_id: order.user_id,
      driver_id: order.driver_id,
      status: order.status,
      updated_at: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: { order },
    });
  } catch (error) {
    console.error('updateAssignedOrderStatus error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  loginDriver,
  getAvailableOrders,
  acceptOrder,
  rejectOrder,
  getAssignedOrders,
  updateAssignedOrderStatus,
};
