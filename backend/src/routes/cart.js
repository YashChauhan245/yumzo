const express = require('express');
const { body } = require('express-validator');
const {
  getCart,
  addToCart,
  updateQuantity,
  removeItem,
  clearCart,
} = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All cart routes require authentication
router.use(authenticate);

// Validation for adding to cart
const addToCartValidation = [
  body('menu_item_id')
    .trim()
    .notEmpty()
    .withMessage('menu_item_id is required')
    .isUUID()
    .withMessage('menu_item_id must be a valid UUID'),

  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
];

// Validation for updating quantity
const updateQuantityValidation = [
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
];

// GET  /api/cart          – view cart
router.get('/', getCart);

// POST /api/cart          – add item (or increment quantity)
router.post('/', addToCartValidation, addToCart);

// PUT  /api/cart/:itemId  – set quantity of an existing cart item
router.put('/:itemId', updateQuantityValidation, updateQuantity);

// DELETE /api/cart/:itemId – remove a single item
router.delete('/:itemId', removeItem);

// DELETE /api/cart        – clear the entire cart
router.delete('/', clearCart);

module.exports = router;
