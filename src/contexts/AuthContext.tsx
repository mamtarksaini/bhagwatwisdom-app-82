
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
    try {
      console.log("AuthContext: Starting sign in process for:", email);
      const result = await signInWithEmail(email, password);
      
      if (result.error) {
        console.error("AuthContext: Sign in error:", result.error);
        toast({
          title: "Sign in failed",
          description: result.error.message || "Invalid credentials. Please try again.",
          variant: "destructive",
        });
        return { error: result.error };
      } 
      
      console.log("AuthContext: Sign in successful for:", email);
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
      
      return { error: null };
    } catch (error: any) {
      console.error("AuthContext: Exception during sign in:", error);
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { error };
    }
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
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        title: "Sign out failed",
        description: error?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to update your profile.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await updateUserProfile(user, updates);
      
      if (!error) {
        setUser({ ...user, ...updates });
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: error?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
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
    } catch (error: any) {
      console.error('Error upgrading to premium:', error);
      toast({
        title: "Upgrade failed",
        description: error?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const value: AuthContextType = {
    user,
    status,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isPremium,
    upgradeToPremium,
  };

  return (
    <AuthContext.Provider value={value}>
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
