
import React, { createContext, useContext } from 'react';
import { UserProfile } from '@/types';
import { AuthContextType } from '@/types/auth';
import { useAuthState } from '@/hooks/useAuthState';
import { 
  signInWithEmail, 
  signUpWithEmail, 
  signOutUser, 
  updateUserProfile, 
  upgradeUserToPremium 
} from '@/services/authService';
import { toast } from '@/components/ui/use-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, setUser, status, isPremium, setIsPremium } = useAuthState();

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    return await signInWithEmail(email, password);
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, name: string) => {
    return await signUpWithEmail(email, password, name);
  };

  // Sign out
  const signOut = async () => {
    try {
      await signOutUser();
      setUser(null);
      setIsPremium(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) return;

      const { error } = await updateUserProfile(user, updates);
      
      if (!error) {
        setUser({ ...user, ...updates });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  // Upgrade to premium
  const upgradeToPremium = async () => {
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to upgrade to premium.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await upgradeUserToPremium(user.id);
      
      if (!error) {
        setIsPremium(true);
        setUser({ ...user, is_premium: true });
      }
    } catch (error) {
      console.error('Error upgrading to premium:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        signIn,
        signUp,
        signOut,
        updateProfile,
        isPremium,
        upgradeToPremium,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
