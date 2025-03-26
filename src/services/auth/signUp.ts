
import { supabase } from '@/lib/supabase';
import { createUserProfile } from './userProfile';

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
        },
        // Set emailRedirectTo to ensure proper redirect after email verification
        emailRedirectTo: window.location.origin
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
      
      // Wait for the auth system to fully process the signup before creating profile
      setTimeout(async () => {
        try {
          // Create the user profile after successful signup
          await createUserProfile(data.user.id, email, name);
          console.log('authService: User profile created successfully');
        } catch (profileError) {
          console.error('authService: Error creating user profile after signup:', profileError);
          // We'll continue since the user was created successfully
          // The profile can be created later when needed
        }
      }, 500); // Add a small delay to ensure auth is complete
    } else {
      console.log('authService: User data not available after signup');
    }
    
    return { error: null };
  } catch (error) {
    console.error('authService: Exception during sign up:', error);
    return { error: error as Error };
  }
}
