/*
  # Add Administrator and Properties

  1. Changes
    - Add administrator user
    - Add Hotappa Suite Apartment (Hotel Apart)
    - Add Kigali Wings Apartments

  2. Security
    - Maintain existing RLS policies
*/

-- Create users using raw SQL
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'thealphamich@gmail.com',
  crypt('admin', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Administrator"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
), (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'hotappaltd@gmail.com',
  crypt('Hotappa!!!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Hotappa Ltd"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Add Hotappa Suite Apartment
INSERT INTO hotels (
  name,
  description,
  location,
  price_per_night,
  amenities,
  images
) VALUES (
  'Hotappa Suite Apartment',
  'Modern hotel apartment with 12 luxurious 1-bedroom suites',
  'Kigali, Rwanda',
  60,
  ARRAY['1 Bedroom', 'Air Conditioning', 'WiFi', 'Kitchen', 'TV'],
  ARRAY['https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg']
);

-- Add Kigali Wings Apartments
INSERT INTO apartments (name, description, location, price_per_night, bedrooms, bathrooms, amenities, images) VALUES
('Kigali Wings Apartment 1 A', 'Modern 2-bedroom apartment in prime location', 'Kigali, Rwanda', 60, 2, 2, ARRAY['WiFi', 'Kitchen', 'AC'], ARRAY['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg']),
('Kigali Wings Apartment 1 B', 'Modern 2-bedroom apartment in prime location', 'Kigali, Rwanda', 60, 2, 2, ARRAY['WiFi', 'Kitchen', 'AC'], ARRAY['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg']),
('Kigali Wings Apartment 2 A', 'Spacious 4-bedroom apartment', 'Kigali, Rwanda', 80, 4, 3, ARRAY['WiFi', 'Kitchen', 'AC'], ARRAY['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg']),
('Kigali Wings Apartment 2 B', 'Comfortable 3-bedroom apartment', 'Kigali, Rwanda', 70, 3, 2, ARRAY['WiFi', 'Kitchen', 'AC'], ARRAY['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg']),
('Kigali Wings Apartment 2 C', 'Comfortable 3-bedroom apartment', 'Kigali, Rwanda', 70, 3, 2, ARRAY['WiFi', 'Kitchen', 'AC'], ARRAY['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg']),
('Kigali Wings Apartment 3 A', 'Comfortable 3-bedroom apartment', 'Kigali, Rwanda', 70, 3, 2, ARRAY['WiFi', 'Kitchen', 'AC'], ARRAY['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg']),
('Kigali Wings Apartment 3 B', 'Comfortable 3-bedroom apartment', 'Kigali, Rwanda', 70, 3, 2, ARRAY['WiFi', 'Kitchen', 'AC'], ARRAY['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg']),
('Kigali Wings Apartment 3 C', 'Comfortable 3-bedroom apartment', 'Kigali, Rwanda', 70, 3, 2, ARRAY['WiFi', 'Kitchen', 'AC'], ARRAY['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg']),
('Kigali Wings Apartment 4 A', 'Comfortable 3-bedroom apartment', 'Kigali, Rwanda', 70, 3, 2, ARRAY['WiFi', 'Kitchen', 'AC'], ARRAY['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg']),
('Kigali Wings Apartment 4 B', 'Comfortable 3-bedroom apartment', 'Kigali, Rwanda', 70, 3, 2, ARRAY['WiFi', 'Kitchen', 'AC'], ARRAY['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg']),
('Kigali Wings Apartment 4 C', 'Comfortable 3-bedroom apartment', 'Kigali, Rwanda', 70, 3, 2, ARRAY['WiFi', 'Kitchen', 'AC'], ARRAY['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg']),
('Kigali Wings Apartment 4 D', 'Comfortable 3-bedroom apartment', 'Kigali, Rwanda', 70, 3, 2, ARRAY['WiFi', 'Kitchen', 'AC'], ARRAY['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg']),
('Kigali Wings Apartment 5', 'Spacious 4-bedroom apartment', 'Kigali, Rwanda', 80, 4, 3, ARRAY['WiFi', 'Kitchen', 'AC'], ARRAY['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg']),
('Kigali Wings Apartment 6 A', 'Modern 2-bedroom apartment', 'Kigali, Rwanda', 70, 2, 2, ARRAY['WiFi', 'Kitchen', 'AC'], ARRAY['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg']),
('Kigali Wings Apartment 6 B', 'Modern 2-bedroom apartment', 'Kigali, Rwanda', 70, 2, 2, ARRAY['WiFi', 'Kitchen', 'AC'], ARRAY['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg']);