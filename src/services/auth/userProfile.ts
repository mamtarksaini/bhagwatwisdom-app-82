
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types';

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    console.log('authService: Fetching profile for user:', userId);
    
    // First try to parse userId as an integer
    let parsedId: number;
    
    try {
      parsedId = parseInt(userId, 10);
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
    console.log('authService: Creating profile for user:', userId, 'with email:', email);
    
    // Generate a secure numeric ID
    const numericId = Math.floor(Math.random() * 1000000000);
    
    // First check if a profile already exists for this user
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    
    if (existingProfile) {
      console.log('authService: Profile already exists for this email:', email);
      return;
    }
    
    // Create the profile object
    const profileData = {
      id: numericId,
      email,
      name: name || null,
      created_at: new Date().toISOString(),
      is_premium: false
    };
    
    console.log('authService: Attempting to insert profile with data:', profileData);
    const { error } = await supabase
      .from('profiles')
      .insert(profileData);
    
    if (error) {
      console.error('authService: Error creating profile:', error);
      throw error;
    }
    
    console.log('authService: Profile created successfully with numeric ID:', numericId);
  } catch (error) {
    console.error('authService: Error creating profile:', error);
    throw error;
  }
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<{ error: Error | null }> {
  try {
    // Remove id from updates if present, as we shouldn't be updating the primary key
    const { id, ...updateData } = updates;
    
    let parsedId: number;
    try {
      parsedId = parseInt(userId, 10);
    } catch (e) {
      return { error: new Error('Invalid user ID format') };
    }
    
    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', parsedId);
    
    if (error) {
      console.error('authService: Error updating profile:', error);
      return { error };
    }
    
    return { error: null };
  } catch (error) {
    console.error('authService: Error updating profile:', error);
    return { error: error as Error };
  }
}
