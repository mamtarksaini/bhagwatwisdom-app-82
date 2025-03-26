
import { supabase } from '@/lib/supabase';

export async function signInWithEmail(email: string, password: string): Promise<{ error: Error | null; userData?: any }> {
  try {
    console.log('authService: Signing in user with email:', email);
    
    // Clear any existing sessions first to avoid conflicts
    await supabase.auth.signOut();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('authService: Error signing in:', error);
      return { error };
    }
    
    console.log('authService: Sign in successful, session:', data?.session ? 'exists' : 'null');
    
    if (!data?.session) {
      console.error('authService: Sign in succeeded but no session was returned');
      return { error: new Error('Authentication succeeded but no session was created') };
    }
    
    // Return user data with the response to avoid needing a separate fetch
    return { 
      error: null,
      userData: data?.user || null
    };
  } catch (error) {
    console.error('authService: Exception during sign in:', error);
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
    
    console.log('authService: Sign out successful');
    return { error: null };
  } catch (error) {
    console.error('authService: Exception during sign out:', error);
    return { error: error as Error };
  }
}
