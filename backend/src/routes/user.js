const express = require('express');
const { body, param } = require('express-validator');
const { authenticate, requireCustomer } = require('../middleware/auth');
const {
  getAllRestaurants,
  getMenuByRestaurant,
  addOrUpdateRestaurantReview,
  getRestaurantReviews,
} = require('../controllers/restaurantController');
const { getCart, addToCart, updateQuantity, removeItem, clearCart } = require('../controllers/cartController');
const { placeOrder, getOrderHistory, getOrder, cancelOrder } = require('../controllers/orderController');
const { handlePayment, getPaymentStatus } = require('../controllers/paymentController');
const { getReels, toggleReelLike, getReelComments, addReelComment } = require('../controllers/reelController');
const { getAddresses, addAddress, editAddress, removeAddress } = require('../controllers/addressController');

const router = express.Router();

// All user routes require JWT + customer role.
router.use(authenticate, requireCustomer);

// Customer features: browse restaurants and menu.
router.get('/restaurants', getAllRestaurants);
router.get('/restaurants/:id/menu', getMenuByRestaurant);
router.get('/restaurants/:id/reviews', [param('id').isUUID().withMessage('restaurant id must be a valid UUID')], getRestaurantReviews);
router.post(
  '/restaurants/:id/reviews',
  [
    param('id').isUUID().withMessage('restaurant id must be a valid UUID'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('rating must be between 1 and 5'),
    body('review_text')
      .optional({ nullable: true, checkFalsy: true })
      .isLength({ max: 300 })
      .withMessage('review_text must be 300 characters or fewer'),
  ],
  addOrUpdateRestaurantReview,
);

// Customer features: addresses.
router.get('/addresses', getAddresses);
router.post(
  '/addresses',
  [
    body('label').optional({ nullable: true, checkFalsy: true }).isLength({ max: 50 }).withMessage('label must be 50 characters or fewer'),
    body('line1').trim().notEmpty().withMessage('line1 is required'),
    body('line2').optional({ nullable: true, checkFalsy: true }).isLength({ max: 120 }).withMessage('line2 must be 120 characters or fewer'),
    body('city').trim().notEmpty().withMessage('city is required'),
    body('state').optional({ nullable: true, checkFalsy: true }).isLength({ max: 80 }).withMessage('state must be 80 characters or fewer'),
    body('postal_code').optional({ nullable: true, checkFalsy: true }).isLength({ max: 20 }).withMessage('postal_code must be 20 characters or fewer'),
    body('is_default').optional().isBoolean().withMessage('is_default must be boolean'),
  ],
  addAddress,
);
router.put(
  '/addresses/:addressId',
  [
    param('addressId').isUUID().withMessage('addressId must be a valid UUID'),
    body('label').optional({ nullable: true, checkFalsy: true }).isLength({ max: 50 }).withMessage('label must be 50 characters or fewer'),
    body('line1').optional().trim().notEmpty().withMessage('line1 cannot be empty'),
    body('line2').optional({ nullable: true, checkFalsy: true }).isLength({ max: 120 }).withMessage('line2 must be 120 characters or fewer'),
    body('city').optional().trim().notEmpty().withMessage('city cannot be empty'),
    body('state').optional({ nullable: true, checkFalsy: true }).isLength({ max: 80 }).withMessage('state must be 80 characters or fewer'),
    body('postal_code').optional({ nullable: true, checkFalsy: true }).isLength({ max: 20 }).withMessage('postal_code must be 20 characters or fewer'),
    body('is_default').optional().isBoolean().withMessage('is_default must be boolean'),
  ],
  editAddress,
);
router.delete('/addresses/:addressId', [param('addressId').isUUID().withMessage('addressId must be a valid UUID')], removeAddress);

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
    body('delivery_address').optional({ nullable: true, checkFalsy: true }).isString().withMessage('delivery_address must be a string'),
    body('address_id').optional({ nullable: true, checkFalsy: true }).isUUID().withMessage('address_id must be a valid UUID'),
    body().custom((value) => {
      const hasDeliveryAddress = Boolean(value?.delivery_address && String(value.delivery_address).trim());
      const hasAddressId = Boolean(value?.address_id && String(value.address_id).trim());
      if (!hasDeliveryAddress && !hasAddressId) {
        throw new Error('Either delivery_address or address_id is required');
      }
      return true;
    }),
    body('notes')
      .optional({ nullable: true, checkFalsy: true })
      .isLength({ max: 500 })
      .withMessage('Notes must be 500 characters or fewer'),
  ],
  placeOrder,
);
router.get('/orders', getOrderHistory);
router.get('/orders/:id', getOrder);
router.patch(
  '/orders/:id/cancel',
  [
    param('id').isUUID().withMessage('id must be a valid UUID'),
    body('reason')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .isLength({ max: 200 })
      .withMessage('reason must be 200 characters or fewer'),
  ],
  cancelOrder,
);

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
