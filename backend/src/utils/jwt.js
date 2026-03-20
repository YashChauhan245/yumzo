const jwt = require('jsonwebtoken');

const isProd = process.env.NODE_ENV === 'production';

const JWT_SECRET = process.env.JWT_SECRET || (!isProd ? 'dev_access_secret_change_me' : undefined);
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || (!isProd ? 'dev_refresh_secret_change_me' : undefined);
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

if (!isProd && (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET)) {
  // Local-only fallback so first-time setup does not fail hard.
  console.warn('JWT secrets not found in environment. Using development fallback secrets.');
}

// Generate a short-lived access token (used for API requests)
const generateAccessToken = (payload) => {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not configured');
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Generate a long-lived refresh token (used to get new access tokens)
const generateRefreshToken = (payload) => {
  if (!JWT_REFRESH_SECRET) throw new Error('JWT_REFRESH_SECRET is not configured');
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
};

// Verify an access token and return the decoded data
const verifyAccessToken = (token) => {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not configured');
  return jwt.verify(token, JWT_SECRET);
};

// Verify a refresh token and return the decoded data
const verifyRefreshToken = (token) => {
  if (!JWT_REFRESH_SECRET) throw new Error('JWT_REFRESH_SECRET is not configured');
  return jwt.verify(token, JWT_REFRESH_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
