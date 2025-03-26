
import React, { createContext, useContext, useCallback } from 'react';
import { UserProfile } from '@/types';
import { AuthContextType } from '@/types/auth';
import { useAuthState } from '@/hooks/useAuthState';
import { 
  signInWithEmail, 
  signUpWithEmail, 
  signOutUser, 
  updateUserProfile, 
  upgradeUserToPremium 
} from '@/services/auth';
import { toast } from '@/components/ui/use-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, setUser, status, isPremium, setIsPremium } = useAuthState();

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string) => {
    console.log("AuthContext: Starting sign in process for:", email);
    
    try {
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
      
      console.log("AuthContext: Sign in API call successful");
      // We don't need to set user here as the auth state change subscription will handle that
      
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
  }, []);

  // Sign up with email and password
  const signUp = useCallback(async (email: string, password: string, name: string) => {
    console.log("AuthContext: Starting sign up process for:", email, "with name:", name);
    
    try {
      const result = await signUpWithEmail(email, password, name);
      
      if (result.error) {
        console.error("AuthContext: Sign up error:", result.error);
        return { error: result.error };
      }
      
      console.log("AuthContext: Sign up API call successful");
      
      toast({
        title: "Account created",
        description: "Please check your email for a verification link. If you don't see it, check your spam folder.",
      });
      
      return { error: null };
    } catch (error: any) {
      console.error("AuthContext: Exception during sign up:", error);
      return { error };
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    console.log("AuthContext: Starting sign out process");
    try {
      const { error } = await signOutUser();
      
      if (error) {
        console.error("AuthContext: Error signing out:", error);
        toast({
          title: "Sign out failed",
          description: error.message || "An unexpected error occurred.",
          variant: "destructive",
        });
        return;
      }
      
      // The auth state subscription should handle clearing user data,
      // but we'll do it manually as well to be safe
      setUser(null);
      setIsPremium(false);
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error: any) {
      console.error('AuthContext: Exception during sign out:', error);
      toast({
        title: "Sign out failed",
        description: error?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }, [setUser, setIsPremium]);

  // Update user profile
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    console.log("AuthContext: Starting profile update");
    try {
      if (!user) {
        console.error("AuthContext: No user found for profile update");
        toast({
          title: "Authentication required",
          description: "Please sign in to update your profile.",
          variant: "destructive",
        });
        return;
      }

      // Convert user.id to string when passing to updateUserProfile
      const { error } = await updateUserProfile(user.id.toString(), updates);
      
      if (!error) {
        console.log("AuthContext: Profile updated successfully, updating local state");
        setUser({ ...user, ...updates });
        
        if (updates.is_premium !== undefined) {
          setIsPremium(updates.is_premium);
        }
      }
    } catch (error: any) {
      console.error('AuthContext: Error updating profile:', error);
      toast({
        title: "Update failed",
        description: error?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }, [user, setUser, setIsPremium]);

  // Upgrade to premium
  const upgradeToPremium = useCallback(async () => {
    console.log("AuthContext: Starting premium upgrade");
    try {
      if (!user) {
        console.error("AuthContext: No user found for premium upgrade");
        toast({
          title: "Authentication required",
          description: "Please sign in to upgrade to premium.",
          variant: "destructive",
        });
        return;
      }

      // Convert user.id to string when passing to upgradeUserToPremium
      const { error } = await upgradeUserToPremium(user.id.toString());
      
      if (!error) {
        console.log("AuthContext: Premium upgrade successful, updating local state");
        setIsPremium(true);
        setUser({ ...user, is_premium: true });
      }
    } catch (error: any) {
      console.error('AuthContext: Error upgrading to premium:', error);
      toast({
        title: "Upgrade failed",
        description: error?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }, [user, setUser, setIsPremium]);

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
