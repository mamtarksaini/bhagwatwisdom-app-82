
-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a table for storing application secrets
CREATE TABLE IF NOT EXISTS secrets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add the Gemini API key - you'll need to set this value in Supabase
INSERT INTO secrets (name, value) 
VALUES ('gemini_api_key', 'your-gemini-api-key-here') 
ON CONFLICT (name) DO NOTHING;

-- Enable RLS for the secrets table
ALTER TABLE secrets ENABLE ROW LEVEL SECURITY;

-- Only allow authenticated users to access secrets
CREATE POLICY "Only authenticated users can read secrets" 
  ON secrets
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- The secrets table doesn't need insert/update/delete policies for regular users
-- as those operations would typically be done by an admin
