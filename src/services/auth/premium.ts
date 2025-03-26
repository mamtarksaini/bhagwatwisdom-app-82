
import { supabase } from '@/lib/supabase';

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
