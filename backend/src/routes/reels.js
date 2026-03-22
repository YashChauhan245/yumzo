const express = require('express');
const { body, param } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const {
  getReels,
  toggleReelLike,
  getReelComments,
  addReelComment,
} = require('../controllers/reelController');

const router = express.Router();

router.use(authenticate);

const reelIdValidation = [
  param('reelId')
    .isUUID()
    .withMessage('reelId must be a valid UUID'),
];

const addCommentValidation = [
  ...reelIdValidation,
  body('comment')
    .trim()
    .notEmpty()
    .withMessage('comment is required')
    .isLength({ min: 1, max: 280 })
    .withMessage('comment must be between 1 and 280 characters'),
];

router.get('/', getReels);
router.post('/:reelId/like', reelIdValidation, toggleReelLike);
router.get('/:reelId/comments', reelIdValidation, getReelComments);
router.post('/:reelId/comments', addCommentValidation, addReelComment);

module.exports = router;
