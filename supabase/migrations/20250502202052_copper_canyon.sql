/*
  # Add test reviews and improve review system

  1. Changes
    - Add sample reviews for testing
    - Add indexes for better performance
    - Add constraints for data integrity
    - Add RLS policies for review management

  2. Security
    - Maintain existing RLS policies
    - Add policies for review management
*/

-- Add sample reviews
INSERT INTO reviews (property_id, reviewer_id, rating, comment, created_at)
SELECT 
  p.id as property_id,
  pr.id as reviewer_id,
  floor(random() * 3 + 3)::integer as rating,
  CASE floor(random() * 3)::integer
    WHEN 0 THEN 'Great location and amazing amenities! The place was spotless and exactly as described.'
    WHEN 1 THEN 'Wonderful stay! The host was very responsive and the property exceeded our expectations.'
    ELSE 'Perfect for our needs. Modern, clean, and well-maintained. Would definitely stay again!'
  END as comment,
  now() - (floor(random() * 30) || ' days')::interval as created_at
FROM 
  properties p
  CROSS JOIN profiles pr
WHERE 
  NOT EXISTS (
    SELECT 1 
    FROM reviews r 
    WHERE r.property_id = p.id AND r.reviewer_id = pr.id
  )
LIMIT 50;

-- Add index for review queries
CREATE INDEX IF NOT EXISTS idx_reviews_property_id ON reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- Add constraint to prevent multiple reviews from same user for same property
ALTER TABLE reviews
ADD CONSTRAINT unique_property_reviewer
UNIQUE (property_id, reviewer_id);

-- Add policy to allow users to update their own reviews
CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() IN (
    SELECT user_id FROM profiles WHERE id = reviewer_id
  ));

-- Add policy to allow users to delete their own reviews
CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() IN (
    SELECT user_id FROM profiles WHERE id = reviewer_id
  ));