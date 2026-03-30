const { validationResult } = require('express-validator');
const prismaOrderService = require('../services/prismaOrderService');
const prismaPaymentService = require('../services/prismaPaymentService');
const { processPayment } = require('../services/mockPaymentGateway');

// POST /api/user/payments/:orderId - pay for an order
const handlePayment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const { orderId } = req.params;
    const { payment_method, payment_details = '' } = req.body;
    const userId = req.user.id;

    // Make sure the order exists and belongs to this user
    const order = await prismaOrderService.findById(orderId, userId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Only pending orders can be paid
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be paid — current status is "${order.status}".`,
      });
    }

    // Don't process payment if it was already paid successfully
    const existingPayment = await prismaPaymentService.findByOrderId(orderId);
    if (existingPayment && existingPayment.payment_status === 'success') {
      return res.status(400).json({
        success: false,
        message: 'This order has already been paid.',
      });
    }

    // Call the mock payment gateway
    const gatewayResult = processPayment({
      paymentMethod: payment_method,
      paymentDetails: payment_details,
    });

    const paymentStatus = gatewayResult.success ? 'success' : 'failed';

    // Save the payment record
    const payment = await prismaPaymentService.savePayment({
      orderId,
      userId,
      amount: parseFloat(order.total_amount),
      paymentMethod: payment_method,
      paymentStatus,
      transactionId: gatewayResult.transactionId,
      failureReason: gatewayResult.failureReason,
    });

    // Update order status to confirmed if payment succeeded
    if (gatewayResult.success) {
      await prismaOrderService.updateStatus(orderId, 'confirmed');
    }

    const statusCode = gatewayResult.success ? 200 : 402;
    return res.status(statusCode).json({
      success: gatewayResult.success,
      message: gatewayResult.success ? 'Payment successful' : 'Payment failed',
      data: { payment },
    });
  } catch (err) {
    console.error('handlePayment error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/user/payments/:orderId - get payment status for an order
const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    // Verify the order belongs to this user
    const order = await prismaOrderService.findById(orderId, userId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const payment = await prismaPaymentService.findByOrderId(orderId);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'No payment found for this order' });
    }

    return res.status(200).json({ success: true, data: { payment } });
  } catch (err) {
    console.error('getPaymentStatus error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { handlePayment, getPaymentStatus };
