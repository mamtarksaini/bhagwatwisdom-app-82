
import { useState } from 'react';
import { UserProfile, AuthStatus } from '@/types';

export const useAuthState = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>('unauthenticated');
  const [isPremium, setIsPremium] = useState<boolean>(false);

  return { 
    user, 
    setUser, 
    status, 
    isPremium, 
    setIsPremium 
  };
};
