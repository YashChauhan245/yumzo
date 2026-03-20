const { query } = require('../config/db');

/**
 * Create the payments table if it doesn't already exist.
 */
const createPaymentsTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS payments (
      id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id         UUID          NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
      user_id          UUID          NOT NULL REFERENCES users (id) ON DELETE CASCADE,
      amount           NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
      payment_method   VARCHAR(30)   NOT NULL
                       CHECK (payment_method IN ('card', 'upi', 'cash_on_delivery')),
      payment_status   VARCHAR(20)   NOT NULL DEFAULT 'pending'
                       CHECK (payment_status IN ('pending', 'success', 'failed')),
      transaction_id   VARCHAR(100),   -- set on success
      failure_reason   TEXT,           -- set on failure
      created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_payments_order  ON payments (order_id);
    CREATE INDEX IF NOT EXISTS idx_payments_user   ON payments (user_id);
    CREATE INDEX IF NOT EXISTS idx_payments_status ON payments (payment_status);
  `;
  await query(sql);
};

/**
 * Insert a payment record and return it.
 * @param {{
 *   orderId: string,
 *   userId: string,
 *   amount: number,
 *   paymentMethod: string,
 *   paymentStatus: 'success' | 'failed' | 'pending',
 *   transactionId?: string | null,
 *   failureReason?: string | null
 * }} data
 */
const create = async ({
  orderId,
  userId,
  amount,
  paymentMethod,
  paymentStatus,
  transactionId = null,
  failureReason = null,
}) => {
  const { rows } = await query(
    `INSERT INTO payments
       (order_id, user_id, amount, payment_method, payment_status, transaction_id, failure_reason)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [orderId, userId, amount, paymentMethod, paymentStatus, transactionId, failureReason],
  );
  return rows[0];
};

/**
 * Return the payment record for a given order id.
 * @param {string} orderId  UUID
 */
const findByOrderId = async (orderId) => {
  const { rows } = await query(
    `SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [orderId],
  );
  return rows[0] || null;
};

/**
 * Return all payment records for a given user (newest first).
 * @param {string} userId  UUID
 */
const findByUser = async (userId) => {
  const { rows } = await query(
    `SELECT p.*, o.status AS order_status
     FROM payments p
     JOIN orders o ON o.id = p.order_id
     WHERE p.user_id = $1
     ORDER BY p.created_at DESC`,
    [userId],
  );
  return rows;
};

module.exports = { createPaymentsTable, create, findByOrderId, findByUser };
