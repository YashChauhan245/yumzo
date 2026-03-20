const { query } = require('../config/db');

// Create menu_items table on first run
const createMenuItemsTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS menu_items (
      id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
      restaurant_id UUID          NOT NULL REFERENCES restaurants (id) ON DELETE CASCADE,
      name          VARCHAR(150)  NOT NULL,
      description   TEXT,
      price         NUMERIC(10,2) NOT NULL CHECK (price >= 0),
      category      VARCHAR(80),
      image_url     TEXT,
      is_veg        BOOLEAN       NOT NULL DEFAULT FALSE,
      is_available  BOOLEAN       NOT NULL DEFAULT TRUE,
      created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items (restaurant_id);
    CREATE INDEX IF NOT EXISTS idx_menu_items_category   ON menu_items (category);
    CREATE INDEX IF NOT EXISTS idx_menu_items_available  ON menu_items (is_available);
  `;
  await query(sql);
};

// Get all available menu items for a restaurant, with optional filters
const findByRestaurant = async (restaurantId, { category, is_veg } = {}) => {
  const conditions = ['restaurant_id = $1', 'is_available = TRUE'];
  const params = [restaurantId];

  if (category) {
    params.push(`%${category}%`);
    conditions.push(`category ILIKE $${params.length}`);
  }
  if (is_veg !== undefined) {
    params.push(is_veg);
    conditions.push(`is_veg = $${params.length}`);
  }

  const where = conditions.join(' AND ');
  const sql = `
    SELECT id, restaurant_id, name, description, price, category,
           image_url, is_veg, is_available, created_at
    FROM menu_items
    WHERE ${where}
    ORDER BY category, name
  `;
  const { rows } = await query(sql, params);
  return rows;
};

// Find a single menu item by id
const findById = async (id) => {
  const { rows } = await query(
    `SELECT id, restaurant_id, name, description, price, category,
            image_url, is_veg, is_available, created_at
     FROM menu_items WHERE id = $1 LIMIT 1`,
    [id],
  );
  return rows[0] || null;
};

// Add a new menu item
const create = async ({
  restaurant_id,
  name,
  description = null,
  price,
  category = null,
  image_url = null,
  is_veg = false,
}) => {
  const sql = `
    INSERT INTO menu_items
      (restaurant_id, name, description, price, category, image_url, is_veg)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const { rows } = await query(sql, [
    restaurant_id,
    name,
    description,
    price,
    category,
    image_url,
    is_veg,
  ]);
  return rows[0];
};

module.exports = { createMenuItemsTable, findByRestaurant, findById, create };
