import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AuthStatus, UserProfile } from '@/types';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: UserProfile | null;
  status: AuthStatus;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  isPremium: boolean;
  upgradeToPremium: () => Promise<void>;
}

// Define our internal profile interface to include the is_premium field
// even though it's not in the Supabase types
interface Profile {
  id: string;
  name: string | null;
  created_at: string;
  is_premium?: boolean; // Make it optional since it might not exist in the database yet
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [isPremium, setIsPremium] = useState<boolean>(false);

  // Initialize auth state
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Fetch profile data
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          // Cast to our internal Profile interface and set defaults
          const profile = profileData as Profile;
          
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: profile?.name || null,
            created_at: profile?.created_at || new Date().toISOString(),
            is_premium: !!profile?.is_premium // Convert to boolean, undefined becomes false
          });
          
          setIsPremium(!!profile?.is_premium);
          setStatus('authenticated');
        } else {
          setUser(null);
          setStatus('unauthenticated');
        }
      } catch (error) {
        console.error('Error fetching session:', error);
        setStatus('unauthenticated');
      }
    };

    fetchSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Fetch profile data
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          // Cast to our internal Profile interface and set defaults
          const profile = profileData as Profile;
          
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: profile?.name || null,
            created_at: profile?.created_at || new Date().toISOString(),
            is_premium: !!profile?.is_premium // Convert to boolean, undefined becomes false
          });
          
          setIsPremium(!!profile?.is_premium);
          setStatus('authenticated');
        } else {
          setUser(null);
          setStatus('unauthenticated');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      if (data.user) {
        // Create a profile for the new user
        // Cast as any to bypass TypeScript checking for is_premium field
        await supabase.from('profiles').insert({
          id: data.user.id,
          name,
          is_premium: false,
        } as any);
      }

      toast({
        title: "Account created",
        description: "Please check your email for verification link.",
      });

      return { error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { error };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setStatus('unauthenticated');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) return;

      // Convert UserProfile updates to match the Supabase profile schema
      // Use type assertion to bypass TypeScript checking
      const profileUpdates: any = {
        name: updates.name
      };
      
      // Only include is_premium if it's defined in the updates
      if (updates.is_premium !== undefined) {
        profileUpdates.is_premium = updates.is_premium;
      }

      const { error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', user.id);

      if (error) {
        toast({
          title: "Failed to update profile",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setUser({ ...user, ...updates });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
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

      // Since we now know the column exists, we can update it directly
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_premium: true 
        } as any) // Use type assertion to bypass TypeScript checking
        .eq('id', user.id);

      if (error) {
        console.error('Error updating premium status:', error);
        toast({
          title: "Upgrade failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setIsPremium(true);
      setUser({ ...user, is_premium: true });
      toast({
        title: "Upgrade successful",
        description: "You now have access to premium features!",
      });
    } catch (error) {
      console.error('Error upgrading to premium:', error);
      toast({
        title: "Upgrade failed",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
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
