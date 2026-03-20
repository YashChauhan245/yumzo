-- ============================================================
-- Yumzo Database Schema — Phase 1: Authentication
-- Run against your Supabase / PostgreSQL database
-- ============================================================

-- Enable UUID generation (available by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Users ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    TEXT         NOT NULL,           -- bcrypt hash
  phone       VARCHAR(20),
  role        VARCHAR(20)  NOT NULL DEFAULT 'customer'
              CHECK (role IN ('customer', 'restaurant_owner', 'delivery_agent', 'admin')),
  avatar_url  TEXT,
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- ── Auto-update updated_at ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_users_updated_at ON users;
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
-- Phase 2: Restaurants & Menu Items
-- ============================================================

-- ── Restaurants ───────────────────────────────────────────────────────────────
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
  rating       NUMERIC(3, 2) NOT NULL DEFAULT 0.00
               -- NUMERIC(3,2) stores values 0.00–9.99; CHECK restricts to 0–5
               CHECK (rating >= 0 AND rating <= 5),
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_restaurants_city        ON restaurants (city);
CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine     ON restaurants (cuisine_type);
CREATE INDEX IF NOT EXISTS idx_restaurants_is_active   ON restaurants (is_active);

DROP TRIGGER IF EXISTS set_restaurants_updated_at ON restaurants;
CREATE TRIGGER set_restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- ── Menu items ────────────────────────────────────────────────────────────────
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

CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant   ON menu_items (restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category     ON menu_items (category);
CREATE INDEX IF NOT EXISTS idx_menu_items_available    ON menu_items (is_available);

DROP TRIGGER IF EXISTS set_menu_items_updated_at ON menu_items;
CREATE TRIGGER set_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

