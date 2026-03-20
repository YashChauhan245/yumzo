// Integration tests for the restaurant API routes.
// Uses supertest against the Express app with mocked DB models.

process.env.JWT_SECRET = 'test_secret_key_for_integration_tests';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.NODE_ENV = 'test';

// ── Mock User model ───────────────────────────────────────────────────────────
jest.mock('../src/models/user', () => ({
  createUsersTable: jest.fn().mockResolvedValue(undefined),
  findByEmail: jest.fn().mockResolvedValue(null),
  findById: jest.fn().mockResolvedValue(null),
  create: jest.fn().mockResolvedValue({}),
}));

// ── Mock Restaurant model ─────────────────────────────────────────────────────
const mockRestaurants = [
  {
    id: 'rest-uuid-1',
    owner_id: 'admin-uuid',
    name: 'Pizza Palace',
    description: 'Best pizza in town',
    cuisine_type: 'Italian',
    address: '12 Main St',
    city: 'Mumbai',
    phone: '+919876543210',
    image_url: null,
    rating: '4.20',
    is_active: true,
    created_at: new Date().toISOString(),
    owner_name: 'Admin User',
  },
  {
    id: 'rest-uuid-2',
    owner_id: null,
    name: 'Biryani Hub',
    description: 'Authentic Hyderabadi biryani',
    cuisine_type: 'Indian',
    address: '8 Park Ave',
    city: 'Hyderabad',
    phone: null,
    image_url: null,
    rating: '4.50',
    is_active: true,
    created_at: new Date().toISOString(),
    owner_name: null,
  },
];

const mockMenuItems = [
  {
    id: 'item-uuid-1',
    restaurant_id: 'rest-uuid-1',
    name: 'Margherita Pizza',
    description: 'Classic cheese pizza',
    price: '299.00',
    category: 'Pizza',
    image_url: null,
    is_veg: true,
    is_available: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'item-uuid-2',
    restaurant_id: 'rest-uuid-1',
    name: 'Pepperoni Pizza',
    description: 'Spicy pepperoni',
    price: '399.00',
    category: 'Pizza',
    image_url: null,
    is_veg: false,
    is_available: true,
    created_at: new Date().toISOString(),
  },
];

jest.mock('../src/models/restaurant', () => ({
  createRestaurantsTable: jest.fn().mockResolvedValue(undefined),
  findAll: jest.fn().mockResolvedValue(mockRestaurants),
  findById: jest.fn(async (id) => mockRestaurants.find((r) => r.id === id) || null),
  create: jest.fn(async (data) => ({
    id: 'new-rest-uuid',
    owner_id: data.owner_id || null,
    name: data.name,
    description: data.description || null,
    cuisine_type: data.cuisine_type || null,
    address: data.address,
    city: data.city,
    phone: data.phone || null,
    image_url: data.image_url || null,
    rating: '0.00',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })),
}));

jest.mock('../src/models/menuItem', () => ({
  createMenuItemsTable: jest.fn().mockResolvedValue(undefined),
  findByRestaurant: jest.fn().mockResolvedValue(mockMenuItems),
  findById: jest.fn(async (id) => mockMenuItems.find((m) => m.id === id) || null),
  create: jest.fn().mockResolvedValue({}),
}));

const request = require('supertest');
const app = require('../src/server');
const { generateAccessToken } = require('../src/utils/jwt');
const RestaurantModel = require('../src/models/restaurant');
const MenuItemModel = require('../src/models/menuItem');

// ─────────────────────────────────────────────────────────────────────────────

// Token helpers
const adminToken = () =>
  generateAccessToken({ id: 'admin-uuid', email: 'admin@yumzo.com', role: 'admin' });
const customerToken = () =>
  generateAccessToken({ id: 'cust-uuid', email: 'cust@yumzo.com', role: 'customer' });

