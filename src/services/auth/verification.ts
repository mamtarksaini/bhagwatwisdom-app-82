
import { supabase } from '@/lib/supabase';

export async function checkEmailVerificationStatus(email: string): Promise<{ verified: boolean; error: Error | null }> {
  try {
    console.log('authService: Checking email verification status for:', email);
    
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('authService: Error checking session:', sessionError);
      return { verified: false, error: sessionError };
    }
    
    // If we have a session and the email matches, then the email is verified
    // Because Supabase by default requires email verification for session creation
    const verified = sessionData?.session?.user?.email === email;
    console.log('authService: Email verification status:', verified);
    
    return { verified, error: null };
  } catch (error) {
    console.error('authService: Exception during email verification check:', error);
    return { verified: false, error: error as Error };
  }
}
