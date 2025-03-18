
CREATE OR REPLACE FUNCTION public.check_column_exists(
  p_table TEXT,
  p_column TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  column_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = p_table
    AND column_name = p_column
  ) INTO column_exists;
  
  RETURN column_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
