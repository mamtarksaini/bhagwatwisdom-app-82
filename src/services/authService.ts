
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types';

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    console.log('authService: Fetching profile for user:', userId);
    
    // Convert the UUID string to a number if needed for the profiles table
    // For now, we'll query by string ID and handle the conversion if needed
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', parseInt(userId, 10))
      .maybeSingle();
    
    if (error) {
      console.error('authService: Error fetching profile:', error);
      throw error;
    }
    
    // Return the profile data
    if (data) {
      return data as unknown as UserProfile;
    }
    
    return null;
  } catch (error) {
    console.error('authService: Error fetching profile:', error);
    // Gracefully handle the error by returning null, allowing the app to continue
    return null;
  }
}

export async function createUserProfile(userId: string, email: string, name?: string): Promise<void> {
  try {
    console.log('authService: Creating profile for user:', userId, 'with email:', email);
    
    // Generate a secure numeric ID instead of trying to convert UUID
    // This is a more reliable approach than trying to convert UUID to numeric ID
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
    
    const { error } = await supabase.from('profiles').insert(profileData);
    
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

// Authentication functions

export async function signInWithEmail(email: string, password: string): Promise<{ error: Error | null }> {
  try {
    console.log('authService: Signing in user with email:', email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('authService: Error signing in:', error);
      return { error };
    }
    
    return { error: null };
  } catch (error) {
    console.error('authService: Exception during sign in:', error);
    return { error: error as Error };
  }
}

export async function signUpWithEmail(email: string, password: string, name: string): Promise<{ error: Error | null }> {
  try {
    console.log('authService: Signing up user with email:', email, 'and name:', name);
    
    // Sign up the user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    });
    
    if (error) {
      console.error('authService: Error signing up:', error);
      return { error };
    }
    
    // If signup successful, create a profile in the profiles table
    if (data?.user) {
      console.log('authService: User created successfully with ID:', data.user.id);
      console.log('authService: User email from sign up:', data.user.email);
      console.log('authService: User metadata:', data.user.user_metadata);
      
      try {
        // Create the user profile after successful signup
        // Use a random numeric ID instead of trying to convert UUID
        await createUserProfile(data.user.id, email, name);
        console.log('authService: User profile created successfully');
      } catch (profileError) {
        console.error('authService: Error creating user profile after signup:', profileError);
        // We'll continue since the user was created successfully
        // The profile can be created later when needed
        return { error: profileError as Error };
      }
    } else {
      console.log('authService: User data not available after signup');
    }
    
    return { error: null };
  } catch (error) {
    console.error('authService: Exception during sign up:', error);
    return { error: error as Error };
  }
}

export async function signOutUser(): Promise<{ error: Error | null }> {
  try {
    console.log('authService: Signing out user');
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('authService: Error signing out:', error);
      return { error };
    }
    
    return { error: null };
  } catch (error) {
    console.error('authService: Exception during sign out:', error);
    return { error: error as Error };
  }
}

export async function upgradeUserToPremium(userId: string): Promise<{ error: Error | null }> {
  try {
    console.log('authService: Upgrading user to premium:', userId);
    
    // Check if the is_premium column exists in the profiles table
    const { data: columnsCheck, error: columnsError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
      
    if (columnsError) {
      console.error('authService: Error checking table structure:', columnsError);
      return { error: columnsError };
    }
    
    // Only attempt to update is_premium if the column exists
    if (columnsCheck && columnsCheck.length > 0 && 'is_premium' in columnsCheck[0]) {
      const { error } = await supabase
        .from('profiles')
        .update({ is_premium: true })
        .eq('id', parseInt(userId, 10));
      
      if (error) {
        console.error('authService: Error upgrading to premium:', error);
        return { error };
      }
    } else {
      console.error('authService: Cannot upgrade to premium - is_premium column not found');
      return { error: new Error('is_premium column not found in profiles table') };
    }
    
    return { error: null };
  } catch (error) {
    console.error('authService: Exception during premium upgrade:', error);
    return { error: error as Error };
  }
}
