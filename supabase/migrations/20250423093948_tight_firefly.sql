/*
  # Add Hotels, Apartments, and Restaurants

  1. New Tables
    - `hotels`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `location` (text)
      - `price_per_night` (numeric)
      - `rating` (numeric)
      - `amenities` (text[])
      - `images` (text[])
      - `created_at` (timestamp with time zone)
    
    - `apartments`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `location` (text)
      - `price_per_night` (numeric)
      - `bedrooms` (integer)
      - `bathrooms` (integer)
      - `amenities` (text[])
      - `images` (text[])
      - `created_at` (timestamp with time zone)
    
    - `restaurants`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `location` (text)
      - `cuisine_type` (text)
      - `price_range` (text)
      - `rating` (numeric)
      - `images` (text[])
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on all tables
    - Add policies for public viewing
*/

-- Create hotels table
CREATE TABLE hotels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  location text NOT NULL,
  price_per_night numeric NOT NULL,
  rating numeric CHECK (rating >= 0 AND rating <= 5),
  amenities text[],
  images text[],
  created_at timestamptz DEFAULT now()
);

-- Create apartments table
CREATE TABLE apartments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  location text NOT NULL,
  price_per_night numeric NOT NULL,
  bedrooms integer NOT NULL,
  bathrooms integer NOT NULL,
  amenities text[],
  images text[],
  created_at timestamptz DEFAULT now()
);

-- Create restaurants table
CREATE TABLE restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  location text NOT NULL,
  cuisine_type text NOT NULL,
  price_range text NOT NULL,
  rating numeric CHECK (rating >= 0 AND rating <= 5),
  images text[],
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Hotels are viewable by everyone"
  ON hotels FOR SELECT
  USING (true);

CREATE POLICY "Apartments are viewable by everyone"
  ON apartments FOR SELECT
  USING (true);

CREATE POLICY "Restaurants are viewable by everyone"
  ON restaurants FOR SELECT
  USING (true);

-- Insert sample data
INSERT INTO hotels (name, description, location, price_per_night, rating, amenities, images) VALUES
(
  'Grand Luxe Hotel',
  'Experience luxury at its finest with panoramic city views and world-class service',
  'Dubai, UAE',
  450,
  4.8,
  ARRAY['Pool', 'Spa', 'Gym', 'Restaurant', 'Room Service'],
  ARRAY['https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg']
),
(
  'Mountain View Resort',
  'Nestled in the heart of the Alps, offering breathtaking mountain views',
  'Zermatt, Switzerland',
  350,
  4.7,
  ARRAY['Ski Access', 'Spa', 'Restaurant', 'Bar'],
  ARRAY['https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg']
);

INSERT INTO apartments (name, description, location, price_per_night, bedrooms, bathrooms, amenities, images) VALUES
(
  'City Center Loft',
  'Modern loft in the heart of the city with stunning views',
  'New York, USA',
  200,
  2,
  1,
  ARRAY['WiFi', 'Kitchen', 'AC', 'Washer'],
  ARRAY['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg']
),
(
  'Beach Front Villa',
  'Luxurious villa with direct beach access',
  'Bali, Indonesia',
  300,
  3,
  2,
  ARRAY['Pool', 'Beach Access', 'Kitchen', 'Garden'],
  ARRAY['https://images.pexels.com/photos/261327/pexels-photo-261327.jpeg']
);

INSERT INTO restaurants (name, description, location, cuisine_type, price_range, rating, images) VALUES
(
  'La Maison',
  'Fine French dining in an elegant setting',
  'Paris, France',
  'French',
  '$$$',
  4.9,
  ARRAY['https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg']
),
(
  'Sushi Master',
  'Authentic Japanese sushi experience',
  'Tokyo, Japan',
  'Japanese',
  '$$',
  4.7,
  ARRAY['https://images.pexels.com/photos/359993/pexels-photo-359993.jpeg']
);