/*
  # Add Test Restaurant for Map Testing

  1. New Restaurant
    - Add a test restaurant in Kigali with menu items
    - This will help us test the map functionality

  2. Security
    - Maintain existing RLS policies
*/

-- Add test restaurant in Kigali
INSERT INTO restaurants (name, description, location, cuisine_type, price_range, rating, images, latitude, longitude, contact_email, contact_phone) VALUES
(
  'Kigali Fusion Bistro',
  'Modern fusion cuisine combining African flavors with international techniques. Located in the heart of Kigali with stunning city views.',
  'KG 123 Ave, Kimisagara, Kigali, Rwanda',
  'Fusion',
  '$$',
  4.5,
  ARRAY['https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg', 'https://images.pexels.com/photos/2290070/pexels-photo-2290070.jpeg'],
  -1.9441,
  30.0619,
  'info@kigalifusion.rw',
  '+250 788 123 456'
);

-- Add menu items for the test restaurant
INSERT INTO menu_items (restaurant_id, name, description, category, price, image_url)
SELECT 
  r.id,
  'Rwandan Beef Stew',
  'Traditional Rwandan beef stew with local vegetables and spices',
  'Main Course',
  18.00,
  'https://images.pexels.com/photos/2673353/pexels-photo-2673353.jpeg'
FROM restaurants r
WHERE r.name = 'Kigali Fusion Bistro';

INSERT INTO menu_items (restaurant_id, name, description, category, price, image_url)
SELECT 
  r.id,
  'Ubwoba (Mushroom Soup)',
  'Creamy local mushroom soup with herbs',
  'Appetizer',
  8.00,
  'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg'
FROM restaurants r
WHERE r.name = 'Kigali Fusion Bistro';

INSERT INTO menu_items (restaurant_id, name, description, category, price, image_url)
SELECT 
  r.id,
  'Banana Beer Float',
  'Traditional banana beer with vanilla ice cream',
  'Dessert',
  6.00,
  'https://images.pexels.com/photos/1233319/pexels-photo-1233319.jpeg'
FROM restaurants r
WHERE r.name = 'Kigali Fusion Bistro';

INSERT INTO menu_items (restaurant_id, name, description, category, price, image_url)
SELECT 
  r.id,
  'Igikoma (Grilled Fish)',
  'Fresh tilapia grilled with local spices and served with steamed rice',
  'Main Course',
  15.00,
  'https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg'
FROM restaurants r
WHERE r.name = 'Kigali Fusion Bistro';