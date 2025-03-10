
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
