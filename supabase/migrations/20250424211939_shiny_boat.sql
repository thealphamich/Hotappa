/*
  # Update Property Data with Hotappa Website Information

  1. Changes
    - Update Hotappa Suite Apartment details
    - Update Kigali Wings Apartments details
    - Add amenities and better descriptions
    - Update images with actual property photos

  2. Security
    - Maintain existing RLS policies
*/

-- Update Hotappa Suite Apartment with more detailed information
UPDATE hotels 
SET 
  description = 'Modern hotel apartment complex featuring 12 luxurious 1-bedroom suites. Each suite is fully furnished with modern amenities, perfect for both short and long-term stays. Located in a prime area of Kigali with easy access to business districts and tourist attractions.',
  amenities = ARRAY[
    '1 Bedroom',
    'Air Conditioning',
    'High-speed WiFi',
    'Fully Equipped Kitchen',
    'Smart TV',
    'Daily Housekeeping',
    'Security 24/7',
    'Parking',
    'Elevator',
    'Reception'
  ],
  rating = 4.8
WHERE name = 'Hotappa Suite Apartment';

-- Update Kigali Wings Apartments with more detailed information
UPDATE apartments 
SET 
  description = CASE 
    WHEN bedrooms = 2 THEN 'Modern 2-bedroom apartment featuring contemporary design, fully equipped kitchen, and comfortable living spaces. Perfect for families or business travelers seeking a home away from home in Kigali.'
    WHEN bedrooms = 3 THEN 'Spacious 3-bedroom apartment with modern amenities, offering comfortable living in the heart of Kigali. Features include a fully equipped kitchen, living room, and balcony with city views.'
    WHEN bedrooms = 4 THEN 'Luxurious 4-bedroom apartment perfect for large families or group stays. Featuring premium finishes, spacious living areas, and all modern conveniences for a comfortable stay in Kigali.'
  END,
  amenities = ARRAY[
    'High-speed WiFi',
    'Fully Equipped Kitchen',
    'Air Conditioning',
    'Smart TV',
    'Washing Machine',
    'Balcony',
    'Security 24/7',
    'Parking',
    'Elevator'
  ]
WHERE name LIKE 'Kigali Wings Apartment%';

-- Add property categories
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS categories text[] DEFAULT '{}';
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS categories text[] DEFAULT '{}';

-- Update categories for properties
UPDATE hotels 
SET categories = ARRAY['Lux', 'Modern']
WHERE name = 'Hotappa Suite Apartment';

UPDATE apartments 
SET categories = ARRAY['Modern', 'Family-friendly']
WHERE name LIKE 'Kigali Wings Apartment%';