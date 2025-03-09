
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
  | "bengali"
  | "kannada"
  | "kashmiri"
  | "assamese"
  | "manipuri";

export interface Verse {
  id: string;
  chapter: number;
  verse: number;
  text: Partial<Record<Language, string>>;
  meaning: Partial<Record<Language, string>>;
}
