const express = require('express');
const { body, param } = require('express-validator');
const {
  createRoom,
  joinRoom,
  getRoom,
  addItem,
  updateItem,
  removeItem,
  checkoutRoom,
} = require('../controllers/groupOrderController');

const router = express.Router();

router.post(
  '/rooms',
  [
    body('restaurant_id')
      .trim()
      .notEmpty()
      .withMessage('restaurant_id is required')
      .isUUID()
      .withMessage('restaurant_id must be a valid UUID'),
  ],
  createRoom,
);

router.post(
  '/rooms/:roomCode/join',
  [param('roomCode').trim().isLength({ min: 4, max: 10 }).withMessage('Invalid room code')],
  joinRoom,
);

router.get(
  '/rooms/:roomCode',
  [param('roomCode').trim().isLength({ min: 4, max: 10 }).withMessage('Invalid room code')],
  getRoom,
);

router.post(
  '/rooms/:roomCode/items',
  [
    param('roomCode').trim().isLength({ min: 4, max: 10 }).withMessage('Invalid room code'),
    body('menu_item_id').trim().isUUID().withMessage('menu_item_id must be a valid UUID'),
    body('quantity').optional().isInt({ min: 1, max: 10 }).withMessage('quantity must be between 1 and 10'),
  ],
  addItem,
);

router.patch(
  '/rooms/:roomCode/items/:itemId',
  [
    param('roomCode').trim().isLength({ min: 4, max: 10 }).withMessage('Invalid room code'),
    param('itemId').isUUID().withMessage('itemId must be a valid UUID'),
    body('quantity').isInt({ min: 1, max: 10 }).withMessage('quantity must be between 1 and 10'),
  ],
  updateItem,
);

router.delete(
  '/rooms/:roomCode/items/:itemId',
  [
    param('roomCode').trim().isLength({ min: 4, max: 10 }).withMessage('Invalid room code'),
    param('itemId').isUUID().withMessage('itemId must be a valid UUID'),
  ],
  removeItem,
);

router.post(
  '/rooms/:roomCode/checkout',
  [param('roomCode').trim().isLength({ min: 4, max: 10 }).withMessage('Invalid room code')],
  checkoutRoom,
);

module.exports = router;
