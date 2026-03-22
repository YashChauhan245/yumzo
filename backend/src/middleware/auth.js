const { verifyAccessToken } = require('../utils/jwt');

const normalizeRole = (role) => {
  if (role === 'delivery_agent') return 'driver';
  return role;
};

// Middleware to check if user is logged in via JWT
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access token is required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = {
      ...decoded,
      role: normalizeRole(decoded.role),
    }; // attach user info to request
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Access token has expired' });
    }
    return res.status(401).json({ success: false, message: 'Invalid access token' });
  }
};

// Middleware to check user role (use after authenticate)
const authorize = (...roles) => {
  const normalizedAllowedRoles = roles.map(normalizeRole);

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const userRole = normalizeRole(req.user.role);
    if (!normalizedAllowedRoles.includes(userRole)) {
      return res.status(403).json({ success: false, message: 'You do not have permission to perform this action' });
    }

    return next();
  };
};

// Convenience middleware for routes scoped to customer APIs.
const requireCustomer = authorize('customer');

// Convenience middleware for routes scoped to driver APIs.
const requireDriver = authorize('driver', 'delivery_agent');

module.exports = {
  authenticate,
  authorize,
  requireCustomer,
  requireDriver,
  normalizeRole,
};
