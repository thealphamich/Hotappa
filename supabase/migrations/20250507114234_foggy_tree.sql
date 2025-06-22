/*
  # Add Restaurant Menus and Location Coordinates

  1. New Tables
    - `menu_items`
      - `id` (uuid, primary key)
      - `restaurant_id` (uuid, references restaurants)
      - `name` (text)
      - `description` (text)
      - `category` (text)
      - `price` (numeric)
      - `image_url` (text)
      - `created_at` (timestamp with time zone)

  2. Changes
    - Add latitude and longitude to restaurants, hotels, and apartments
    - Enable RLS on menu_items table
    - Add policies for menu item management
    - Add sample menu items
*/

-- Create menu_items table
CREATE TABLE menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid REFERENCES restaurants NOT NULL,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  price numeric NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Add coordinates to restaurants
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS latitude numeric,
ADD COLUMN IF NOT EXISTS longitude numeric;

-- Add coordinates to hotels
ALTER TABLE hotels 
ADD COLUMN IF NOT EXISTS latitude numeric,
ADD COLUMN IF NOT EXISTS longitude numeric;

-- Add coordinates to apartments
ALTER TABLE apartments 
ADD COLUMN IF NOT EXISTS latitude numeric,
ADD COLUMN IF NOT EXISTS longitude numeric;

-- Enable RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Menu items are viewable by everyone"
  ON menu_items FOR SELECT
  USING (true);

-- Add sample menu items for existing restaurants
INSERT INTO menu_items (restaurant_id, name, description, category, price, image_url) VALUES
(
  (SELECT id FROM restaurants WHERE name = 'La Maison' LIMIT 1),
  'Coq au Vin',
  'Classic French chicken braised in wine, mushrooms, and pearl onions',
  'Main Course',
  32.00,
  'https://images.pexels.com/photos/2673353/pexels-photo-2673353.jpeg'
),
(
  (SELECT id FROM restaurants WHERE name = 'La Maison' LIMIT 1),
  'Crème Brûlée',
  'Traditional vanilla custard with caramelized sugar crust',
  'Dessert',
  12.00,
  'https://images.pexels.com/photos/6163263/pexels-photo-6163263.jpeg'
),
(
  (SELECT id FROM restaurants WHERE name = 'Sushi Master' LIMIT 1),
  'Omakase Set',
  'Chef''s selection of premium sushi and sashimi',
  'Main Course',
  85.00,
  'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg'
),
(
  (SELECT id FROM restaurants WHERE name = 'Sushi Master' LIMIT 1),
  'Matcha Ice Cream',
  'Homemade green tea ice cream',
  'Dessert',
  8.00,
  'https://images.pexels.com/photos/5946081/pexels-photo-5946081.jpeg'
);