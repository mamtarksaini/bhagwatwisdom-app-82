
export type Language = 
  | "english" 
  | "hindi" 
  | "sanskrit" 
  | "tamil" 
  | "telugu" 
  | "gujarati" 
  | "marathi" 
  | "punjabi" 
  | "malayalam" 
  | "sindhi" 
  | "odia" 
  | "konkani" 
  | "bengali";

export interface Verse {
  id: string;
  chapter: number;
  verse: number;
  text: {
    [key in Language]?: string;
  };
  meaning: {
    [key in Language]?: string;
  };
}

export interface Mantra {
  id: string;
  text: {
    [key in Language]?: string;
  };
  meaning: {
    [key in Language]?: string;
  };
  mood: string[];
}

export interface Affirmation {
  id: string;
  text: {
    [key in Language]?: string;
  };
  goal: string[];
}

export interface User {
  id: string;
  email: string;
  name?: string;
  isPremium: boolean;
  preferredLanguage: Language;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ThemeState {
  isDark: boolean;
}

export interface LanguageState {
  current: Language;
}
