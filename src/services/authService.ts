
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
    
    // Insert the profile record with numeric ID converted from UUID
    const numericId = parseInt(userId, 10);
    const { error } = await supabase.from('profiles').insert({
      id: numericId,
      email: email,
      name: name || null,
      created_at: new Date().toISOString(),
      is_premium: false, // Default to false for new users
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
        // Convert UUID to a numeric ID
        const numericId = parseInt(data.user.id, 10);
        if (isNaN(numericId)) {
          console.error('authService: Failed to convert UUID to numeric ID');
          return { error: new Error('Failed to convert UUID to numeric ID') };
        }
        
        // Create the user profile after successful signup
        await createUserProfile(data.user.id, email, name);
        console.log('authService: User profile created successfully');
      } catch (profileError) {
        console.error('authService: Error creating user profile after signup:', profileError);
        // We'll continue since the user was created successfully
        // The profile can be created later when needed
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
    
    const { error } = await supabase
      .from('profiles')
      .update({ is_premium: true })
      .eq('id', parseInt(userId, 10));
    
    if (error) {
      console.error('authService: Error upgrading to premium:', error);
      return { error };
    }
    
    return { error: null };
  } catch (error) {
    console.error('authService: Exception during premium upgrade:', error);
    return { error: error as Error };
  }
}
