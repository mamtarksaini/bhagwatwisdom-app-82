
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
    
    // If we don't have a matching session, check user metadata
    // This is a more reliable way to determine verification status
    const { data: userData, error: userError } = await supabase.auth.admin.getUserByEmail(email);
    
    if (userError) {
      // This might fail if the user doesn't exist or if we don't have admin rights
      // But that's okay, we'll just assume unverified
      console.log('authService: User lookup failed, assuming unverified:', userError);
      return { verified: false, error: null };
    }
    
    // If we have user data, check if email is confirmed
    const verified = userData?.user?.email_confirmed_at != null;
    console.log('authService: Email verification status:', verified);
    
    return { verified, error: null };
  } catch (error) {
    console.error('authService: Exception during email verification check:', error);
    return { verified: false, error: error as Error };
  }
}
