
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Use the supabase client from integrations folder which has the correct URL and key
import { supabase as supabaseClient } from '@/integrations/supabase/client';

export const supabase = supabaseClient;
