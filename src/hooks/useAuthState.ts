import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { UserProfile, AuthStatus } from '@/types';
import { fetchUserProfile } from '@/services/auth';

export const useAuthState = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [isPremium, setIsPremium] = useState<boolean>(false); // Set to false to start with basic plan
  const [isProcessing, setIsProcessing] = useState<boolean>(false); // Track if auth state change is being processed
  const [timeoutId, setTimeoutId] = useState<number | null>(null); // Track timeout ID

  const handleAuthStateChange = async (session: any) => {
    console.log("useAuthState: Auth state change detected, session:", session ? "exists" : "null");
    
    if (isProcessing) {
      console.log("useAuthState: Already processing auth state change, skipping...");
      return;
    }
    
    setIsProcessing(true);
    
    // Clear any existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    
    if (session?.user) {
      try {
        console.log("useAuthState: User authenticated, fetching profile for ID:", session.user.id);
        const profile = await fetchUserProfile(session.user.id);
        
        if (profile) {
          console.log("useAuthState: Profile fetched successfully:", profile);
          setUser(profile);
          setIsPremium(profile.is_premium || false);
        } else {
          console.log("useAuthState: No profile found, creating basic user object");
          // If no profile found, create a basic user object with data from the session
          // Generate a random numeric ID for the user
          const numericId = Math.floor(Math.random() * 1000000000);
          
          const fallbackUser: UserProfile = {
            id: numericId,
            email: session.user.email,
            name: session.user.user_metadata?.name || null,
            created_at: new Date().toISOString(),
            is_premium: false
          };
          
          setUser(fallbackUser);
          setIsPremium(false);
        }
        
        setStatus('authenticated');
      } catch (error) {
        console.error("useAuthState: Error handling auth state change:", error);
        // Even if profile fetch fails, we still have basic user info from session
        // This allows app to function without crashing
        const numericId = Math.floor(Math.random() * 1000000000);
        
        const fallbackUser: UserProfile = {
          id: numericId,
          email: session.user.email,
          name: session.user.user_metadata?.name || null,
          created_at: new Date().toISOString(),
          is_premium: false // Default to false for fallback
        };
        
        setUser(fallbackUser);
        setIsPremium(false); // Default to false
        setStatus('authenticated');
      } finally {
        setIsProcessing(false);
      }
    } else {
      console.log("useAuthState: No session, setting to unauthenticated");
      setUser(null);
      setIsPremium(false); // Set to false for anonymous users
      setStatus('unauthenticated');
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    console.log("useAuthState: Initializing auth state");
    let authSubscription: { data: { subscription: { unsubscribe: () => void } } };
    
    // Add a timeout to prevent being stuck in loading state
    const newTimeoutId = window.setTimeout(() => {
      if (status === 'loading') {
        console.log("useAuthState: Timeout reached while loading, setting to unauthenticated");
        setStatus('unauthenticated');
        setIsProcessing(false);
      }
    }, 5000); // 5-second timeout
    
    setTimeoutId(newTimeoutId);
    
    const initialize = async () => {
      try {
        // First set up the auth state change subscription
        console.log("useAuthState: Setting up auth state change subscription");
        authSubscription = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log("useAuthState: Auth event:", event);
            await handleAuthStateChange(session);
          }
        );
        
        // Then check the current session
        const { data: { session } } = await supabase.auth.getSession();
        console.log("useAuthState: Current session:", session ? "exists" : "null");
        
        await handleAuthStateChange(session);
      } catch (error) {
        console.error("useAuthState: Error during initialization:", error);
        setStatus('unauthenticated');
        setIsProcessing(false);
      }
    };

    initialize();

    return () => {
      console.log("useAuthState: Cleaning up auth subscription");
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
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
