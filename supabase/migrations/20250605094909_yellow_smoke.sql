/*
  # Enhance Property and Restaurant Listings

  1. Changes
    - Add business hours to restaurants
    - Add capacity and availability tracking to properties
    - Add contact information
    - Add search optimization indexes
    - Add property management policies
    - Update sample data

  2. Security
    - Add RLS policies for property management
*/

-- Add business hours to restaurants
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS business_hours jsonb DEFAULT '{
  "monday": {"open": "09:00", "close": "22:00"},
  "tuesday": {"open": "09:00", "close": "22:00"},
  "wednesday": {"open": "09:00", "close": "22:00"},
  "thursday": {"open": "09:00", "close": "22:00"},
  "friday": {"open": "09:00", "close": "23:00"},
  "saturday": {"open": "10:00", "close": "23:00"},
  "sunday": {"open": "10:00", "close": "22:00"}
}'::jsonb;

-- Add capacity and availability to properties
ALTER TABLE hotels
ADD COLUMN IF NOT EXISTS total_rooms integer,
ADD COLUMN IF NOT EXISTS available_rooms integer,
ADD COLUMN IF NOT EXISTS check_in_time time DEFAULT '15:00',
ADD COLUMN IF NOT EXISTS check_out_time time DEFAULT '11:00',
ADD COLUMN IF NOT EXISTS minimum_stay integer DEFAULT 1;

ALTER TABLE apartments
ADD COLUMN IF NOT EXISTS max_guests integer,
ADD COLUMN IF NOT EXISTS check_in_time time DEFAULT '15:00',
ADD COLUMN IF NOT EXISTS check_out_time time DEFAULT '11:00',
ADD COLUMN IF NOT EXISTS minimum_stay integer DEFAULT 1;

-- Add contact information
ALTER TABLE hotels
ADD COLUMN IF NOT EXISTS contact_email text,
ADD COLUMN IF NOT EXISTS contact_phone text,
ADD COLUMN IF NOT EXISTS website text;

ALTER TABLE apartments
ADD COLUMN IF NOT EXISTS contact_email text,
ADD COLUMN IF NOT EXISTS contact_phone text,
ADD COLUMN IF NOT EXISTS website text;

ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS contact_email text,
ADD COLUMN IF NOT EXISTS contact_phone text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS reservation_required boolean DEFAULT false;

-- Add search optimization indexes
CREATE INDEX IF NOT EXISTS idx_hotels_price ON hotels(price_per_night);
CREATE INDEX IF NOT EXISTS idx_hotels_rating ON hotels(rating);
CREATE INDEX IF NOT EXISTS idx_hotels_location ON hotels USING gin(to_tsvector('english', location));

CREATE INDEX IF NOT EXISTS idx_apartments_price ON apartments(price_per_night);
CREATE INDEX IF NOT EXISTS idx_apartments_bedrooms ON apartments(bedrooms);
CREATE INDEX IF NOT EXISTS idx_apartments_location ON apartments USING gin(to_tsvector('english', location));

CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine ON restaurants(cuisine_type);
CREATE INDEX IF NOT EXISTS idx_restaurants_rating ON restaurants(rating);
CREATE INDEX IF NOT EXISTS idx_restaurants_location ON restaurants USING gin(to_tsvector('english', location));

-- Add host_id column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hotels' AND column_name = 'host_id'
  ) THEN
    ALTER TABLE hotels ADD COLUMN host_id uuid REFERENCES profiles(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'apartments' AND column_name = 'host_id'
  ) THEN
    ALTER TABLE apartments ADD COLUMN host_id uuid REFERENCES profiles(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'restaurants' AND column_name = 'host_id'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN host_id uuid REFERENCES profiles(id);
  END IF;
END $$;

-- Add property management policies
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Hosts can update their hotels'
  ) THEN
    CREATE POLICY "Hosts can update their hotels"
      ON hotels FOR UPDATE
      USING (auth.uid() IN (
        SELECT user_id FROM profiles WHERE id = host_id
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Hosts can update their apartments'
  ) THEN
    CREATE POLICY "Hosts can update their apartments"
      ON apartments FOR UPDATE
      USING (auth.uid() IN (
        SELECT user_id FROM profiles WHERE id = host_id
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Hosts can update their restaurants'
  ) THEN
    CREATE POLICY "Hosts can update their restaurants"
      ON restaurants FOR UPDATE
      USING (auth.uid() IN (
        SELECT user_id FROM profiles WHERE id = host_id
      ));
  END IF;
END $$;

-- Update existing properties with sample data
UPDATE hotels SET
  total_rooms = FLOOR(random() * 50 + 10)::integer,
  available_rooms = FLOOR(random() * 10 + 1)::integer,
  contact_email = 'info@' || lower(regexp_replace(name, '[^a-zA-Z0-9]', '', 'g')) || '.com',
  contact_phone = '+1' || floor(random() * 9000000000 + 1000000000)::text
WHERE total_rooms IS NULL;

UPDATE apartments SET
  max_guests = bedrooms * 2 + 2,
  contact_email = 'info@' || lower(regexp_replace(name, '[^a-zA-Z0-9]', '', 'g')) || '.com',
  contact_phone = '+1' || floor(random() * 9000000000 + 1000000000)::text
WHERE max_guests IS NULL;

UPDATE restaurants SET
  contact_email = 'info@' || lower(regexp_replace(name, '[^a-zA-Z0-9]', '', 'g')) || '.com',
  contact_phone = '+1' || floor(random() * 9000000000 + 1000000000)::text,
  reservation_required = random() > 0.5
WHERE contact_email IS NULL;