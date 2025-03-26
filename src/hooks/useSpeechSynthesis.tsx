
import { useState, useEffect, useCallback } from "react";
import { Language } from "@/types";
import { toast } from "@/components/ui/use-toast";

interface SpeechSynthesisHook {
  speak: (text: string) => void;
  stop: () => void;
  isReading: boolean;
  isSpeechSupported: boolean;
  voices: SpeechSynthesisVoice[];
}

// Map our languages to matching voices
const languageVoiceMap: Record<Language, string> = {
  english: "en",
  hindi: "hi"
};

export function useSpeechSynthesis(language: Language = "english"): SpeechSynthesisHook {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isReading, setIsReading] = useState<boolean>(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(false);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setIsSpeechSupported(true);
      
      // Load voices
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices.length > 0) {
          setVoices(availableVoices);
          console.log("Available voices loaded:", availableVoices.length);
        }
      };

      loadVoices();
      
      // Chrome loads voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    } else {
      console.warn("Speech synthesis not supported in this browser");
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
      if (!voices.length) {
        console.warn("No voices available");
        return null;
      }

      // Try to find a voice that matches the language
      const langCode = languageVoiceMap[language] || "en";
      console.log(`Looking for voice with language code: ${langCode}`);
      
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
      
      console.log(`Selected voice: ${voice?.name} (${voice?.lang})`);
      return voice;
    },
    [voices, language]
  );

  const speak = useCallback(
    (text: string) => {
      if (!isSpeechSupported) {
        console.warn("Speech synthesis not supported");
        toast({
          title: "Speech Not Supported",
          description: "Your browser doesn't support text-to-speech. Try using a modern browser like Chrome.",
          variant: "destructive"
        });
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      setIsReading(false);

      console.log("Starting speech synthesis");
      
      // Create a new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = getBestVoice(text);
      
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        // Default to English if no appropriate voice found
        utterance.lang = language === 'hindi' ? 'hi-IN' : 'en-US';
      }

      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        console.log("Speech started");
        setIsReading(true);
      };
      
      utterance.onend = () => {
        console.log("Speech ended");
        setIsReading(false);
        setCurrentUtterance(null);
      };
      
      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        setIsReading(false);
        setCurrentUtterance(null);
        toast({
          title: "Speech Error",
          description: "There was an error playing the voice. Please try again.",
          variant: "destructive"
        });
      };

      // Safari fix: create a dummy speak utterance first
      if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
        console.log("Safari detected, applying fix");
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(''));
      }
      
      // Set the current utterance and speak
      setCurrentUtterance(utterance);
      
      // Chrome bug fix: Sometimes speechSynthesis gets into a paused state
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      
      window.speechSynthesis.speak(utterance);
      
      // Chrome bug fix: if speech doesn't start after 1 second, try again
      setTimeout(() => {
        if (!window.speechSynthesis.speaking && utterance === currentUtterance) {
          console.log("Speech didn't start, trying again");
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
          window.speechSynthesis.speak(utterance);
        }
      }, 1000);
    },
    [isSpeechSupported, getBestVoice, language, currentUtterance]
  );

  const stop = useCallback(() => {
    if (isSpeechSupported) {
      console.log("Stopping speech");
      window.speechSynthesis.cancel();
      setIsReading(false);
      setCurrentUtterance(null);
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
