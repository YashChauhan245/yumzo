const { query } = require('../config/db');

// Create users table on first run
const createUsersTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name        VARCHAR(100)  NOT NULL,
      email       VARCHAR(255)  NOT NULL UNIQUE,
      password    TEXT          NOT NULL,
      phone       VARCHAR(20),
      role        VARCHAR(20)   NOT NULL DEFAULT 'customer'
                  CHECK (role IN ('customer', 'restaurant_owner', 'delivery_agent', 'admin')),
      avatar_url  TEXT,
      is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
      created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
  `;
  await query(sql);
};

// Find a user by email
const findByEmail = async (email) => {
  const { rows } = await query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
  return rows[0] || null;
};

// Find a user by id (returns public fields only, no password)
const findById = async (id) => {
  const { rows } = await query(
    'SELECT id, name, email, phone, role, avatar_url, is_active, created_at FROM users WHERE id = $1 LIMIT 1',
    [id],
  );
  return rows[0] || null;
};

// Create a new user and return their public info
const create = async ({ name, email, password, phone = null, role = 'customer' }) => {
  const { rows } = await query(
    `INSERT INTO users (name, email, password, phone, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, phone, role, avatar_url, is_active, created_at`,
    [name, email, password, phone, role],
  );
  return rows[0];
};

module.exports = { createUsersTable, findByEmail, findById, create };
