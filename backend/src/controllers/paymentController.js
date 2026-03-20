const { validationResult } = require('express-validator');
const OrderModel = require('../models/order');
const PaymentModel = require('../models/payment');
const { processPayment } = require('../services/mockPaymentGateway');

/**
 * POST /api/payments/:orderId
 * Process a (mock) payment for an order.
 * Body: { payment_method, payment_details? }
 *
 * - Verifies the order belongs to the authenticated user and is still pending.
 * - Calls the mock gateway.
 * - Persists a payment record and updates the order status.
 */
const initiatePayment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const { orderId } = req.params;
    const { payment_method, payment_details = '' } = req.body;
    const userId = req.user.id;

    // Load and authorise the order
    const order = await OrderModel.findById(orderId, userId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be paid — current status is "${order.status}".`,
      });
    }

    // Check for an existing successful payment (idempotency guard)
    const existingPayment = await PaymentModel.findByOrderId(orderId);
    if (existingPayment && existingPayment.payment_status === 'success') {
      return res.status(400).json({
        success: false,
        message: 'This order has already been paid.',
      });
    }

    // ── Call the mock gateway ──────────────────────────────────────────────────
    const gatewayResult = processPayment({
      paymentMethod: payment_method,
      paymentDetails: payment_details,
    });

    const paymentStatus = gatewayResult.success ? 'success' : 'failed';
    const newOrderStatus = gatewayResult.success ? 'confirmed' : 'pending';

    // ── Persist payment record ─────────────────────────────────────────────────
    const payment = await PaymentModel.create({
      orderId,
      userId,
      amount: parseFloat(order.total_amount),
      paymentMethod: payment_method,
      paymentStatus,
      transactionId: gatewayResult.transactionId,
      failureReason: gatewayResult.failureReason,
    });

    // ── Update order status ────────────────────────────────────────────────────
    if (gatewayResult.success) {
      await OrderModel.updateStatus(orderId, newOrderStatus);
    }

    const statusCode = gatewayResult.success ? 200 : 402;
    return res.status(statusCode).json({
      success: gatewayResult.success,
      message: gatewayResult.success ? 'Payment successful' : 'Payment failed',
      data: { payment },
    });
  } catch (err) {
    console.error('initiatePayment error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * GET /api/payments/:orderId
 * Return the payment record for an order (owner only).
 */
const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    // Authorise: verify the order belongs to this user
    const order = await OrderModel.findById(orderId, userId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const payment = await PaymentModel.findByOrderId(orderId);
    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: 'No payment found for this order' });
    }

    return res.status(200).json({ success: true, data: { payment } });
  } catch (err) {
    console.error('getPaymentStatus error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { initiatePayment, getPaymentStatus };
