
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { UserProfile, AuthStatus } from '@/types';
import { fetchUserProfile, fetchUserSession } from '@/services/authService';

export const useAuthState = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [isPremium, setIsPremium] = useState<boolean>(false);

  const handleAuthStateChange = async (session: any) => {
    if (session?.user) {
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
    } else {
      setUser(null);
      setStatus('unauthenticated');
    }
  };

  // Initialize auth state
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const session = await fetchUserSession();
        await handleAuthStateChange(session);
      } catch (error) {
        console.error('Error fetching session:', error);
        setStatus('unauthenticated');
      }
    };

    fetchSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        await handleAuthStateChange(session);
      }
    );

    return () => {
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
