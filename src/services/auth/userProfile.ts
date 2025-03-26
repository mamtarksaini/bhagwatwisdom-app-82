
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types';

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    console.log('authService: Fetching profile for user:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', parseInt(userId, 10))
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
    
    // First check if the table structure has the columns we need
    const { data: columnsCheck, error: columnsError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (columnsError) {
      console.error('authService: Error checking table structure:', columnsError);
      throw columnsError;
    }
    
    // Create the profile object with only the fields that exist in the table
    const profileData: any = {
      id: numericId,
      created_at: new Date().toISOString(),
    };
    
    // Add optional fields if they exist in the table structure
    if (columnsCheck && columnsCheck.length > 0) {
      const sampleRow = columnsCheck[0];
      
      if ('name' in sampleRow) {
        profileData.name = name || null;
      }
      
      if ('email' in sampleRow) {
        profileData.email = email;
      }
      
      if ('is_premium' in sampleRow) {
        profileData.is_premium = false; // Default to false for new users
      }
    }
    
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
    
    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', parseInt(userId, 10));
    
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
