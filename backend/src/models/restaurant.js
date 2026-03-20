const { query } = require('../config/db');

/**
 * Create the restaurants table if it doesn't already exist.
 */
const createRestaurantsTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS restaurants (
      id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
      owner_id     UUID          REFERENCES users (id) ON DELETE SET NULL,
      name         VARCHAR(150)  NOT NULL,
      description  TEXT,
      cuisine_type VARCHAR(80),
      address      TEXT          NOT NULL,
      city         VARCHAR(80)   NOT NULL,
      phone        VARCHAR(20),
      image_url    TEXT,
      is_active    BOOLEAN       NOT NULL DEFAULT TRUE,
      rating       NUMERIC(3, 2)  NOT NULL DEFAULT 0.00
                   CHECK (rating >= 0 AND rating <= 5),
      created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_restaurants_city      ON restaurants (city);
    CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine   ON restaurants (cuisine_type);
    CREATE INDEX IF NOT EXISTS idx_restaurants_is_active ON restaurants (is_active);
  `;
  await query(sql);
};

/**
 * Return all active restaurants, newest first.
 * Supports optional filtering by city and/or cuisine_type.
 * @param {{ city?: string, cuisine?: string }} filters
 */
const findAll = async ({ city, cuisine } = {}) => {
  const conditions = ['r.is_active = TRUE'];
  const params = [];

  if (city) {
    params.push(`%${city}%`);
    conditions.push(`r.city ILIKE $${params.length}`);
  }
  if (cuisine) {
    params.push(`%${cuisine}%`);
    conditions.push(`r.cuisine_type ILIKE $${params.length}`);
  }

  const where = conditions.join(' AND ');
  const sql = `
    SELECT
      r.id, r.owner_id, r.name, r.description, r.cuisine_type,
      r.address, r.city, r.phone, r.image_url, r.rating,
      r.is_active, r.created_at,
      u.name AS owner_name
    FROM restaurants r
    LEFT JOIN users u ON u.id = r.owner_id
    WHERE ${where}
    ORDER BY r.created_at DESC
  `;
  const { rows } = await query(sql, params);
  return rows;
};

/**
 * Find a single restaurant by its primary-key id.
 * @param {string} id  UUID
 */
const findById = async (id) => {
  const sql = `
    SELECT
      r.id, r.owner_id, r.name, r.description, r.cuisine_type,
      r.address, r.city, r.phone, r.image_url, r.rating,
      r.is_active, r.created_at,
      u.name AS owner_name
    FROM restaurants r
    LEFT JOIN users u ON u.id = r.owner_id
    WHERE r.id = $1
    LIMIT 1
  `;
  const { rows } = await query(sql, [id]);
  return rows[0] || null;
};

/**
 * Insert a new restaurant row and return it.
 * @param {{ owner_id, name, description, cuisine_type, address, city, phone, image_url }} data
 */
const create = async ({
  owner_id = null,
  name,
  description = null,
  cuisine_type = null,
  address,
  city,
  phone = null,
  image_url = null,
}) => {
  const sql = `
    INSERT INTO restaurants
      (owner_id, name, description, cuisine_type, address, city, phone, image_url)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;
  const { rows } = await query(sql, [
    owner_id,
    name,
    description,
    cuisine_type,
    address,
    city,
    phone,
    image_url,
  ]);
  return rows[0];
};

module.exports = { createRestaurantsTable, findAll, findById, create };
