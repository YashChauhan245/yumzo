const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const UserModel = require('../models/user');
const prismaAuthService = require('../services/prismaAuthService');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');

const usePrisma = process.env.USE_PRISMA === 'true';
const authService = usePrisma ? prismaAuthService : UserModel;

// POST /api/auth/signup
const signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  const { name, email, password, phone, role } = req.body;
  const normalizedRole = role === 'driver' ? 'delivery_agent' : role;

  try {
    // Check if email is already registered
    const existing = await authService.findByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await authService.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || null,
      role: normalizedRole || 'customer',
    });

    const tokenPayload = { id: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { user, accessToken, refreshToken },
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

  try {
    const user = await authService.findByEmail(email);
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

    const tokenPayload = { id: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Don't send the password hash in the response
    const { password: _pw, ...publicUser } = user;

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
    return res.status(200).json({ success: true, data: { user } });
  } catch (err) {
    console.error('GetMe error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { signup, login, getMe };
