
export type Language = 
  | "english" 
  | "hindi";

export interface Verse {
  id: string;
  chapter: number;
  verse: number;
  text: Partial<Record<Language, string>>;
  meaning: Partial<Record<Language, string>>;
}

export interface ThemeState {
  isDark: boolean;
}

// User related types
export interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  is_premium?: boolean;
  created_at?: string;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
