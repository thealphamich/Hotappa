/*
  # Add Sample Properties for Categories and Update Locations

  1. New Sample Data
    - Add properties for each category (Beach, Islands, Castles, Mountains)
    - Update existing properties with precise locations
    - Add more restaurants in Rwanda and internationally

  2. Changes
    - Add precise location data for Google Maps integration
    - Add high-quality images from Pexels
    - Add detailed descriptions and amenities
*/

-- Beach Properties
INSERT INTO hotels (name, description, location, price_per_night, rating, amenities, images, categories) VALUES
(
  'Zanzibar Beach Resort',
  'Luxurious beachfront resort with private beach access and stunning ocean views',
  'Nungwi Beach, Zanzibar, Tanzania',
  450,
  4.8,
  ARRAY['Private Beach', 'Infinity Pool', 'Spa', 'Water Sports', 'Restaurant', 'Bar'],
  ARRAY['https://images.pexels.com/photos/1287460/pexels-photo-1287460.jpeg'],
  ARRAY['Beach', 'Lux']
),
(
  'Maldives Paradise Resort',
  'Overwater villas with direct lagoon access and house reef',
  'Maafushi, Maldives',
  800,
  4.9,
  ARRAY['Overwater Villa', 'Private Pool', 'Snorkeling', 'Spa', 'Water Sports'],
  ARRAY['https://images.pexels.com/photos/3601425/pexels-photo-3601425.jpeg'],
  ARRAY['Beach', 'Islands', 'Lux']
);

-- Island Properties
INSERT INTO hotels (name, description, location, price_per_night, rating, amenities, images, categories) VALUES
(
  'Santorini Cliff Resort',
  'Stunning clifftop hotel with caldera views and infinity pools',
  'Oia, Santorini, Greece',
  600,
  4.9,
  ARRAY['Infinity Pool', 'Restaurant', 'Bar', 'Spa', 'Sea View'],
  ARRAY['https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg'],
  ARRAY['Islands', 'Lux']
);

-- Castle Properties
INSERT INTO hotels (name, description, location, price_per_night, rating, amenities, images, categories) VALUES
(
  'Ashford Castle Hotel',
  'Medieval castle turned luxury hotel with royal heritage',
  'Cong, County Mayo, Ireland',
  950,
  4.9,
  ARRAY['Falconry', 'Golf Course', 'Spa', 'Fine Dining', 'Wine Cellar'],
  ARRAY['https://images.pexels.com/photos/2832034/pexels-photo-2832034.jpeg'],
  ARRAY['Castles', 'Historic', 'Lux']
),
(
  'Edinburgh Castle View Hotel',
  'Boutique hotel with panoramic views of Edinburgh Castle',
  'Grassmarket, Edinburgh, Scotland',
  400,
  4.7,
  ARRAY['Castle View', 'Restaurant', 'Bar', 'Historic Tours'],
  ARRAY['https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg'],
  ARRAY['Historic', 'City']
);

-- Mountain Properties
INSERT INTO hotels (name, description, location, price_per_night, rating, amenities, images, categories) VALUES
(
  'Swiss Alps Chalet',
  'Luxury mountain chalet with ski-in/ski-out access',
  'Zermatt, Switzerland',
  750,
  4.8,
  ARRAY['Ski Access', 'Hot Tub', 'Fireplace', 'Mountain View', 'Sauna'],
  ARRAY['https://images.pexels.com/photos/754268/pexels-photo-754268.jpeg'],
  ARRAY['Mountains', 'Skiing']
);

-- Add Rwandan Restaurants
INSERT INTO restaurants (name, description, location, cuisine_type, price_range, rating, images) VALUES
(
  'Repub Lounge Kigali',
  'Modern African cuisine with panoramic city views',
  'KG 674 St, Kigali, Rwanda',
  'African Fusion',
  '$$$',
  4.7,
  ARRAY['https://images.pexels.com/photos/2290070/pexels-photo-2290070.jpeg']
),
(
  'Heaven Restaurant & Boutique Hotel',
  'International cuisine using local ingredients',
  'KG 5 Ave, Kigali, Rwanda',
  'International',
  '$$$',
  4.8,
  ARRAY['https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg']
),
(
  'Poivre Noir',
  'Fine French dining in the heart of Kigali',
  'KG 15 Ave, Kigali, Rwanda',
  'French',
  '$$$',
  4.6,
  ARRAY['https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg']
);

-- Update existing properties with precise locations
UPDATE hotels 
SET location = 'Palm Jumeirah, Dubai, United Arab Emirates'
WHERE name = 'Grand Luxe Hotel';

UPDATE apartments 
SET location = '123 West 57th Street, New York, NY 10019, USA'
WHERE name = 'City Center Loft';

UPDATE restaurants 
SET location = '82 Avenue des Champs-Élysées, 75008 Paris, France'
WHERE name = 'La Maison';