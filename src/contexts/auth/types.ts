
import { UserProfile } from '@/types';

export interface AuthContextValue {
  user: UserProfile | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  signIn: (email: string, password: string) => Promise<{ error: Error | null; userData?: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  isPremium: boolean;
  upgradeToPremium: () => Promise<void>;
}
