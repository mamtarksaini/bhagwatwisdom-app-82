
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { UserProfile, AuthStatus } from '@/types';
import { fetchUserProfile } from '@/services/authService';

export const useAuthState = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [isPremium, setIsPremium] = useState<boolean>(false); // Set to false to start with basic plan

  const handleAuthStateChange = async (session: any) => {
    console.log("useAuthState: Auth state change detected, session:", session ? "exists" : "null");
    
    if (session?.user) {
      try {
        console.log("useAuthState: User authenticated, fetching profile for ID:", session.user.id);
        const profile = await fetchUserProfile(session.user.id);
        
        const updatedUser = {
          id: session.user.id,
          email: session.user.email,
          name: profile?.name || null,
          created_at: profile?.created_at || new Date().toISOString(),
          is_premium: profile?.is_premium || false // Use actual premium status from profile or default to false
        };
        
        console.log("useAuthState: Profile fetched successfully, updating user state");
        setUser(updatedUser);
        setIsPremium(updatedUser.is_premium); // Set premium status based on profile data
        setStatus('authenticated');
      } catch (error) {
        console.error("useAuthState: Error handling auth state change:", error);
        // Even if profile fetch fails, we still have basic user info from session
        // This allows app to function without crashing
        const fallbackUser = {
          id: session.user.id,
          email: session.user.email,
          name: null,
          created_at: new Date().toISOString(),
          is_premium: false // Default to false for fallback
        };
        
        setUser(fallbackUser);
        setIsPremium(false); // Default to false
        setStatus('authenticated');
      }
    } else {
      console.log("useAuthState: No session, setting to unauthenticated");
      setUser(null);
      setIsPremium(false); // Set to false for anonymous users
      setStatus('unauthenticated');
    }
  };

  useEffect(() => {
    console.log("useAuthState: Initializing auth state");
    let authSubscription: { data: { subscription: { unsubscribe: () => void } } };
    
    const initialize = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("useAuthState: Current session:", session ? "exists" : "null");
        
        await handleAuthStateChange(session);
        
        console.log("useAuthState: Setting up auth state change subscription");
        authSubscription = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log("useAuthState: Auth event:", event);
            await handleAuthStateChange(session);
          }
        );
      } catch (error) {
        console.error("useAuthState: Error during initialization:", error);
        setStatus('unauthenticated');
      }
    };

    initialize();

    return () => {
      console.log("useAuthState: Cleaning up auth subscription");
      if (authSubscription?.data?.subscription) {
        authSubscription.data.subscription.unsubscribe();
      }
    };
  }, []);

  return { 
    user, 
    setUser, 
    status, 
    isPremium, 
    setIsPremium 
  };
};
