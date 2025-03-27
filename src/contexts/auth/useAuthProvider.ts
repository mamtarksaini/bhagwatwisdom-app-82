
import { useState } from 'react';
import { UserProfile } from '@/types';
import { AuthContextValue } from './types';

/**
 * Custom hook that provides a simplified authentication context without actual authentication
 */
export const useAuthProvider = (): AuthContextValue => {
  const [user, setUser] = useState<UserProfile | null>(null);
  
  // Default to unauthenticated state
  const status = 'unauthenticated';
  const isPremium = false;
  
  // Placeholder functions that don't actually authenticate
  const signIn = async () => ({ error: new Error('Authentication removed') });
  const signUp = async () => ({ error: new Error('Authentication removed') });
  const signOut = async () => { console.log('Sign out called (disabled)'); };
  const updateProfile = async () => { console.log('Update profile called (disabled)'); };
  const upgradeToPremium = async () => { console.log('Upgrade to premium called (disabled)'); };

  return {
    user,
    status,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isPremium,
    upgradeToPremium,
  };
};
