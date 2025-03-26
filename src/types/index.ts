
export type Language = "english" | "hindi";

export interface Verse {
  chapter: number;
  verse: number;
  text: {
    english: string;
    hindi: string;
  };
  meaning: {
    english: string;
    hindi: string;
  };
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export type UserProfile = {
  id: number;
  email?: string | null;
  name: string | null;
  created_at: string;
  is_premium: boolean | null;
};

export interface ThemeState {
  isDark: boolean;
}
