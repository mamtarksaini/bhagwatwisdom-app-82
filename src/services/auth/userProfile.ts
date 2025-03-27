
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
      .eq('id', parsedId)
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
  try {
    console.log('authService: Creating profile for user:', userId);
    
    // Check if userId is a number and parse it
    const parsedId = parseInt(userId, 10);
    if (isNaN(parsedId)) {
      throw new Error('Invalid userId format - must be parseable as a number');
    }
    
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: parsedId,
        email: email,
        name: name || null
      });
    
    if (error) {
      console.error('authService: Error creating profile:', error);
      throw error;
    }
    
    console.log('authService: Profile created successfully');
  } catch (error) {
    console.error('authService: Error creating profile:', error);
    throw error;
  }
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<{ error: Error | null }> {
  try {
    console.log('authService: Updating profile for user:', userId, 'with updates:', updates);
    
    // Parse the userId to a number
    const parsedId = parseInt(userId, 10);
    if (isNaN(parsedId)) {
      throw new Error('Invalid userId format - must be parseable as a number');
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
    console.error('authService: Error updating profile:', error);
    return { error: error as Error };
  }
}
