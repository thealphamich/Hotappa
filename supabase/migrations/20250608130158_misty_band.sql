/*
  # Property Availability Calendar System

  1. New Tables
    - `property_availability`
      - `id` (uuid, primary key)
      - `property_id` (uuid, references properties)
      - `property_type` (text) - 'hotel', 'apartment', 'restaurant'
      - `date` (date)
      - `available` (boolean)
      - `price_override` (numeric) - optional price override for specific dates
      - `minimum_stay_override` (integer) - optional minimum stay override
      - `notes` (text) - internal notes for hosts
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

    - `blocked_dates`
      - `id` (uuid, primary key)
      - `property_id` (uuid, references properties)
      - `property_type` (text)
      - `start_date` (date)
      - `end_date` (date)
      - `reason` (text) - 'maintenance', 'personal_use', 'other'
      - `notes` (text)
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on all tables
    - Add policies for hosts to manage their property availability
    - Add policies for guests to view availability

  3. Indexes
    - Add indexes for efficient date range queries
    - Add composite indexes for property + date lookups
*/

-- Create property_availability table
CREATE TABLE IF NOT EXISTS property_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL,
  property_type text NOT NULL CHECK (property_type IN ('hotel', 'apartment', 'restaurant')),
  date date NOT NULL,
  available boolean DEFAULT true,
  price_override numeric,
  minimum_stay_override integer,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(property_id, property_type, date)
);

-- Create blocked_dates table
CREATE TABLE IF NOT EXISTS blocked_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL,
  property_type text NOT NULL CHECK (property_type IN ('hotel', 'apartment', 'restaurant')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text DEFAULT 'other' CHECK (reason IN ('maintenance', 'personal_use', 'other')),
  notes text,
  created_at timestamptz DEFAULT now(),
  CHECK (end_date >= start_date)
);

-- Enable Row Level Security
ALTER TABLE property_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

-- Availability policies
CREATE POLICY "Anyone can view property availability"
  ON property_availability FOR SELECT
  USING (true);

CREATE POLICY "Hosts can manage their property availability"
  ON property_availability FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE id IN (
        SELECT host_id FROM hotels WHERE id = property_id AND property_type = 'hotel'
        UNION
        SELECT host_id FROM apartments WHERE id = property_id AND property_type = 'apartment'
        UNION
        SELECT host_id FROM restaurants WHERE id = property_id AND property_type = 'restaurant'
      )
    )
  );

-- Blocked dates policies
CREATE POLICY "Anyone can view blocked dates"
  ON blocked_dates FOR SELECT
  USING (true);

CREATE POLICY "Hosts can manage their property blocked dates"
  ON blocked_dates FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE id IN (
        SELECT host_id FROM hotels WHERE id = property_id AND property_type = 'hotel'
        UNION
        SELECT host_id FROM apartments WHERE id = property_id AND property_type = 'apartment'
        UNION
        SELECT host_id FROM restaurants WHERE id = property_id AND property_type = 'restaurant'
      )
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_property_availability_property_date 
  ON property_availability(property_id, property_type, date);

CREATE INDEX IF NOT EXISTS idx_property_availability_date 
  ON property_availability(date);

CREATE INDEX IF NOT EXISTS idx_blocked_dates_property_dates 
  ON blocked_dates(property_id, property_type, start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_blocked_dates_date_range 
  ON blocked_dates(start_date, end_date);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_property_availability_updated_at 
  BEFORE UPDATE ON property_availability 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check availability for a date range
CREATE OR REPLACE FUNCTION check_property_availability(
  p_property_id uuid,
  p_property_type text,
  p_start_date date,
  p_end_date date
)
RETURNS boolean AS $$
DECLARE
  unavailable_count integer;
  blocked_count integer;
BEGIN
  -- Check for explicitly unavailable dates
  SELECT COUNT(*) INTO unavailable_count
  FROM property_availability
  WHERE property_id = p_property_id
    AND property_type = p_property_type
    AND date >= p_start_date
    AND date < p_end_date
    AND available = false;

  -- Check for blocked date ranges
  SELECT COUNT(*) INTO blocked_count
  FROM blocked_dates
  WHERE property_id = p_property_id
    AND property_type = p_property_type
    AND start_date <= p_end_date
    AND end_date >= p_start_date;

  -- Return true if no unavailable or blocked dates found
  RETURN (unavailable_count = 0 AND blocked_count = 0);
END;
$$ LANGUAGE plpgsql;

-- Function to get availability calendar for a property
CREATE OR REPLACE FUNCTION get_property_calendar(
  p_property_id uuid,
  p_property_type text,
  p_start_date date,
  p_end_date date
)
RETURNS TABLE(
  date date,
  available boolean,
  price_override numeric,
  minimum_stay_override integer,
  blocked boolean,
  block_reason text
) AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(p_start_date, p_end_date, '1 day'::interval)::date AS cal_date
  ),
  availability_data AS (
    SELECT 
      ds.cal_date,
      COALESCE(pa.available, true) AS available,
      pa.price_override,
      pa.minimum_stay_override,
      CASE 
        WHEN bd.id IS NOT NULL THEN true 
        ELSE false 
      END AS blocked,
      bd.reason AS block_reason
    FROM date_series ds
    LEFT JOIN property_availability pa ON (
      pa.property_id = p_property_id 
      AND pa.property_type = p_property_type 
      AND pa.date = ds.cal_date
    )
    LEFT JOIN blocked_dates bd ON (
      bd.property_id = p_property_id 
      AND bd.property_type = p_property_type 
      AND ds.cal_date >= bd.start_date 
      AND ds.cal_date <= bd.end_date
    )
  )
  SELECT 
    ad.cal_date,
    ad.available AND NOT ad.blocked AS available,
    ad.price_override,
    ad.minimum_stay_override,
    ad.blocked,
    ad.block_reason
  FROM availability_data ad
  ORDER BY ad.cal_date;
END;
$$ LANGUAGE plpgsql;