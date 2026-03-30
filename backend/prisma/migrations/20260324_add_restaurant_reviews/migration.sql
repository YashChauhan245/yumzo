-- Add restaurant reviews table for customer ratings and text feedback.
-- This migration is intentionally small and isolated.

CREATE TABLE IF NOT EXISTS restaurant_reviews (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  restaurant_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT restaurant_reviews_user_restaurant_unique UNIQUE (user_id, restaurant_id)
);

CREATE INDEX IF NOT EXISTS idx_restaurant_reviews_restaurant_id
  ON restaurant_reviews (restaurant_id);

CREATE INDEX IF NOT EXISTS idx_restaurant_reviews_user_id
  ON restaurant_reviews (user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'restaurant_reviews_user_id_fkey'
  ) THEN
    ALTER TABLE restaurant_reviews
      ADD CONSTRAINT restaurant_reviews_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'restaurant_reviews_restaurant_id_fkey'
  ) THEN
    ALTER TABLE restaurant_reviews
      ADD CONSTRAINT restaurant_reviews_restaurant_id_fkey
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE;
  END IF;
END $$;
