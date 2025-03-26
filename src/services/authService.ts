
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types';

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    console.log('authService: Fetching profile for user:', userId);
    
    // Ensure we're using the full UUID for the query
    // Fix: Don't truncate the userId, use the complete string
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId) // Use the complete userId
      .maybeSingle();
    
    if (error) {
      console.error('authService: Error fetching profile:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('authService: Error fetching profile:', error);
    // Gracefully handle the error by returning null, allowing the app to continue
    return null;
  }
}

export async function createUserProfile(userId: string, email: string, name?: string): Promise<void> {
  try {
    const { error } = await supabase.from('profiles').insert({
      id: userId,
      email,
      name: name || null,
      created_at: new Date().toISOString(),
    });
    
    if (error) {
      console.error('authService: Error creating profile:', error);
      throw error;
    }
  } catch (error) {
    console.error('authService: Error creating profile:', error);
    throw error;
  }
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    
    if (error) {
      console.error('authService: Error updating profile:', error);
      throw error;
    }
  } catch (error) {
    console.error('authService: Error updating profile:', error);
    throw error;
  }
}
