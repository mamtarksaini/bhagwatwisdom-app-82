
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types';

/**
 * Fetch user profile from the database
 */
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    console.log('authService: Fetching profile for user:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
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
    
    const newProfile = {
      id: userId,
      email,
      name: name || email.split('@')[0],
      is_premium: false
    };
    
    const { data, error } = await supabase
      .from('profiles')
      .insert([newProfile])
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
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    
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
