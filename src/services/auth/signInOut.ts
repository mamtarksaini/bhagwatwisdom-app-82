
import { supabase } from '@/lib/supabase';

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
