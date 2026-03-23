/* eslint-disable no-console */
const prisma = require('../config/prisma');

// One-time helper for older DBs where constraints/schema drift from current Prisma model.
// Safe to run multiple times; it recreates constraints with IF EXISTS guards.

(async () => {
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE orders ADD COLUMN IF NOT EXISTS driver_id uuid NULL');

    await prisma.$executeRawUnsafe('ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check');
    await prisma.$executeRawUnsafe(
      "ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending','confirmed','preparing','picked_up','out_for_delivery','delivered','cancelled'))",
    );

    await prisma.$executeRawUnsafe('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
    await prisma.$executeRawUnsafe(
      "ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('customer','admin','driver','delivery_agent','restaurant_owner'))",
    );

    console.log('DB compatibility patch applied successfully');
  } catch (error) {
    console.error('Failed applying DB compatibility patch:', error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
