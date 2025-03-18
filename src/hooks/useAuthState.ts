
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { UserProfile, AuthStatus } from '@/types';
import { fetchUserProfile, fetchUserSession } from '@/services/authService';

export const useAuthState = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [isPremium, setIsPremium] = useState<boolean>(false);

  const handleAuthStateChange = async (session: any) => {
    console.log("useAuthState: Auth state change, session:", session ? "exists" : "null");
    
    if (session?.user) {
      try {
        console.log("useAuthState: User authenticated, fetching profile");
        const profile = await fetchUserProfile(session.user.id);
        
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: profile?.name || null,
          created_at: profile?.created_at || new Date().toISOString(),
          is_premium: !!profile?.is_premium
        });
        
        setIsPremium(!!profile?.is_premium);
        setStatus('authenticated');
        console.log("useAuthState: Updated user state - authenticated");
      } catch (error) {
        console.error("useAuthState: Error handling auth state change:", error);
        setStatus('unauthenticated');
      }
    } else {
      console.log("useAuthState: No session user, setting unauthenticated");
      setUser(null);
      setStatus('unauthenticated');
    }
  };

  // Initialize auth state
  useEffect(() => {
    console.log("useAuthState: Initializing auth state");
    
    const fetchSession = async () => {
      try {
        console.log("useAuthState: Fetching current session");
        const session = await fetchUserSession();
        await handleAuthStateChange(session);
      } catch (error) {
        console.error('useAuthState: Error fetching session:', error);
        setStatus('unauthenticated');
      }
    };

    fetchSession();

    // Subscribe to auth changes
    console.log("useAuthState: Setting up auth state change subscription");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("useAuthState: Auth event:", event);
        await handleAuthStateChange(session);
      }
    );

    return () => {
      console.log("useAuthState: Cleaning up auth subscription");
      subscription.unsubscribe();
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
