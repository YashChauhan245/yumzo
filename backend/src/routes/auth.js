const express = require('express');
const rateLimit = require('express-rate-limit');
const { signup, login, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { signupValidation, loginValidation } = require('../middleware/validate');

const router = express.Router();

// Rate limiting: max 10 auth requests per 15 minutes per IP (disabled in test)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});

// POST /api/auth/signup
router.post('/signup', authLimiter, signupValidation, signup);

// POST /api/auth/login
router.post('/login', authLimiter, loginValidation, login);

// GET /api/auth/me  (protected)
router.get('/me', authenticate, getMe);

module.exports = router;
