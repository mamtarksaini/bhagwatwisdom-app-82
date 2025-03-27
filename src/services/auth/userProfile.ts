
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types';

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    console.log('authService: Fetching profile for user:', userId);
    
    // First try to parse userId as an integer
    let parsedId: number;
    
    try {
      parsedId = parseInt(userId, 10);
      if (isNaN(parsedId)) {
        throw new Error('Invalid userId format');
      }
    } catch (e) {
      console.error('authService: Error parsing userId as integer:', e);
      // If parse fails, try direct lookup
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('authService: Error fetching profile with string ID:', error);
        return null;
      }
      
      return data as unknown as UserProfile;
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', parsedId as number) // Explicit cast to number to satisfy TypeScript
      .maybeSingle();
    
    if (error) {
      console.error('authService: Error fetching profile:', error);
      throw error;
    }
    
    if (data) {
      return data as unknown as UserProfile;
    }
    
    return null;
  } catch (error) {
    console.error('authService: Error fetching profile:', error);
    return null;
  }
}

export async function createUserProfile(userId: string, email: string, name?: string): Promise<void> {
  // This function is now a no-op since we're removing authentication
  console.log('Authentication disabled: createUserProfile called but not executed');
  return;
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<{ error: Error | null }> {
  // This function is now a no-op since we're removing authentication
  console.log('Authentication disabled: updateUserProfile called but not executed');
  return { error: null };
}
