import { useState, useEffect } from 'react';
import { UserProfile } from '@/types';
import { AuthContextValue } from './types';
import { supabase } from '@/lib/supabase';
import { 
  signInWithEmail, 
  signOutUser,
  createUserProfile,
  fetchUserProfile,
  updateUserProfile 
} from '@/services/auth';

/**
 * Custom hook that provides authentication context with Supabase
 */
export const useAuthProvider = (): AuthContextValue => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [isPremium, setIsPremium] = useState<boolean>(false);

  // Initialize auth state on mount
  useEffect(() => {
    console.log('AuthProvider: Initializing auth state');
    
    // First set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider: Auth state changed, event:', event);
        
        if (session?.user) {
          console.log('AuthProvider: User is authenticated, fetching profile');
          // Use setTimeout to prevent potential deadlock issues
          setTimeout(async () => {
            try {
              const profile = await fetchUserProfile(session.user.id);
              if (profile) {
                setUser(profile);
                setIsPremium(profile.is_premium || false);
                setStatus('authenticated');
              } else {
                console.log('AuthProvider: No profile found, creating one');
                // If no profile exists, we may need to create one
                await createUserProfile(session.user.id, session.user.email || '');
                const newProfile = await fetchUserProfile(session.user.id);
                setUser(newProfile);
                setIsPremium(newProfile?.is_premium || false);
                setStatus('authenticated');
              }
            } catch (error) {
              console.error('AuthProvider: Error handling auth state change:', error);
              setUser(null);
              setStatus('unauthenticated');
            }
          }, 0);
        } else {
          console.log('AuthProvider: User is not authenticated');
          setUser(null);
          setStatus('unauthenticated');
        }
      }
    );
    
    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        console.log('AuthProvider: Existing session found, user ID:', session.user.id);
      } else {
        console.log('AuthProvider: No existing session found');
        setStatus('unauthenticated');
      }
    });
    
    // Cleanup subscription on unmount
    return () => {
      console.log('AuthProvider: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  // Function to refresh user data
  const refreshUserData = async () => {
    console.log('AuthProvider: Refreshing user data');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.log('AuthProvider: No active session found during refresh');
        return;
      }
      
      const profile = await fetchUserProfile(session.user.id);
      if (profile) {
        console.log('AuthProvider: User profile refreshed successfully');
        setUser(profile);
        setIsPremium(profile.is_premium || false);
      }
    } catch (error) {
      console.error('AuthProvider: Error refreshing user data:', error);
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    console.log('AuthProvider: Signing in with email');
    return signInWithEmail(email, password);
  };

  // Sign up function
  const signUp = async (email: string, password: string, name: string) => {
    console.log('AuthProvider: Signing up with email');
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });

      if (error) {
        console.error('AuthProvider: Error signing up:', error);
        return { error };
      }

      console.log('AuthProvider: Sign up successful, user ID:', data?.user?.id || 'unknown');
      
      if (data?.user?.id) {
        try {
          await createUserProfile(data.user.id, email, name);
        } catch (profileError) {
          console.error('AuthProvider: Error creating profile during signup:', profileError);
          // Continue since the user was created successfully
        }
      }

      return { error: null };
    } catch (error) {
      console.error('AuthProvider: Exception during sign up:', error);
      return { error: error as Error };
    }
  };

  // Sign out function
  const signOut = async () => {
    console.log('AuthProvider: Signing out');
    await signOutUser();
    setUser(null);
    setStatus('unauthenticated');
    setIsPremium(false);
  };

  // Update profile function
  const updateProfile = async (updates: Partial<UserProfile>) => {
    console.log('AuthProvider: Updating profile');
    if (!user) {
      console.error('AuthProvider: Cannot update profile, no user is logged in');
      return;
    }

    try {
      const { error } = await updateUserProfile(user.id.toString(), updates);
      if (error) {
        console.error('AuthProvider: Error updating profile:', error);
        throw error;
      }
      
      // Update local state with the changes
      setUser(prev => prev ? { ...prev, ...updates } : null);
      
      // Update premium status if it was part of the updates
      if (updates.is_premium !== undefined) {
        setIsPremium(updates.is_premium);
      }
    } catch (error) {
      console.error('AuthProvider: Exception during profile update:', error);
      throw error;
    }
  };

  // Upgrade to premium function
  const upgradeToPremium = async () => {
    console.log('AuthProvider: Upgrading to premium');
    if (!user) {
      console.error('AuthProvider: Cannot upgrade to premium, no user is logged in');
      return;
    }

    try {
      await updateProfile({ is_premium: true });
      setIsPremium(true);
    } catch (error) {
      console.error('AuthProvider: Exception during premium upgrade:', error);
      throw error;
    }
  };

  return {
    user,
    status,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isPremium,
    upgradeToPremium,
    refreshUserData,
  };
};
