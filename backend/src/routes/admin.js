const express = require('express');
const { body, param, query } = require('express-validator');
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getDashboard,
  getRestaurants,
  createRestaurant,
  editRestaurant,
  removeRestaurant,
  getMenuItems,
  createMenuItem,
  editMenuItem,
  removeMenuItem,
  getOrdersOverview,
  updateOrderStatus,
} = require('../controllers/adminController');

const router = express.Router();

router.use(authenticate, requireAdmin);

const restaurantValidation = [
  body('name').trim().notEmpty().withMessage('name is required'),
  body('address').trim().notEmpty().withMessage('address is required'),
  body('city').trim().notEmpty().withMessage('city is required'),
  body('description').optional({ nullable: true }).isLength({ max: 1000 }).withMessage('description too long'),
  body('cuisine_type').optional({ nullable: true }).isLength({ max: 80 }).withMessage('cuisine_type too long'),
  body('phone').optional({ nullable: true, checkFalsy: true }).isString().withMessage('phone must be a string'),
  body('image_url').optional({ nullable: true, checkFalsy: true }).isURL().withMessage('image_url must be valid URL'),
];

const restaurantUpdateValidation = [
  param('restaurantId').isUUID().withMessage('restaurantId must be valid UUID'),
  body('name').optional().trim().notEmpty().withMessage('name cannot be empty'),
  body('address').optional().trim().notEmpty().withMessage('address cannot be empty'),
  body('city').optional().trim().notEmpty().withMessage('city cannot be empty'),
  body('description').optional({ nullable: true }).isLength({ max: 1000 }).withMessage('description too long'),
  body('cuisine_type').optional({ nullable: true }).isLength({ max: 80 }).withMessage('cuisine_type too long'),
  body('phone').optional({ nullable: true, checkFalsy: true }).isString().withMessage('phone must be a string'),
  body('image_url').optional({ nullable: true, checkFalsy: true }).isURL().withMessage('image_url must be valid URL'),
  body('is_active').optional().isBoolean().withMessage('is_active must be boolean'),
];

const menuCreateValidation = [
  body('restaurant_id').isUUID().withMessage('restaurant_id must be valid UUID'),
  body('name').trim().notEmpty().withMessage('name is required'),
  body('price').isFloat({ gt: 0 }).withMessage('price must be greater than 0'),
  body('description').optional({ nullable: true }).isLength({ max: 1000 }).withMessage('description too long'),
  body('category').optional({ nullable: true }).isLength({ max: 80 }).withMessage('category too long'),
  body('image_url').optional({ nullable: true, checkFalsy: true }).isURL().withMessage('image_url must be valid URL'),
  body('is_veg').optional().isBoolean().withMessage('is_veg must be boolean'),
  body('is_available').optional().isBoolean().withMessage('is_available must be boolean'),
];

const menuUpdateValidation = [
  param('menuItemId').isUUID().withMessage('menuItemId must be valid UUID'),
  body('name').optional().trim().notEmpty().withMessage('name cannot be empty'),
  body('price').optional().isFloat({ gt: 0 }).withMessage('price must be greater than 0'),
  body('description').optional({ nullable: true }).isLength({ max: 1000 }).withMessage('description too long'),
  body('category').optional({ nullable: true }).isLength({ max: 80 }).withMessage('category too long'),
  body('image_url').optional({ nullable: true, checkFalsy: true }).isURL().withMessage('image_url must be valid URL'),
  body('is_veg').optional().isBoolean().withMessage('is_veg must be boolean'),
  body('is_available').optional().isBoolean().withMessage('is_available must be boolean'),
];

const orderStatusValidation = [
  param('orderId').isUUID().withMessage('orderId must be valid UUID'),
  body('status')
    .trim()
    .notEmpty()
    .withMessage('status is required')
    .isIn(['pending', 'confirmed', 'cancelled'])
    .withMessage('Admin can update only: pending, confirmed, cancelled'),
  body('reason').optional({ nullable: true }).isLength({ max: 200 }).withMessage('reason too long'),
];

router.get('/dashboard', getDashboard);

router.get(
  '/restaurants',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('limit must be a positive integer'),
  ],
  getRestaurants,
);
router.post('/restaurants', restaurantValidation, createRestaurant);
router.put('/restaurants/:restaurantId', restaurantUpdateValidation, editRestaurant);
router.delete('/restaurants/:restaurantId', param('restaurantId').isUUID().withMessage('restaurantId must be valid UUID'), removeRestaurant);

router.get(
  '/menu',
  [
    query('restaurantId').optional().isUUID().withMessage('restaurantId must be valid UUID'),
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('limit must be a positive integer'),
  ],
  getMenuItems,
);
router.post('/menu', menuCreateValidation, createMenuItem);
router.put('/menu/:menuItemId', menuUpdateValidation, editMenuItem);
router.delete('/menu/:menuItemId', param('menuItemId').isUUID().withMessage('menuItemId must be valid UUID'), removeMenuItem);

router.get(
  '/orders',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('limit must be a positive integer'),
  ],
  getOrdersOverview,
);
router.patch('/orders/:orderId/status', orderStatusValidation, updateOrderStatus);

module.exports = router;
