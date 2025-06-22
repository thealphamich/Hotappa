/*
  # Add host relationships to apartments and hotels

  1. Changes
    - Add host_id column to apartments table
    - Add host_id column to hotels table
    - Add foreign key constraints linking to profiles table

  2. Security
    - No changes to RLS policies needed
*/

-- Add host_id to apartments
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'apartments' AND column_name = 'host_id'
  ) THEN
    ALTER TABLE apartments ADD COLUMN host_id uuid REFERENCES profiles(id);
  END IF;
END $$;

-- Add host_id to hotels
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hotels' AND column_name = 'host_id'
  ) THEN
    ALTER TABLE hotels ADD COLUMN host_id uuid REFERENCES profiles(id);
  END IF;
END $$;