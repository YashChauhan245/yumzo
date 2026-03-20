// Integration tests for the Payments API routes.
// Uses supertest against the Express app with all DB models mocked.

process.env.JWT_SECRET = 'test_secret_key_for_integration_tests';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.NODE_ENV = 'test';

// ── Shared mock data ──────────────────────────────────────────────────────────
const now = new Date().toISOString();
const ORDER_ID = '550e8400-e29b-41d4-a716-446655440100';

const mockPendingOrder = {
  id: ORDER_ID,
  user_id: 'cust-uuid',
  restaurant_id: '550e8400-e29b-41d4-a716-446655440010',
  restaurant_name: 'Pizza Palace',
  status: 'pending',
  total_amount: '598.00',
  delivery_address: '123 Main Street, Mumbai',
  notes: null,
  created_at: now,
  items: [],
};

const mockConfirmedOrder = { ...mockPendingOrder, status: 'confirmed' };

const mockPaymentSuccess = {
  id: '550e8400-e29b-41d4-a716-446655440200',
  order_id: ORDER_ID,
  user_id: 'cust-uuid',
  amount: '598.00',
  payment_method: 'card',
  payment_status: 'success',
  transaction_id: 'txn_mock_success',
  failure_reason: null,
  created_at: now,
  updated_at: now,
};

const mockPaymentFailed = {
  ...mockPaymentSuccess,
  payment_status: 'failed',
  transaction_id: null,
  failure_reason: 'Payment declined by issuer',
};

// ── Stub all DB models ────────────────────────────────────────────────────────
jest.mock('../src/models/user', () => ({
  createUsersTable: jest.fn().mockResolvedValue(undefined),
  findByEmail: jest.fn().mockResolvedValue(null),
  findById: jest.fn().mockResolvedValue(null),
  create: jest.fn().mockResolvedValue({}),
}));

jest.mock('../src/models/restaurant', () => ({
  createRestaurantsTable: jest.fn().mockResolvedValue(undefined),
  findAll: jest.fn().mockResolvedValue([]),
  findById: jest.fn().mockResolvedValue(null),
  create: jest.fn().mockResolvedValue({}),
}));

jest.mock('../src/models/menuItem', () => ({
  createMenuItemsTable: jest.fn().mockResolvedValue(undefined),
  findByRestaurant: jest.fn().mockResolvedValue([]),
  findById: jest.fn().mockResolvedValue(null),
  create: jest.fn().mockResolvedValue({}),
}));

jest.mock('../src/models/cartItem', () => ({
  createCartItemsTable: jest.fn().mockResolvedValue(undefined),
  getByUser: jest.fn().mockResolvedValue([]),
  upsertItem: jest.fn().mockResolvedValue({}),
  updateQuantity: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(null),
  clearCart: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../src/models/order', () => ({
  createOrderTables: jest.fn().mockResolvedValue(undefined),
  createOrder: jest.fn().mockResolvedValue({}),
  findByUser: jest.fn().mockResolvedValue([]),
  findById: jest.fn().mockResolvedValue(null),
  updateStatus: jest.fn().mockResolvedValue({}),
}));

jest.mock('../src/models/payment', () => ({
  createPaymentsTable: jest.fn().mockResolvedValue(undefined),
  create: jest.fn().mockResolvedValue({}),
  findByOrderId: jest.fn().mockResolvedValue(null),
  findByUser: jest.fn().mockResolvedValue([]),
}));

const request = require('supertest');
const app = require('../src/server');
const { generateAccessToken } = require('../src/utils/jwt');
const OrderModel = require('../src/models/order');
const PaymentModel = require('../src/models/payment');

const authHeader = () => 'Bearer ' + generateAccessToken({ id: 'cust-uuid', email: 'cust@yumzo.com', role: 'customer' });

// ─────────────────────────────────────────────────────────────────────────────

