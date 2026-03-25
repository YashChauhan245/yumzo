const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const prismaAuthService = require('../services/prismaAuthService');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');

const authService = prismaAuthService;
const ADMIN_EMAIL = String(process.env.ADMIN_EMAIL || 'yashchau.work@gmail.com').trim().toLowerCase();

// Keep email normalization very simple so it is easy to explain in interviews.
const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const toAppRole = (role) => (role === 'delivery_agent' ? 'driver' : role);

// Rule used in this project:
// 1) Only ADMIN_EMAIL gets admin access in token/response.
// 2) If any other account has DB role=admin, we treat it as customer in app responses.
const resolveEffectiveRole = ({ email, role }) => {
  const normalizedRole = toAppRole(role);
  const normalizedEmail = normalizeEmail(email);
  const normalizedAdminEmail = normalizeEmail(ADMIN_EMAIL);

  if (!ADMIN_EMAIL) return normalizedRole;

  if (normalizedEmail === normalizedAdminEmail) return 'admin';
  if (normalizedRole === 'admin') return 'customer';

  return normalizedRole;
};

// POST /api/auth/signup
const signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  const { name, email, password, phone, role } = req.body;
  const normalizedEmail = normalizeEmail(email);
  const normalizedRole = role === 'delivery_agent' ? 'driver' : (role || 'customer');
  const dbRole = normalizedRole === 'driver' ? 'delivery_agent' : normalizedRole;

  try {
    // Check if email is already registered
    const existing = await authService.findByEmail(normalizedEmail);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await authService.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone || null,
      role: dbRole,
    });

    const responseUser = {
      ...user,
      role: resolveEffectiveRole({ email: user.email, role: dbRole }),
    };

    const tokenPayload = { id: user.id, email: user.email, role: responseUser.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { user: responseUser, accessToken, refreshToken },
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;
  const normalizedEmail = normalizeEmail(email);

  try {
    const user = await authService.findByEmail(normalizedEmail);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact support.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const effectiveRole = resolveEffectiveRole(user);
    const tokenPayload = { id: user.id, email: user.email, role: effectiveRole };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Don't send the password hash in the response
    const { password: _pw, ...publicUser } = user;
    publicUser.role = effectiveRole;

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user: publicUser, accessToken, refreshToken },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/auth/me - get logged in user's profile
const getMe = async (req, res) => {
  try {
    const user = await authService.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const safeUser = {
      ...user,
      role: resolveEffectiveRole(user),
    };

    return res.status(200).json({ success: true, data: { user: safeUser } });
  } catch (err) {
    console.error('GetMe error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { signup, login, getMe };
