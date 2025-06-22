/*
  # Add Messaging System and Enhanced Property Features

  1. New Tables
    - `conversations`
      - `id` (uuid, primary key)
      - `property_id` (uuid, references properties)
      - `guest_id` (uuid, references profiles)
      - `host_id` (uuid, references profiles)
      - `created_at` (timestamp with time zone)
    
    - `messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, references conversations)
      - `sender_id` (uuid, references profiles)
      - `content` (text)
      - `read` (boolean)
      - `created_at` (timestamp with time zone)
    
    - `wishlists`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text)
      - `created_at` (timestamp with time zone)
    
    - `wishlist_items`
      - `id` (uuid, primary key)
      - `wishlist_id` (uuid, references wishlists)
      - `property_id` (uuid, references properties)
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create conversations table
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties NOT NULL,
  guest_id uuid REFERENCES profiles NOT NULL,
  host_id uuid REFERENCES profiles NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations NOT NULL,
  sender_id uuid REFERENCES profiles NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create wishlists table
CREATE TABLE wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create wishlist_items table
CREATE TABLE wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id uuid REFERENCES wishlists NOT NULL,
  property_id uuid REFERENCES properties NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(wishlist_id, property_id)
);

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM profiles WHERE id IN (guest_id, host_id)
  ));

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM profiles WHERE id = guest_id
  ));

-- Messages policies
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM profiles 
    WHERE id IN (
      SELECT guest_id FROM conversations WHERE id = conversation_id
      UNION
      SELECT host_id FROM conversations WHERE id = conversation_id
    )
  ));

CREATE POLICY "Users can send messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM profiles 
    WHERE id IN (
      SELECT guest_id FROM conversations WHERE id = conversation_id
      UNION
      SELECT host_id FROM conversations WHERE id = conversation_id
    )
  ));

-- Wishlists policies
CREATE POLICY "Users can view own wishlists"
  ON wishlists FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM profiles WHERE id = user_id
  ));

CREATE POLICY "Users can create wishlists"
  ON wishlists FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM profiles WHERE id = user_id
  ));

-- Wishlist items policies
CREATE POLICY "Users can view own wishlist items"
  ON wishlist_items FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM profiles 
    WHERE id IN (
      SELECT user_id FROM wishlists WHERE id = wishlist_id
    )
  ));

CREATE POLICY "Users can create wishlist items"
  ON wishlist_items FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM profiles 
    WHERE id IN (
      SELECT user_id FROM wishlists WHERE id = wishlist_id
    )
  ));

-- Add indexes for better performance
CREATE INDEX idx_conversations_guest_id ON conversations(guest_id);
CREATE INDEX idx_conversations_host_id ON conversations(host_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_wishlist_items_wishlist_id ON wishlist_items(wishlist_id);
CREATE INDEX idx_wishlist_items_property_id ON wishlist_items(property_id);