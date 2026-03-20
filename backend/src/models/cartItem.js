const { query } = require('../config/db');

/**
 * Create the cart_items table if it doesn't already exist.
 */
const createCartItemsTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS cart_items (
      id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id       UUID          NOT NULL REFERENCES users (id) ON DELETE CASCADE,
      menu_item_id  UUID          NOT NULL REFERENCES menu_items (id) ON DELETE CASCADE,
      restaurant_id UUID          NOT NULL REFERENCES restaurants (id) ON DELETE CASCADE,
      quantity      INTEGER       NOT NULL DEFAULT 1 CHECK (quantity > 0),
      created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, menu_item_id)
    );

    CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items (user_id);
  `;
  await query(sql);
};

/**
 * Return all cart items for a user, joined with menu_item details.
 * @param {string} userId  UUID
 */
const getByUser = async (userId) => {
  const sql = `
    SELECT
      ci.id, ci.user_id, ci.quantity, ci.created_at,
      mi.id          AS menu_item_id,
      mi.name        AS item_name,
      mi.description AS item_description,
      mi.price,
      mi.image_url,
      mi.is_veg,
      mi.category,
      r.id           AS restaurant_id,
      r.name         AS restaurant_name
    FROM cart_items ci
    JOIN menu_items  mi ON mi.id = ci.menu_item_id
    JOIN restaurants r  ON r.id  = ci.restaurant_id
    WHERE ci.user_id = $1
    ORDER BY ci.created_at ASC
  `;
  const { rows } = await query(sql, [userId]);
  return rows;
};

/**
 * Add an item to the cart or increment its quantity if it already exists.
 * @param {{ userId, menuItemId, restaurantId, quantity }} data
 */
const upsertItem = async ({ userId, menuItemId, restaurantId, quantity = 1 }) => {
  const sql = `
    INSERT INTO cart_items (user_id, menu_item_id, restaurant_id, quantity)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id, menu_item_id)
    DO UPDATE SET
      quantity   = cart_items.quantity + EXCLUDED.quantity,
      updated_at = NOW()
    RETURNING *
  `;
  const { rows } = await query(sql, [userId, menuItemId, restaurantId, quantity]);
  return rows[0];
};

/**
 * Set the quantity of a cart item. Caller must ensure the item belongs to userId.
 * @param {string} cartItemId  UUID
 * @param {string} userId      UUID
 * @param {number} quantity    New quantity (> 0)
 */
const updateQuantity = async (cartItemId, userId, quantity) => {
  const { rows } = await query(
    `UPDATE cart_items
     SET quantity = $1, updated_at = NOW()
     WHERE id = $2 AND user_id = $3
     RETURNING *`,
    [quantity, cartItemId, userId],
  );
  return rows[0] || null;
};

/**
 * Remove one item from the cart. Returns the deleted row or null.
 * @param {string} cartItemId  UUID
 * @param {string} userId      UUID
 */
const removeItem = async (cartItemId, userId) => {
  const { rows } = await query(
    `DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING *`,
    [cartItemId, userId],
  );
  return rows[0] || null;
};

/**
 * Remove all cart items for a user.
 * @param {string} userId  UUID
 */
const clearCart = async (userId) => {
  await query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
};

module.exports = {
  createCartItemsTable,
  getByUser,
  upsertItem,
  updateQuantity,
  removeItem,
  clearCart,
};
