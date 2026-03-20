require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurants');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const { createUsersTable } = require('./models/user');
const { createRestaurantsTable } = require('./models/restaurant');
const { createMenuItemsTable } = require('./models/menuItem');
const { createCartItemsTable } = require('./models/cartItem');
const { createOrderTables } = require('./models/order');
const { createPaymentsTable } = require('./models/payment');

const app = express();

// Security headers
app.use(helmet());

// CORS — allow requests from frontend origin (or all origins in dev)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy: origin ${origin} is not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate limiting — skip in tests
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});
app.use(globalLimiter);

// Health check route
app.get('/health', (_req, res) =>
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() }),
);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

// 404 handler
app.use((_req, res) =>
  res.status(404).json({ success: false, message: 'Route not found' }),
);

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Start server and create DB tables
const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    if (process.env.DATABASE_URL) {
      await createUsersTable();
      await createRestaurantsTable();
      await createMenuItemsTable();
      await createCartItemsTable();
      await createOrderTables();
      await createPaymentsTable();
      console.log('✅ Database tables ready');
    } else {
      console.warn('⚠️  DATABASE_URL not set – skipping DB initialisation');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Yumzo API running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

// Only start listening when run directly (not when imported in tests)
if (require.main === module) {
  start();
}

module.exports = app;
