const express = require('express');
const { body, param } = require('express-validator');
const { loginValidation } = require('../middleware/validate');
const { authenticate, requireDriver } = require('../middleware/auth');
const {
  loginDriver,
  getAvailableOrders,
  acceptOrder,
  rejectOrder,
  getAssignedOrders,
  updateAssignedOrderStatus,
  updateLiveOrderLocation,
} = require('../controllers/driverController');

const router = express.Router();

// Driver specific login endpoint.
router.post('/login', loginValidation, loginDriver);

// Everything below requires JWT + driver role.
router.use(authenticate, requireDriver);

const orderIdValidation = [
  param('orderId')
    .isUUID()
    .withMessage('orderId must be a valid UUID'),
];

router.get('/orders/available', getAvailableOrders);
router.post('/orders/:orderId/accept', orderIdValidation, acceptOrder);
router.post(
  '/orders/:orderId/reject',
  [
    ...orderIdValidation,
    body('reason')
      .optional({ nullable: true, checkFalsy: true })
      .trim()
      .isLength({ max: 200 })
      .withMessage('reason must be 200 characters or fewer'),
  ],
  rejectOrder,
);
router.get('/orders/assigned', getAssignedOrders);
router.patch(
  '/orders/:orderId/status',
  [
    ...orderIdValidation,
    body('status')
      .trim()
      .notEmpty()
      .withMessage('status is required')
      .isIn(['picked_up', 'out_for_delivery', 'delivered'])
      .withMessage('status must be one of: picked_up, out_for_delivery, delivered'),
  ],
  updateAssignedOrderStatus,
);
router.patch(
  '/orders/:orderId/location',
  [
    ...orderIdValidation,
    body('latitude')
      .isFloat({ min: -90, max: 90 })
      .withMessage('latitude must be between -90 and 90'),
    body('longitude')
      .isFloat({ min: -180, max: 180 })
      .withMessage('longitude must be between -180 and 180'),
    body('accuracy')
      .optional({ nullable: true })
      .isFloat({ min: 0 })
      .withMessage('accuracy must be a non-negative number'),
    body('heading')
      .optional({ nullable: true })
      .isFloat({ min: 0, max: 360 })
      .withMessage('heading must be between 0 and 360'),
    body('speed')
      .optional({ nullable: true })
      .isFloat({ min: 0 })
      .withMessage('speed must be a non-negative number'),
  ],
  updateLiveOrderLocation,
);

module.exports = router;
