
import { supabase } from '@/lib/supabase';

export async function checkEmailVerificationStatus(email: string): Promise<{ verified: boolean; error: Error | null }> {
  try {
    console.log('authService: Checking email verification status for:', email);
    
    // First check for existing session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('authService: Error checking session:', sessionError);
      return { verified: false, error: sessionError };
    }
    
    // If we have a session and the email matches, then the email is verified
    if (sessionData?.session?.user?.email === email) {
      console.log('authService: Email verification status: true (from session)');
      return { verified: true, error: null };
    }
    
    // If we don't have a matching session, we can't reliably check verification status
    // for non-logged in users without admin privileges, so we'll just return false
    console.log('authService: No matching session, assuming unverified');
    
    // User lookup with admin API is not available, so we'll just assume unverified
    // This is a safer approach as it will prompt users to sign in
    return { verified: false, error: null };
  } catch (error) {
    console.error('authService: Exception during email verification check:', error);
    return { verified: false, error: error as Error };
  }
}
