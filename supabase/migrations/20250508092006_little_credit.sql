/*
  # Add Restaurant Menu Items and Location Coordinates

  1. Changes
    - Add coordinates to restaurants, hotels, and apartments
    - Add sample menu items for restaurants
    - Update RLS policies
*/

-- Add coordinates to restaurants if they don't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'restaurants' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN latitude numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'restaurants' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE restaurants ADD COLUMN longitude numeric;
  END IF;
END $$;

-- Add coordinates to hotels if they don't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hotels' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE hotels ADD COLUMN latitude numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hotels' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE hotels ADD COLUMN longitude numeric;
  END IF;
END $$;

-- Add coordinates to apartments if they don't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'apartments' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE apartments ADD COLUMN latitude numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'apartments' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE apartments ADD COLUMN longitude numeric;
  END IF;
END $$;

-- Add sample menu items for existing restaurants if they don't exist
INSERT INTO menu_items (restaurant_id, name, description, category, price, image_url)
SELECT r.id, 'Coq au Vin', 'Classic French chicken braised in wine, mushrooms, and pearl onions', 'Main Course', 32.00, 'https://images.pexels.com/photos/2673353/pexels-photo-2673353.jpeg'
FROM restaurants r
WHERE r.name = 'La Maison'
AND NOT EXISTS (
  SELECT 1 FROM menu_items WHERE restaurant_id = r.id AND name = 'Coq au Vin'
);

INSERT INTO menu_items (restaurant_id, name, description, category, price, image_url)
SELECT r.id, 'Crème Brûlée', 'Traditional vanilla custard with caramelized sugar crust', 'Dessert', 12.00, 'https://images.pexels.com/photos/6163263/pexels-photo-6163263.jpeg'
FROM restaurants r
WHERE r.name = 'La Maison'
AND NOT EXISTS (
  SELECT 1 FROM menu_items WHERE restaurant_id = r.id AND name = 'Crème Brûlée'
);

INSERT INTO menu_items (restaurant_id, name, description, category, price, image_url)
SELECT r.id, 'Omakase Set', 'Chef''s selection of premium sushi and sashimi', 'Main Course', 85.00, 'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg'
FROM restaurants r
WHERE r.name = 'Sushi Master'
AND NOT EXISTS (
  SELECT 1 FROM menu_items WHERE restaurant_id = r.id AND name = 'Omakase Set'
);

INSERT INTO menu_items (restaurant_id, name, description, category, price, image_url)
SELECT r.id, 'Matcha Ice Cream', 'Homemade green tea ice cream', 'Dessert', 8.00, 'https://images.pexels.com/photos/5946081/pexels-photo-5946081.jpeg'
FROM restaurants r
WHERE r.name = 'Sushi Master'
AND NOT EXISTS (
  SELECT 1 FROM menu_items WHERE restaurant_id = r.id AND name = 'Matcha Ice Cream'
);