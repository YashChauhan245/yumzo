const { verifyAccessToken } = require('../utils/jwt');

/**
 * Middleware: verify JWT access token.
 * Attaches the decoded payload to `req.user` on success.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ success: false, message: 'Access token is required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res
        .status(401)
        .json({ success: false, message: 'Access token has expired' });
    }
    return res
      .status(401)
      .json({ success: false, message: 'Invalid access token' });
  }
};

/**
 * Middleware factory: restrict access to specific roles.
 * Must be used after `authenticate`.
 * @param {...string} roles  Allowed roles (e.g. 'admin', 'restaurant_owner')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ success: false, message: 'You do not have permission to perform this action' });
    }
    return next();
  };
};

module.exports = { authenticate, authorize };
