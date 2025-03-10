
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// These values are already set in the environment from the Supabase integration
const supabaseUrl = "https://vvaextxqyrvcpjwndgby.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2YWV4dHhxeXJ2Y3Bqd25kZ2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMTc5NTUsImV4cCI6MjA1NjY5Mzk1NX0.Uol-CUVwlLXXX0LZnha8lg7_ojPD2MHQQ7Uh5Lxpo3U";

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
