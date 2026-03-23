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

module.exports = router;
