
-- Add is_premium column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Enable RLS for palm_readings with appropriate policies
ALTER TABLE palm_readings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for palm_readings
CREATE POLICY "Allow public to read palm_readings where user_id = 'system'"
  ON palm_readings
  FOR SELECT
  USING (user_id = 'system');

CREATE POLICY "Users can read their own palm_readings"
  ON palm_readings
  FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create their own palm_readings"
  ON palm_readings
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);