describe('Payments API', () => {
  beforeEach(() => jest.clearAllMocks());

  // ── POST /api/payments/:orderId ─────────────────────────────────────────────
  describe('POST /api/payments/:orderId', () => {
    it('returns 401 when unauthenticated', async () => {
      const res = await request(app)
        .post('/api/payments/' + ORDER_ID)
        .send({ payment_method: 'card' });
      expect(res.status).toBe(401);
    });

    it('processes a successful card payment', async () => {
      OrderModel.findById.mockResolvedValueOnce(mockPendingOrder);
      PaymentModel.findByOrderId.mockResolvedValueOnce(null);
      PaymentModel.create.mockResolvedValueOnce(mockPaymentSuccess);
      OrderModel.updateStatus.mockResolvedValueOnce(mockConfirmedOrder);

      const res = await request(app)
        .post('/api/payments/' + ORDER_ID)
        .set('Authorization', authHeader())
        .send({ payment_method: 'card', payment_details: 'valid_card' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/successful/i);
      expect(OrderModel.updateStatus).toHaveBeenCalledWith(ORDER_ID, 'confirmed');
    });

    it('processes a successful UPI payment', async () => {
      OrderModel.findById.mockResolvedValueOnce(mockPendingOrder);
      PaymentModel.findByOrderId.mockResolvedValueOnce(null);
      PaymentModel.create.mockResolvedValueOnce({ ...mockPaymentSuccess, payment_method: 'upi' });
      OrderModel.updateStatus.mockResolvedValueOnce(mockConfirmedOrder);

      const res = await request(app)
        .post('/api/payments/' + ORDER_ID)
        .set('Authorization', authHeader())
        .send({ payment_method: 'upi', payment_details: 'user@upi' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('processes a successful cash_on_delivery payment', async () => {
      OrderModel.findById.mockResolvedValueOnce(mockPendingOrder);
      PaymentModel.findByOrderId.mockResolvedValueOnce(null);
      PaymentModel.create.mockResolvedValueOnce({
        ...mockPaymentSuccess,
        payment_method: 'cash_on_delivery',
      });
      OrderModel.updateStatus.mockResolvedValueOnce(mockConfirmedOrder);

      const res = await request(app)
        .post('/api/payments/' + ORDER_ID)
        .set('Authorization', authHeader())
        .send({ payment_method: 'cash_on_delivery' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('simulates a failed payment when payment_details starts with fail_', async () => {
      OrderModel.findById.mockResolvedValueOnce(mockPendingOrder);
      PaymentModel.findByOrderId.mockResolvedValueOnce(null);
      PaymentModel.create.mockResolvedValueOnce(mockPaymentFailed);

      const res = await request(app)
        .post('/api/payments/' + ORDER_ID)
        .set('Authorization', authHeader())
        .send({ payment_method: 'card', payment_details: 'fail_bad_card' });

      expect(res.status).toBe(402);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/failed/i);
      // Order status must NOT be updated on failure
      expect(OrderModel.updateStatus).not.toHaveBeenCalled();
    });

    it('returns 404 when the order does not exist', async () => {
      OrderModel.findById.mockResolvedValueOnce(null);

      const res = await request(app)
        .post('/api/payments/' + ORDER_ID)
        .set('Authorization', authHeader())
        .send({ payment_method: 'card' });

      expect(res.status).toBe(404);
    });

    it('returns 400 when the order is already confirmed', async () => {
      OrderModel.findById.mockResolvedValueOnce(mockConfirmedOrder);

      const res = await request(app)
        .post('/api/payments/' + ORDER_ID)
        .set('Authorization', authHeader())
        .send({ payment_method: 'card' });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/confirmed/i);
    });

    it('returns 400 when a successful payment already exists (idempotency guard)', async () => {
      OrderModel.findById.mockResolvedValueOnce(mockPendingOrder);
      PaymentModel.findByOrderId.mockResolvedValueOnce(mockPaymentSuccess);

      const res = await request(app)
        .post('/api/payments/' + ORDER_ID)
        .set('Authorization', authHeader())
        .send({ payment_method: 'card' });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already been paid/i);
    });

    it('returns 422 for missing payment_method', async () => {
      const res = await request(app)
        .post('/api/payments/' + ORDER_ID)
        .set('Authorization', authHeader())
        .send({});

      expect(res.status).toBe(422);
      expect(res.body.errors).toBeDefined();
    });

    it('returns 422 for unsupported payment_method', async () => {
      const res = await request(app)
        .post('/api/payments/' + ORDER_ID)
        .set('Authorization', authHeader())
        .send({ payment_method: 'bitcoin' });

      expect(res.status).toBe(422);
    });
  });

  // ── GET /api/payments/:orderId ──────────────────────────────────────────────
  describe('GET /api/payments/:orderId', () => {
    it('returns 401 when unauthenticated', async () => {
      const res = await request(app).get('/api/payments/' + ORDER_ID);
      expect(res.status).toBe(401);
    });

    it('returns the payment status for a paid order', async () => {
      OrderModel.findById.mockResolvedValueOnce(mockPendingOrder);
      PaymentModel.findByOrderId.mockResolvedValueOnce(mockPaymentSuccess);

      const res = await request(app)
        .get('/api/payments/' + ORDER_ID)
        .set('Authorization', authHeader());

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.payment.payment_status).toBe('success');
    });

    it('returns 404 when the order does not exist', async () => {
      OrderModel.findById.mockResolvedValueOnce(null);

      const res = await request(app)
        .get('/api/payments/' + ORDER_ID)
        .set('Authorization', authHeader());

      expect(res.status).toBe(404);
    });

    it('returns 404 when no payment exists for the order', async () => {
      OrderModel.findById.mockResolvedValueOnce(mockPendingOrder);
      PaymentModel.findByOrderId.mockResolvedValueOnce(null);

      const res = await request(app)
        .get('/api/payments/' + ORDER_ID)
        .set('Authorization', authHeader());

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/no payment/i);
    });
  });
});
