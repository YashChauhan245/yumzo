const express = require('express');
const { body } = require('express-validator');
const { handlePayment, getPaymentStatus } = require('../controllers/paymentController');
const { authenticate, requireCustomer } = require('../middleware/auth');

const router = express.Router();

// All payment routes require authentication
router.use(authenticate, requireCustomer);

// Validation for payment request
const paymentValidation = [
  body('payment_method')
    .notEmpty()
    .withMessage('payment_method is required')
    .isIn(['card', 'upi', 'cash_on_delivery'])
    .withMessage('payment_method must be one of: card, upi, cash_on_delivery'),

  body('payment_details')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .withMessage('payment_details must be a string'),
];

// POST /api/payments/:orderId - process payment for an order
router.post('/:orderId', paymentValidation, handlePayment);

// GET  /api/payments/:orderId - get payment status for an order
router.get('/:orderId', getPaymentStatus);

module.exports = router;
