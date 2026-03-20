const { query } = require('../config/db');

/**
 * Create the orders and order_items tables if they don't already exist.
 */
const createOrderTables = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS orders (
      id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id          UUID          NOT NULL REFERENCES users (id) ON DELETE CASCADE,
      restaurant_id    UUID          NOT NULL REFERENCES restaurants (id) ON DELETE CASCADE,
      status           VARCHAR(30)   NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending', 'confirmed', 'preparing',
                                         'out_for_delivery', 'delivered', 'cancelled')),
      total_amount     NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
      delivery_address TEXT          NOT NULL,
      notes            TEXT,
      created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_orders_user       ON orders (user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders (restaurant_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders (status);

    CREATE TABLE IF NOT EXISTS order_items (
      id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id     UUID          NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
      menu_item_id UUID          NOT NULL REFERENCES menu_items (id) ON DELETE RESTRICT,
      name         VARCHAR(150)  NOT NULL,
      price        NUMERIC(10,2) NOT NULL CHECK (price >= 0),
      quantity     INTEGER       NOT NULL CHECK (quantity > 0),
      created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items (order_id);
  `;
  await query(sql);
};

/**
 * Create an order together with its line items inside a single transaction.
 * @param {{
 *   userId: string,
 *   restaurantId: string,
 *   deliveryAddress: string,
 *   notes?: string,
 *   items: Array<{ menuItemId: string, name: string, price: number, quantity: number }>
 * }} data
 */
const createOrder = async ({ userId, restaurantId, deliveryAddress, notes = null, items }) => {
  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // ── Insert the order ───────────────────────────────────────────────────────
  const { rows: orderRows } = await query(
    `INSERT INTO orders (user_id, restaurant_id, total_amount, delivery_address, notes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, restaurantId, totalAmount.toFixed(2), deliveryAddress, notes],
  );
  const order = orderRows[0];

  // ── Insert each line item ──────────────────────────────────────────────────
  const insertedItems = [];
  for (const item of items) {
    const { rows } = await query(
      `INSERT INTO order_items (order_id, menu_item_id, name, price, quantity)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [order.id, item.menuItemId, item.name, item.price, item.quantity],
    );
    insertedItems.push(rows[0]);
  }

  return { ...order, items: insertedItems };
};

/**
 * Return all orders for a user, newest first (without line items).
 * @param {string} userId  UUID
 */
const findByUser = async (userId) => {
  const sql = `
    SELECT
      o.id, o.user_id, o.status, o.total_amount,
      o.delivery_address, o.notes, o.created_at,
      r.id   AS restaurant_id,
      r.name AS restaurant_name
    FROM orders o
    JOIN restaurants r ON r.id = o.restaurant_id
    WHERE o.user_id = $1
    ORDER BY o.created_at DESC
  `;
  const { rows } = await query(sql, [userId]);
  return rows;
};

/**
 * Return a single order with its line items.
 * @param {string} orderId  UUID
 * @param {string} userId   UUID — ensures users can only see their own orders
 */
const findById = async (orderId, userId) => {
  const { rows: orderRows } = await query(
    `SELECT
       o.id, o.user_id, o.status, o.total_amount,
       o.delivery_address, o.notes, o.created_at,
       r.id   AS restaurant_id,
       r.name AS restaurant_name
     FROM orders o
     JOIN restaurants r ON r.id = o.restaurant_id
     WHERE o.id = $1 AND o.user_id = $2
     LIMIT 1`,
    [orderId, userId],
  );

  if (!orderRows[0]) return null;

  const { rows: itemRows } = await query(
    `SELECT id, menu_item_id, name, price, quantity, created_at
     FROM order_items
     WHERE order_id = $1
     ORDER BY created_at ASC`,
    [orderId],
  );

  return { ...orderRows[0], items: itemRows };
};

/**
 * Update the status of an order.
 * @param {string} orderId  UUID
 * @param {string} status   New status
 */
const updateStatus = async (orderId, status) => {
  const { rows } = await query(
    `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, orderId],
  );
  return rows[0] || null;
};

module.exports = { createOrderTables, createOrder, findByUser, findById, updateStatus };