describe('Restaurant API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    RestaurantModel.findAll.mockResolvedValue(mockRestaurants);
    RestaurantModel.findById.mockImplementation(
      async (id) => mockRestaurants.find((r) => r.id === id) || null,
    );
    MenuItemModel.findByRestaurant.mockResolvedValue(mockMenuItems);
  });

  // ── GET /api/restaurants ──────────────────────────────────────────────────
  describe('GET /api/restaurants', () => {
    it('returns all active restaurants', async () => {
      const res = await request(app).get('/api/restaurants');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.restaurants)).toBe(true);
      expect(res.body.data.restaurants).toHaveLength(2);
      expect(res.body.count).toBe(2);
    });

    it('passes city filter to the model', async () => {
      RestaurantModel.findAll.mockResolvedValueOnce([mockRestaurants[0]]);
      const res = await request(app).get('/api/restaurants?city=Mumbai');
      expect(res.status).toBe(200);
      expect(RestaurantModel.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ city: 'Mumbai' }),
      );
    });

    it('passes cuisine filter to the model', async () => {
      RestaurantModel.findAll.mockResolvedValueOnce([mockRestaurants[1]]);
      const res = await request(app).get('/api/restaurants?cuisine=Indian');
      expect(res.status).toBe(200);
      expect(RestaurantModel.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ cuisine: 'Indian' }),
      );
    });

    it('returns an empty list when no restaurants match', async () => {
      RestaurantModel.findAll.mockResolvedValueOnce([]);
      const res = await request(app).get('/api/restaurants?city=Nowhere');
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(0);
    });
  });

  // ── GET /api/restaurants/:id/menu ─────────────────────────────────────────
  describe('GET /api/restaurants/:id/menu', () => {
    it('returns menu items for a valid restaurant id', async () => {
      const res = await request(app).get('/api/restaurants/rest-uuid-1/menu');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.menuItems)).toBe(true);
      expect(res.body.data.menuItems).toHaveLength(2);
      expect(res.body.data.restaurant.id).toBe('rest-uuid-1');
    });

    it('returns 404 for a non-existent restaurant', async () => {
      RestaurantModel.findById.mockResolvedValueOnce(null);
      const res = await request(app).get('/api/restaurants/unknown-id/menu');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('passes is_veg filter to the model', async () => {
      MenuItemModel.findByRestaurant.mockResolvedValueOnce([mockMenuItems[0]]);
      const res = await request(app).get(
        '/api/restaurants/rest-uuid-1/menu?is_veg=true',
      );
      expect(res.status).toBe(200);
      expect(MenuItemModel.findByRestaurant).toHaveBeenCalledWith(
        'rest-uuid-1',
        expect.objectContaining({ is_veg: true }),
      );
    });
  });

  // ── POST /api/restaurants ─────────────────────────────────────────────────
  describe('POST /api/restaurants', () => {
    const validPayload = {
      name: 'New Burger Joint',
      address: '99 Oak Street',
      city: 'Bangalore',
      cuisine_type: 'American',
      description: 'Juicy burgers',
    };

    it('allows an admin to create a restaurant', async () => {
      const res = await request(app)
        .post('/api/restaurants')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send(validPayload);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.restaurant.name).toBe(validPayload.name);
    });

    it('returns 401 when no token is provided', async () => {
      const res = await request(app).post('/api/restaurants').send(validPayload);
      expect(res.status).toBe(401);
    });

    it('returns 403 when a customer tries to add a restaurant', async () => {
      const res = await request(app)
        .post('/api/restaurants')
        .set('Authorization', `Bearer ${customerToken()}`)
        .send(validPayload);
      expect(res.status).toBe(403);
    });

    it('returns 422 when name is missing', async () => {
      const { name: _n, ...noName } = validPayload;
      const res = await request(app)
        .post('/api/restaurants')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send(noName);
      expect(res.status).toBe(422);
      expect(res.body.errors).toBeDefined();
    });

    it('returns 422 when address is missing', async () => {
      const { address: _a, ...noAddress } = validPayload;
      const res = await request(app)
        .post('/api/restaurants')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send(noAddress);
      expect(res.status).toBe(422);
    });

    it('returns 422 when city is missing', async () => {
      const { city: _c, ...noCity } = validPayload;
      const res = await request(app)
        .post('/api/restaurants')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send(noCity);
      expect(res.status).toBe(422);
    });

    it('returns 422 for an invalid image_url', async () => {
      const res = await request(app)
        .post('/api/restaurants')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ ...validPayload, image_url: 'not-a-url' });
      expect(res.status).toBe(422);
    });
  });
});
