const express = require('express');
const { body } = require('express-validator');
const {
  placeOrder,
  getOrderHistory,
  getOrder,
} = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All order routes require authentication
router.use(authenticate);

// Validation for placing an order
const placeOrderValidation = [
  body('delivery_address')
    .trim()
    .notEmpty()
    .withMessage('Delivery address is required'),

  body('notes')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 500 })
    .withMessage('Notes must be 500 characters or fewer'),
];

// POST /api/orders        – place order from cart
router.post('/', placeOrderValidation, placeOrder);

// GET  /api/orders        – order history
router.get('/', getOrderHistory);

// GET  /api/orders/:id    – single order with line items
router.get('/:id', getOrder);

module.exports = router;
