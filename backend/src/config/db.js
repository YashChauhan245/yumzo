const { Pool } = require('pg');

// Create a connection pool using the DATABASE_URL from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase / hosted Postgres needs SSL in production
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

// Helper to run a SQL query
const query = (text, params) => pool.query(text, params);

module.exports = { query, pool };
