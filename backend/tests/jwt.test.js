// Unit tests for JWT utilities
// These run without a database connection.

process.env.JWT_SECRET = 'test_secret_key_for_unit_tests';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key_for_unit_tests';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

const {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} = require('../src/utils/jwt');

describe('JWT utilities', () => {
  const payload = { id: 'user-123', email: 'test@example.com', role: 'customer' };

  it('generates and verifies an access token', () => {
    const token = generateAccessToken(payload);
    expect(typeof token).toBe('string');
    const decoded = verifyAccessToken(token);
    expect(decoded.id).toBe(payload.id);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
  });

  it('generates and verifies a refresh token', () => {
    const token = generateRefreshToken(payload);
    expect(typeof token).toBe('string');
    const decoded = verifyRefreshToken(token);
    expect(decoded.id).toBe(payload.id);
  });

  it('throws on an invalid access token', () => {
    expect(() => verifyAccessToken('invalid.token.here')).toThrow();
  });

  it('throws on an invalid refresh token', () => {
    expect(() => verifyRefreshToken('bad_token')).toThrow();
  });
});
