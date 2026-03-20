// Integration tests for the Orders API routes.
// Uses supertest against the Express app with all DB models mocked.

process.env.JWT_SECRET = 'test_secret_key_for_integration_tests';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.NODE_ENV = 'test';

// ── Shared mock data ──────────────────────────────────────────────────────────
const now = new Date().toISOString();

const mockCartItems = [
  {
    id: 'cart-item-uuid-1',
    user_id: 'cust-uuid',
    menu_item_id: 'menu-item-uuid-1',
    restaurant_id: 'rest-uuid-1',
    quantity: 2,
    item_name: 'Margherita Pizza',
    price: '299.00',
    image_url: null,
    is_veg: true,
    category: 'Pizza',
    restaurant_name: 'Pizza Palace',
    created_at: now,
  },
];

const mockOrder = {
  id: 'order-uuid-1',
  user_id: 'cust-uuid',
  restaurant_id: 'rest-uuid-1',
  restaurant_name: 'Pizza Palace',
  status: 'pending',
  total_amount: '598.00',
  delivery_address: '123 Main Street, Mumbai',
  notes: null,
  created_at: now,
  items: [
    {
      id: 'order-item-uuid-1',
      order_id: 'order-uuid-1',
      menu_item_id: 'menu-item-uuid-1',
      name: 'Margherita Pizza',
      price: '299.00',
      quantity: 2,
      created_at: now,
    },
  ],
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
  findById: jest.fn().mockResolvedValue({
    id: 'menu-item-uuid-1',
    restaurant_id: 'rest-uuid-1',
    name: 'Margherita Pizza',
    price: '299.00',
    is_available: true,
  }),
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
}));

const request = require('supertest');
const app = require('../src/server');
const { generateAccessToken } = require('../src/utils/jwt');
const CartItemModel = require('../src/models/cartItem');
const MenuItemModel = require('../src/models/menuItem');
const OrderModel = require('../src/models/order');

const customerToken = () =>
  generateAccessToken({ id: 'cust-uuid', email: 'cust@yumzo.com', role: 'customer' });

// ─────────────────────────────────────────────────────────────────────────────

describe('Orders API', () => {
  beforeEach(() => jest.clearAllMocks());

  // ── POST /api/orders ────────────────────────────────────────────────────────
  describe('POST /api/orders', () => {
    it('returns 401 when unauthenticated', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({ delivery_address: '123 Main St' });
      expect(res.status).toBe(401);
    });

    it('places an order from a non-empty cart', async () => {
      CartItemModel.getByUser.mockResolvedValueOnce(mockCartItems);
      MenuItemModel.findById.mockResolvedValue({
        id: 'menu-item-uuid-1',
        restaurant_id: 'rest-uuid-1',
        name: 'Margherita Pizza',
        price: '299.00',
        is_available: true,
      });
      OrderModel.createOrder.mockResolvedValueOnce(mockOrder);

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken()}`)
        .send({ delivery_address: '123 Main Street, Mumbai' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order.status).toBe('pending');
      expect(CartItemModel.clearCart).toHaveBeenCalledWith('cust-uuid');
    });

    it('returns 400 when cart is empty', async () => {
      CartItemModel.getByUser.mockResolvedValueOnce([]);
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken()}`)
        .send({ delivery_address: '123 Main St' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 400 when cart has items from multiple restaurants', async () => {
      CartItemModel.getByUser.mockResolvedValueOnce([
        { ...mockCartItems[0], restaurant_id: 'rest-uuid-1' },
        {
          ...mockCartItems[0],
          id: 'cart-item-uuid-2',
          menu_item_id: 'menu-item-uuid-2',
          restaurant_id: 'rest-uuid-2',
        },
      ]);
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken()}`)
        .send({ delivery_address: '123 Main St' });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/same restaurant/i);
    });

    it('returns 400 when a menu item becomes unavailable', async () => {
      CartItemModel.getByUser.mockResolvedValueOnce(mockCartItems);
      MenuItemModel.findById.mockResolvedValueOnce({
        id: 'menu-item-uuid-1',
        is_available: false,
      });
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken()}`)
        .send({ delivery_address: '123 Main St' });
      expect(res.status).toBe(400);
    });

    it('returns 422 when delivery_address is missing', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${customerToken()}`)
        .send({});
      expect(res.status).toBe(422);
      expect(res.body.errors).toBeDefined();
    });
  });

  // ── GET /api/orders ─────────────────────────────────────────────────────────
  describe('GET /api/orders', () => {
    it('returns 401 when unauthenticated', async () => {
      const res = await request(app).get('/api/orders');
      expect(res.status).toBe(401);
    });

    it('returns order history for the authenticated user', async () => {
      const historyItem = {
        id: mockOrder.id,
        user_id: 'cust-uuid',
        status: 'pending',
        total_amount: '598.00',
        restaurant_id: 'rest-uuid-1',
        restaurant_name: 'Pizza Palace',
        delivery_address: '123 Main Street, Mumbai',
        notes: null,
        created_at: now,
      };
      OrderModel.findByUser.mockResolvedValueOnce([historyItem]);

      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${customerToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orders).toHaveLength(1);
      expect(res.body.count).toBe(1);
    });

    it('returns an empty list when the user has no orders', async () => {
      OrderModel.findByUser.mockResolvedValueOnce([]);
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${customerToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.data.orders).toHaveLength(0);
    });
  });

  // ── GET /api/orders/:id ─────────────────────────────────────────────────────
  describe('GET /api/orders/:id', () => {
    it('returns the order with line items for a valid id', async () => {
      OrderModel.findById.mockResolvedValueOnce(mockOrder);
      const res = await request(app)
        .get(`/api/orders/${mockOrder.id}`)
        .set('Authorization', `Bearer ${customerToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.data.order.id).toBe(mockOrder.id);
      expect(Array.isArray(res.body.data.order.items)).toBe(true);
    });

    it('returns 404 for an unknown or foreign order id', async () => {
      OrderModel.findById.mockResolvedValueOnce(null);
      const res = await request(app)
        .get('/api/orders/non-existent-order')
        .set('Authorization', `Bearer ${customerToken()}`);
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
