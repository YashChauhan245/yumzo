// Integration tests for the auth API routes.
// Uses supertest against the Express app with a mocked DB layer.

process.env.JWT_SECRET = 'test_secret_key_for_integration_tests';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.NODE_ENV = 'test';

// ── Mock the User model so no real DB is needed ───────────────────────────────
jest.mock('../src/models/user', () => {
  const users = [];
  return {
    createUsersTable: jest.fn().mockResolvedValue(undefined),
    findByEmail: jest.fn(async (email) => users.find((u) => u.email === email) || null),
    findById: jest.fn(async (id) => {
      const u = users.find((user) => user.id === id);
      if (!u) return null;
      const { password: _pw, ...pub } = u;
      return pub;
    }),
    create: jest.fn(async ({ name, email, password, phone, role }) => {
      const bcrypt = require('bcryptjs');
      const user = {
        id: 'mock-uuid-' + Date.now(),
        name,
        email,
        password,
        phone: phone || null,
        role: role || 'customer',
        avatar_url: null,
        is_active: true,
        created_at: new Date().toISOString(),
      };
      users.push(user);
      const { password: _pw, ...pub } = user;
      return pub;
    }),
    // expose internal array for test setup
    _users: users,
  };
});

const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/server');
const UserModel = require('../src/models/user');

// ─────────────────────────────────────────────────────────────────────────────

describe('Auth API', () => {
  beforeEach(() => {
    // Clear mock users before each test
    UserModel._users.length = 0;
    jest.clearAllMocks();
  });

  // ── Health check ──────────────────────────────────────────────────────────
  describe('GET /health', () => {
    it('returns 200 with status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  // ── POST /api/auth/signup ─────────────────────────────────────────────────
  describe('POST /api/auth/signup', () => {
    const validUser = {
      name: 'Alice Tester',
      email: 'alice@example.com',
      password: 'Password1',
      phone: '+919876543210',
    };

    it('creates a new user and returns tokens', async () => {
      const res = await request(app).post('/api/auth/signup').send(validUser);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user).not.toHaveProperty('password');
      expect(res.body.data.user.email).toBe(validUser.email);
    });

    it('returns 409 when email is already registered', async () => {
      await request(app).post('/api/auth/signup').send(validUser);
      // Re-register the same email via mock
      UserModel.findByEmail.mockResolvedValueOnce({ email: validUser.email });
      const res = await request(app).post('/api/auth/signup').send(validUser);
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('returns 422 for missing required fields', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'bad' });
      expect(res.status).toBe(422);
      expect(res.body.errors).toBeDefined();
    });

    it('returns 422 for a weak password', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ ...validUser, password: 'weakpass' });
      expect(res.status).toBe(422);
    });

    it('returns 422 for an invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ ...validUser, email: 'not-an-email' });
      expect(res.status).toBe(422);
    });
  });

  // ── POST /api/auth/login ──────────────────────────────────────────────────
  describe('POST /api/auth/login', () => {
    const plainPassword = 'Password1';
    let hashedPassword;

    beforeEach(async () => {
      hashedPassword = await bcrypt.hash(plainPassword, 10);
      UserModel.findByEmail.mockResolvedValue({
        id: 'mock-uuid-login',
        name: 'Bob Tester',
        email: 'bob@example.com',
        password: hashedPassword,
        phone: null,
        role: 'customer',
        avatar_url: null,
        is_active: true,
        created_at: new Date().toISOString(),
      });
    });

    it('logs in with correct credentials and returns tokens', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'bob@example.com', password: plainPassword });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    it('returns 401 for wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'bob@example.com', password: 'WrongPass1' });
      expect(res.status).toBe(401);
    });

    it('returns 401 when user does not exist', async () => {
      UserModel.findByEmail.mockResolvedValueOnce(null);
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: plainPassword });
      expect(res.status).toBe(401);
    });

    it('returns 403 for deactivated account', async () => {
      UserModel.findByEmail.mockResolvedValueOnce({
        id: 'mock-uuid-deactivated',
        email: 'bob@example.com',
        password: hashedPassword,
        role: 'customer',
        is_active: false,
      });
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'bob@example.com', password: plainPassword });
      expect(res.status).toBe(403);
    });

    it('returns 422 for missing credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({});
      expect(res.status).toBe(422);
    });
  });

  // ── GET /api/auth/me ──────────────────────────────────────────────────────
  describe('GET /api/auth/me', () => {
    it('returns 401 without a token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('returns 401 with an invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.here');
      expect(res.status).toBe(401);
    });

    it('returns the current user with a valid token', async () => {
      const { generateAccessToken } = require('../src/utils/jwt');
      const token = generateAccessToken({
        id: 'mock-uuid-me',
        email: 'me@example.com',
        role: 'customer',
      });

      UserModel.findById.mockResolvedValueOnce({
        id: 'mock-uuid-me',
        name: 'Me Tester',
        email: 'me@example.com',
        phone: null,
        role: 'customer',
        avatar_url: null,
        is_active: true,
        created_at: new Date().toISOString(),
      });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('me@example.com');
    });
  });

  // ── 404 handler ───────────────────────────────────────────────────────────
  describe('Unknown routes', () => {
    it('returns 404 for unknown routes', async () => {
      const res = await request(app).get('/api/nonexistent');
      expect(res.status).toBe(404);
    });
  });
});
