const express = require('express');
const { body, param } = require('express-validator');
const { authenticate, requireCustomer } = require('../middleware/auth');
const { getAllRestaurants, getMenuByRestaurant } = require('../controllers/restaurantController');
const { getCart, addToCart, updateQuantity, removeItem, clearCart } = require('../controllers/cartController');
const { placeOrder, getOrderHistory, getOrder } = require('../controllers/orderController');
const { handlePayment, getPaymentStatus } = require('../controllers/paymentController');
const { getReels, toggleReelLike, getReelComments, addReelComment } = require('../controllers/reelController');

const router = express.Router();

// All user routes require JWT + customer role.
router.use(authenticate, requireCustomer);

// Customer features: browse restaurants and menu.
router.get('/restaurants', getAllRestaurants);
router.get('/restaurants/:id/menu', getMenuByRestaurant);

// Customer features: cart.
router.get('/cart', getCart);
router.post(
  '/cart',
  [
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
  ],
  addToCart,
);
router.put(
  '/cart/:itemId',
  [
    body('quantity')
      .notEmpty()
      .withMessage('Quantity is required')
      .isInt({ min: 1 })
      .withMessage('Quantity must be a positive integer'),
  ],
  updateQuantity,
);
router.delete('/cart/:itemId', removeItem);
router.delete('/cart', clearCart);

// Customer features: order placement, history, tracking.
router.post(
  '/orders',
  [
    body('delivery_address')
      .trim()
      .notEmpty()
      .withMessage('Delivery address is required'),
    body('notes')
      .optional({ nullable: true, checkFalsy: true })
      .isLength({ max: 500 })
      .withMessage('Notes must be 500 characters or fewer'),
  ],
  placeOrder,
);
router.get('/orders', getOrderHistory);
router.get('/orders/:id', getOrder);

// Customer features: payments.
router.post(
  '/payments/:orderId',
  [
    body('payment_method')
      .notEmpty()
      .withMessage('payment_method is required')
      .isIn(['card', 'upi', 'cash_on_delivery'])
      .withMessage('payment_method must be one of: card, upi, cash_on_delivery'),
    body('payment_details')
      .optional({ nullable: true, checkFalsy: true })
      .isString()
      .withMessage('payment_details must be a string'),
  ],
  handlePayment,
);
router.get('/payments/:orderId', getPaymentStatus);

// Customer features: reels feed, likes, comments.
router.get('/reels', getReels);
router.post('/reels/:reelId/like', [param('reelId').isUUID().withMessage('reelId must be a valid UUID')], toggleReelLike);
router.get('/reels/:reelId/comments', [param('reelId').isUUID().withMessage('reelId must be a valid UUID')], getReelComments);
router.post(
  '/reels/:reelId/comments',
  [
    param('reelId').isUUID().withMessage('reelId must be a valid UUID'),
    body('comment')
      .trim()
      .notEmpty()
      .withMessage('comment is required')
      .isLength({ min: 1, max: 280 })
      .withMessage('comment must be between 1 and 280 characters'),
  ],
  addReelComment,
);

module.exports = router;
