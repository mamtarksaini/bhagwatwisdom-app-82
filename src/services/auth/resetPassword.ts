
import { supabase } from '@/lib/supabase';

/**
 * Sends a password reset email to the specified email address
 */
export async function sendPasswordResetEmail(email: string): Promise<{ error: Error | null }> {
  try {
    console.log('authService: Sending password reset email to:', email);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      console.error('authService: Error sending password reset email:', error);
      return { error };
    }
    
    console.log('authService: Password reset email sent successfully');
    return { error: null };
  } catch (error) {
    console.error('authService: Exception during password reset:', error);
    return { error: error as Error };
  }
}

/**
 * Updates the user's password after they have clicked the reset link
 */
export async function updatePassword(newPassword: string): Promise<{ error: Error | null }> {
  try {
    console.log('authService: Updating password');
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      console.error('authService: Error updating password:', error);
      return { error };
    }
    
    console.log('authService: Password updated successfully');
    return { error: null };
  } catch (error) {
    console.error('authService: Exception during password update:', error);
    return { error: error as Error };
  }
}
