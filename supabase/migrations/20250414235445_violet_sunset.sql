/*
  # Initial Schema for Airbnb Clone

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `full_name` (text)
      - `avatar_url` (text)
      - `created_at` (timestamp with time zone)
    
    - `properties`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `price_per_night` (numeric)
      - `location` (text)
      - `host_id` (uuid, references profiles)
      - `created_at` (timestamp with time zone)
    
    - `bookings`
      - `id` (uuid, primary key)
      - `property_id` (uuid, references properties)
      - `guest_id` (uuid, references profiles)
      - `check_in_date` (date)
      - `check_out_date` (date)
      - `total_price` (numeric)
      - `status` (text)
      - `created_at` (timestamp with time zone)
    
    - `reviews`
      - `id` (uuid, primary key)
      - `property_id` (uuid, references properties)
      - `reviewer_id` (uuid, references profiles)
      - `rating` (integer)
      - `comment` (text)
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create properties table
CREATE TABLE properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price_per_night numeric NOT NULL,
  location text NOT NULL,
  host_id uuid REFERENCES profiles NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties NOT NULL,
  guest_id uuid REFERENCES profiles NOT NULL,
  check_in_date date NOT NULL,
  check_out_date date NOT NULL,
  total_price numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Create reviews table
CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties NOT NULL,
  reviewer_id uuid REFERENCES profiles NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Properties policies
CREATE POLICY "Properties are viewable by everyone"
  ON properties FOR SELECT
  USING (true);

CREATE POLICY "Hosts can create properties"
  ON properties FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM profiles WHERE id = host_id
  ));

CREATE POLICY "Hosts can update own properties"
  ON properties FOR UPDATE
  USING (auth.uid() IN (
    SELECT user_id FROM profiles WHERE id = host_id
  ));

-- Bookings policies
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM profiles WHERE id = guest_id
  ));

CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM profiles WHERE id = guest_id
  ));

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM profiles WHERE id = reviewer_id
  ));