
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types';

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    console.log('authService: Fetching profile for user:', userId);
    
    // Ensure we're using the full UUID for the query
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('authService: Error fetching profile:', error);
      throw error;
    }
    
    // Convert the id to string to match UserProfile type
    if (data) {
      return {
        ...data,
        id: String(data.id),
      } as UserProfile;
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
    // Convert the string userId to a number if needed for database insertion
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

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<{ error: Error | null }> {
  try {
    // Remove id from updates if present, as we shouldn't be updating the primary key
    const { id, ...updateData } = updates;
    
    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);
    
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

// Add the missing authentication functions

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
    console.log('authService: Signing up user with email:', email);
    
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
    
    if (data?.user) {
      try {
        await createUserProfile(data.user.id, email, name);
        console.log('authService: User profile created successfully');
      } catch (profileError) {
        console.error('authService: Error creating user profile after signup:', profileError);
        // Continue since the user was created successfully even if profile creation failed
      }
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
      .eq('id', userId);
    
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
