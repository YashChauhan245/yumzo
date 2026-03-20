// Integration tests for the Cart API routes.
// Uses supertest against the Express app with all DB models mocked.

process.env.JWT_SECRET = 'test_secret_key_for_integration_tests';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.NODE_ENV = 'test';

// ── Shared mock data ──────────────────────────────────────────────────────────
const mockMenuItemAvailable = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  restaurant_id: '550e8400-e29b-41d4-a716-446655440010',
  name: 'Margherita Pizza',
  description: 'Classic cheese pizza',
  price: '299.00',
  category: 'Pizza',
  image_url: null,
  is_veg: true,
  is_available: true,
};

const mockMenuItemUnavailable = {
  ...mockMenuItemAvailable,
  id: '550e8400-e29b-41d4-a716-446655440002',
  is_available: false,
};

const mockCartItem = {
  id: '550e8400-e29b-41d4-a716-446655440099',
  user_id: 'cust-uuid',
  menu_item_id: '550e8400-e29b-41d4-a716-446655440001',
  restaurant_id: '550e8400-e29b-41d4-a716-446655440010',
  quantity: 2,
  item_name: 'Margherita Pizza',
  item_description: 'Classic cheese pizza',
  price: '299.00',
  image_url: null,
  is_veg: true,
  category: 'Pizza',
  restaurant_name: 'Pizza Palace',
  created_at: new Date().toISOString(),
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
}));

const request = require('supertest');
const app = require('../src/server');
const { generateAccessToken } = require('../src/utils/jwt');
const CartItemModel = require('../src/models/cartItem');
const MenuItemModel = require('../src/models/menuItem');

const customerToken = () =>
  generateAccessToken({ id: 'cust-uuid', email: 'cust@yumzo.com', role: 'customer' });

// ─────────────────────────────────────────────────────────────────────────────

describe('Cart API', () => {
  beforeEach(() => jest.clearAllMocks());

  // ── GET /api/cart ───────────────────────────────────────────────────────────
  describe('GET /api/cart', () => {
    it('returns 401 when unauthenticated', async () => {
      const res = await request(app).get('/api/cart');
      expect(res.status).toBe(401);
    });

    it('returns empty cart for a new user', async () => {
      CartItemModel.getByUser.mockResolvedValueOnce([]);
      const res = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${customerToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(0);
      expect(res.body.data.totalAmount).toBe(0);
    });

    it('returns cart items with total', async () => {
      CartItemModel.getByUser.mockResolvedValueOnce([mockCartItem]);
      const res = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${customerToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.totalAmount).toBeCloseTo(598.0);
    });
  });

  // ── POST /api/cart ──────────────────────────────────────────────────────────
  describe('POST /api/cart', () => {
    it('returns 401 when unauthenticated', async () => {
      const res = await request(app)
        .post('/api/cart')
        .send({ menu_item_id: 'menu-item-uuid-1' });
      expect(res.status).toBe(401);
    });

    it('adds an available menu item to the cart', async () => {
      MenuItemModel.findById.mockResolvedValueOnce(mockMenuItemAvailable);
      CartItemModel.upsertItem.mockResolvedValueOnce(mockCartItem);

      const res = await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${customerToken()}`)
        .send({ menu_item_id: '550e8400-e29b-41d4-a716-446655440001', quantity: 2 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(CartItemModel.upsertItem).toHaveBeenCalledWith(
        expect.objectContaining({ menuItemId: '550e8400-e29b-41d4-a716-446655440001', quantity: 2 }),
      );
    });

    it('returns 404 when menu item does not exist', async () => {
      MenuItemModel.findById.mockResolvedValueOnce(null);
      const res = await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${customerToken()}`)
        .send({ menu_item_id: '550e8400-e29b-41d4-a716-446655440001' });
      expect(res.status).toBe(404);
    });

    it('returns 400 when menu item is unavailable', async () => {
      MenuItemModel.findById.mockResolvedValueOnce(mockMenuItemUnavailable);
      const res = await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${customerToken()}`)
        .send({ menu_item_id: '550e8400-e29b-41d4-a716-446655440002' });
      expect(res.status).toBe(400);
    });

    it('returns 422 for missing menu_item_id', async () => {
      const res = await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${customerToken()}`)
        .send({});
      expect(res.status).toBe(422);
    });

    it('returns 422 for invalid UUID menu_item_id', async () => {
      const res = await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${customerToken()}`)
        .send({ menu_item_id: 'not-a-uuid' });
      expect(res.status).toBe(422);
    });
  });

  // ── PUT /api/cart/:itemId ───────────────────────────────────────────────────
  describe('PUT /api/cart/:itemId', () => {
    it('updates the quantity of a cart item', async () => {
      const updated = { ...mockCartItem, quantity: 5 };
      CartItemModel.updateQuantity.mockResolvedValueOnce(updated);

      const res = await request(app)
        .put('/api/cart/550e8400-e29b-41d4-a716-446655440099')
        .set('Authorization', `Bearer ${customerToken()}`)
        .send({ quantity: 5 });

      expect(res.status).toBe(200);
      expect(res.body.data.cartItem.quantity).toBe(5);
    });

    it('returns 404 when cart item is not found', async () => {
      CartItemModel.updateQuantity.mockResolvedValueOnce(null);
      const res = await request(app)
        .put('/api/cart/550e8400-e29b-41d4-a716-446655440098')
        .set('Authorization', `Bearer ${customerToken()}`)
        .send({ quantity: 3 });
      expect(res.status).toBe(404);
    });

    it('returns 422 for invalid quantity', async () => {
      const res = await request(app)
        .put('/api/cart/550e8400-e29b-41d4-a716-446655440099')
        .set('Authorization', `Bearer ${customerToken()}`)
        .send({ quantity: 0 });
      expect(res.status).toBe(422);
    });
  });

  // ── DELETE /api/cart/:itemId ────────────────────────────────────────────────
  describe('DELETE /api/cart/:itemId', () => {
    it('removes a cart item', async () => {
      CartItemModel.removeItem.mockResolvedValueOnce(mockCartItem);
      const res = await request(app)
        .delete('/api/cart/550e8400-e29b-41d4-a716-446655440099')
        .set('Authorization', `Bearer ${customerToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 404 when item does not exist', async () => {
      CartItemModel.removeItem.mockResolvedValueOnce(null);
      const res = await request(app)
        .delete('/api/cart/550e8400-e29b-41d4-a716-446655440098')
        .set('Authorization', `Bearer ${customerToken()}`);
      expect(res.status).toBe(404);
    });
  });

  // ── DELETE /api/cart ────────────────────────────────────────────────────────
  describe('DELETE /api/cart', () => {
    it('clears the entire cart', async () => {
      CartItemModel.clearCart.mockResolvedValueOnce(undefined);
      const res = await request(app)
        .delete('/api/cart')
        .set('Authorization', `Bearer ${customerToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(CartItemModel.clearCart).toHaveBeenCalledWith('cust-uuid');
    });
  });
});
