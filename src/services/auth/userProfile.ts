
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types';

/**
 * Fetch user profile from the database
 */
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    console.log('authService: Fetching profile for user:', userId);
    
    // Convert string userId to number if the profiles table expects a numeric id
    const parsedId = parseUserIdToNumber(userId);
    if (parsedId === null) {
      console.error('authService: Invalid userId format, cannot be parsed to number:', userId);
      return null;
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', parsedId)
      .single();
    
    if (error) {
      console.error('authService: Error fetching profile:', error);
      return null;
    }
    
    return data as UserProfile;
  } catch (error) {
    console.error('authService: Exception during profile fetch:', error);
    return null;
  }
}

/**
 * Create a new user profile in the database
 */
export async function createUserProfile(
  userId: string, 
  email: string, 
  name?: string
): Promise<UserProfile | null> {
  try {
    console.log('authService: Creating profile for user:', userId);
    
    // Convert string userId to number
    const parsedId = parseUserIdToNumber(userId);
    if (parsedId === null) {
      throw new Error('authService: Invalid userId format, cannot be parsed to number');
    }
    
    const newProfile = {
      id: parsedId,
      email,
      name: name || email.split('@')[0],
      is_premium: false
    };
    
    const { data, error } = await supabase
      .from('profiles')
      .insert(newProfile)
      .select()
      .single();
    
    if (error) {
      console.error('authService: Error creating profile:', error);
      throw error;
    }
    
    console.log('authService: Profile created successfully');
    return data as UserProfile;
  } catch (error) {
    console.error('authService: Error creating profile:', error);
    throw error;
  }
}

/**
 * Update user profile in the database
 */
export async function updateUserProfile(
  userId: string, 
  updates: Partial<UserProfile>
): Promise<{ error: Error | null }> {
  try {
    console.log('authService: Updating profile for user:', userId);
    
    // Convert string userId to number
    const parsedId = parseUserIdToNumber(userId);
    if (parsedId === null) {
      throw new Error('authService: Invalid userId format, cannot be parsed to number');
    }
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', parsedId);
    
    if (error) {
      console.error('authService: Error updating profile:', error);
      return { error };
    }
    
    console.log('authService: Profile updated successfully');
    return { error: null };
  } catch (error) {
    console.error('authService: Exception during profile update:', error);
    return { error: error as Error };
  }
}

/**
 * Helper function to parse user ID from string to number
 * This is needed because Supabase Auth uses UUID strings,
 * but our profiles table uses numeric IDs
 */
function parseUserIdToNumber(userId: string): number | null {
  // Try to handle various formats of user IDs
  try {
    // First check if it's a numeric string
    if (/^\d+$/.test(userId)) {
      return parseInt(userId, 10);
    }
    
    // If it's a UUID, we need a consistent way to convert it to a number
    // This is a simple hash function for demonstration
    // In a real app, you should use a more robust method or consider changing the DB schema
    if (userId.includes('-')) {
      // For demonstration, extract just the first numeric part
      const numericPart = userId.replace(/[^0-9]/g, '');
      if (numericPart && numericPart.length > 0) {
        // Use only the first 9 digits to avoid integer overflow
        return parseInt(numericPart.substring(0, 9), 10);
      }
    }
    
    console.error('authService: Could not parse userId to number:', userId);
    return null;
  } catch (e) {
    console.error('authService: Exception parsing userId:', e);
    return null;
  }
}
