
import { supabase } from '../supabase';
import { UserProfile } from '@/types';

// Constants for limits
export const FREE_VOICE_RESPONSES_LIMIT = 2;

// Track if a user has used their voice agent responses
interface VoiceAgentUsage {
  usedCount: number;
  lastResetDate: string; // ISO date string for the beginning of the month
}

// Helper to get the start of the current month as ISO string
const getCurrentMonthStartDate = (): string => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
};

// Get user's voice agent usage for the current month
export const getUserVoiceAgentUsage = async (userId: string | null): Promise<VoiceAgentUsage> => {
  if (!userId) {
    return { usedCount: 0, lastResetDate: getCurrentMonthStartDate() };
  }

  try {
    // Get current usage from the database - directly using the RPC client to avoid type issues
    const { data, error } = await supabase
      .from('voice_agent_usage')
      .select('used_count, last_reset_date')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching voice agent usage:', error);
      return { usedCount: 0, lastResetDate: getCurrentMonthStartDate() };
    }

    if (!data) {
      // If no record exists, create a new one
      const newUsage = { 
        usedCount: 0, 
        lastResetDate: getCurrentMonthStartDate() 
      };
      
      await supabase
        .from('voice_agent_usage')
        .insert({
          user_id: userId,
          used_count: 0,
          last_reset_date: newUsage.lastResetDate
        });
        
      return newUsage;
    }

    // Check if we need to reset for a new month
    const currentMonthStart = getCurrentMonthStartDate();
    const lastResetDate = data.last_reset_date;

    if (new Date(lastResetDate) < new Date(currentMonthStart)) {
      // Reset for the new month
      const updatedUsage = { 
        usedCount: 0, 
        lastResetDate: currentMonthStart 
      };
      
      await supabase
        .from('voice_agent_usage')
        .update({
          used_count: 0,
          last_reset_date: currentMonthStart
        })
        .eq('user_id', userId);
        
      return updatedUsage;
    }

    return { 
      usedCount: data.used_count, 
      lastResetDate: data.last_reset_date 
    };
  } catch (error) {
    console.error('Exception in getUserVoiceAgentUsage:', error);
    return { usedCount: 0, lastResetDate: getCurrentMonthStartDate() };
  }
};

// Increment user's voice agent usage count
export const incrementVoiceAgentUsage = async (userId: string | null): Promise<boolean> => {
  if (!userId) return false;

  try {
    const currentUsage = await getUserVoiceAgentUsage(userId);
    
    const { error } = await supabase
      .from('voice_agent_usage')
      .update({
        used_count: currentUsage.usedCount + 1
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error incrementing voice agent usage:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception in incrementVoiceAgentUsage:', error);
    return false;
  }
};

// Check if user can use voice agent responses
export const canUseVoiceAgent = async (
  user: UserProfile | null, 
  isPremium: boolean
): Promise<boolean> => {
  if (isPremium) return true;
  if (!user) return false;

  try {
    const { usedCount } = await getUserVoiceAgentUsage(user.id);
    return usedCount < FREE_VOICE_RESPONSES_LIMIT;
  } catch (error) {
    console.error('Error checking voice agent usage:', error);
    return false;
  }
};

// Get remaining free responses for a user
export const getRemainingFreeResponses = async (userId: string | null): Promise<number> => {
  if (!userId) return 0;
  
  try {
    const { usedCount } = await getUserVoiceAgentUsage(userId);
    return Math.max(0, FREE_VOICE_RESPONSES_LIMIT - usedCount);
  } catch (error) {
    console.error('Error getting remaining free responses:', error);
    return 0;
  }
};
