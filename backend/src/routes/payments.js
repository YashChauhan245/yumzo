const express = require('express');
const { body } = require('express-validator');
const { initiatePayment, getPaymentStatus } = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');
const { SUPPORTED_METHODS } = require('../services/mockPaymentGateway');

const router = express.Router();

// All payment routes require authentication
router.use(authenticate);

// Validation for initiating a payment
const paymentValidation = [
  body('payment_method')
    .notEmpty()
    .withMessage('payment_method is required')
    .isIn(SUPPORTED_METHODS)
    .withMessage(`payment_method must be one of: ${SUPPORTED_METHODS.join(', ')}`),

  body('payment_details')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .withMessage('payment_details must be a string'),
];

// POST /api/payments/:orderId – process payment for an order
router.post('/:orderId', paymentValidation, initiatePayment);

// GET  /api/payments/:orderId – get payment status for an order
router.get('/:orderId', getPaymentStatus);

module.exports = router;
