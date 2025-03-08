
import { useState, useEffect, useCallback } from "react";
import { Language } from "@/types";

interface SpeechSynthesisHook {
  speak: (text: string) => void;
  stop: () => void;
  isReading: boolean;
  isSpeechSupported: boolean;
  voices: SpeechSynthesisVoice[];
}

// Map our languages to matching voices
// These are approximate mappings and might need adjustment
const languageVoiceMap: Record<Language, string> = {
  english: "en",
  hindi: "hi",
  sanskrit: "hi", // Fallback to Hindi for Sanskrit
  tamil: "ta",
  telugu: "te",
  gujarati: "gu",
  marathi: "mr",
  punjabi: "pa",
  malayalam: "ml",
  sindhi: "ur", // Fallback to Urdu for Sindhi
  odia: "or",
  konkani: "hi", // Fallback to Hindi for Konkani
  bengali: "bn"
};

export function useSpeechSynthesis(language: Language = "english"): SpeechSynthesisHook {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isReading, setIsReading] = useState<boolean>(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setIsSpeechSupported(true);
      
      // Load voices
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      loadVoices();
      
      // Chrome loads voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }

    // Cleanup
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Get the best voice for current language
  const getBestVoice = useCallback(
    (text: string): SpeechSynthesisVoice | null => {
      if (!voices.length) return null;

      // Try to find a voice that matches the language
      const langCode = languageVoiceMap[language] || "en";
      
      // First try to find a perfect match
      let voice = voices.find(
        (v) => v.lang.toLowerCase().indexOf(langCode.toLowerCase()) === 0 && !v.localService
      );
      
      // Then try a local voice
      if (!voice) {
        voice = voices.find(
          (v) => v.lang.toLowerCase().indexOf(langCode.toLowerCase()) === 0
        );
      }
      
      // Fallback to English
      if (!voice && langCode !== "en") {
        voice = voices.find(
          (v) => v.lang.toLowerCase().indexOf("en") === 0 && !v.localService
        );
      }
      
      // Final fallback to any voice
      if (!voice) {
        voice = voices[0];
      }
      
      return voice;
    },
    [voices, language]
  );

  const speak = useCallback(
    (text: string) => {
      if (!isSpeechSupported) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const voice = getBestVoice(text);
      
      if (voice) {
        utterance.voice = voice;
      }

      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => setIsReading(true);
      utterance.onend = () => setIsReading(false);
      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        setIsReading(false);
      };

      window.speechSynthesis.speak(utterance);
    },
    [isSpeechSupported, getBestVoice]
  );

  const stop = useCallback(() => {
    if (isSpeechSupported) {
      window.speechSynthesis.cancel();
      setIsReading(false);
    }
  }, [isSpeechSupported]);

  return {
    speak,
    stop,
    isReading,
    isSpeechSupported,
    voices
  };
}
