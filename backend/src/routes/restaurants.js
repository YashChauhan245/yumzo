const express = require('express');
const { body } = require('express-validator');
const {
  getAllRestaurants,
  getMenuByRestaurant,
  addRestaurant,
} = require('../controllers/restaurantController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation rules for creating a restaurant
const restaurantValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Restaurant name is required')
    .isLength({ max: 150 })
    .withMessage('Name must be 150 characters or fewer'),

  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),

  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required')
    .isLength({ max: 80 })
    .withMessage('City must be 80 characters or fewer'),

  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 1000 })
    .withMessage('Description must be 1000 characters or fewer'),

  body('cuisine_type')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 80 })
    .withMessage('Cuisine type must be 80 characters or fewer'),

  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),

  body('image_url')
    .optional({ nullable: true, checkFalsy: true })
    .isURL()
    .withMessage('image_url must be a valid URL'),
];

// ── Public routes ─────────────────────────────────────────────────────────────

// GET /api/restaurants          – list all active restaurants
router.get('/', getAllRestaurants);

// GET /api/restaurants/:id/menu – get menu for a restaurant
router.get('/:id/menu', getMenuByRestaurant);

// ── Protected routes (admin only) ─────────────────────────────────────────────

// POST /api/restaurants         – add a new restaurant
router.post(
  '/',
  authenticate,
  authorize('admin', 'restaurant_owner'),
  restaurantValidation,
  addRestaurant,
);

module.exports = router;
