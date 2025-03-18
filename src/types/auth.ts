
import { UserProfile, AuthStatus } from '@/types';

export interface AuthContextType {
  user: UserProfile | null;
  status: AuthStatus;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  isPremium: boolean;
  upgradeToPremium: () => Promise<void>;
}

export interface Profile {
  id: string;
  name: string | null;
  created_at: string;
  is_premium?: boolean;
}
