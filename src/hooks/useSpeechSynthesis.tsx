
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
  const [speechSynthesisInitialized, setSpeechSynthesisInitialized] = useState<boolean>(false);

  // Cleanup function to properly stop and reset speech synthesis
  const cleanupSpeech = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      setCurrentUtterance(null);
    }
  }, []);

  useEffect(() => {
    // Check if the browser supports speech synthesis
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setIsSpeechSupported(true);
      
      // Load voices
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices.length > 0) {
          setVoices(availableVoices);
          console.log("Available voices loaded:", availableVoices.length);
          setSpeechSynthesisInitialized(true);
        }
      };

      // First try to load voices immediately
      loadVoices();
      
      // Chrome loads voices asynchronously, so set up the event listener
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      
      // Set a timeout to check if voices loaded, as a fallback
      const voiceLoadingTimeout = setTimeout(() => {
        if (voices.length === 0) {
          console.warn("No voices loaded within timeout, attempting fallback loading method");
          const fallbackVoices = window.speechSynthesis.getVoices();
          if (fallbackVoices.length > 0) {
            setVoices(fallbackVoices);
            setSpeechSynthesisInitialized(true);
            console.log("Voices loaded via fallback method:", fallbackVoices.length);
          } else {
            console.error("Failed to load any voices, speech synthesis may not work");
            setSpeechSynthesisInitialized(false);
          }
        }
      }, 3000);
      
      return () => {
        cleanupSpeech();
        clearTimeout(voiceLoadingTimeout);
      };
    } else {
      console.warn("Speech synthesis not supported in this browser");
      setIsSpeechSupported(false);
    }

    return cleanupSpeech;
  }, [cleanupSpeech]);

  // Add an effect to handle page navigation cleanup
  useEffect(() => {
    // Clean up speech when navigating away
    const handleBeforeUnload = () => {
      cleanupSpeech();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      cleanupSpeech();
    };
  }, [cleanupSpeech]);

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
      
      // First try to find a perfect match for cloud/remote voice (usually better quality)
      let voice = voices.find(
        (v) => v.lang.toLowerCase().indexOf(langCode.toLowerCase()) === 0 && !v.localService
      );
      
      // Then try a local voice
      if (!voice) {
        voice = voices.find(
          (v) => v.lang.toLowerCase().indexOf(langCode.toLowerCase()) === 0
        );
      }
      
      // Fallback to English if no matches for non-English languages
      if (!voice && langCode !== "en") {
        voice = voices.find(
          (v) => v.lang.toLowerCase().indexOf("en") === 0 && !v.localService
        );
      }
      
      // Final fallback to any voice
      if (!voice && voices.length > 0) {
        voice = voices[0];
      }
      
      if (voice) {
        console.log(`Selected voice: ${voice.name} (${voice.lang})`);
      } else {
        console.warn("No suitable voice found");
      }
      
      return voice;
    },
    [voices, language]
  );

  // Function to safely initialize speech synthesis
  const initSpeechSynthesis = useCallback(() => {
    try {
      if (!window.speechSynthesis) {
        console.error("Speech synthesis not available");
        return false;
      }

      // Try to resume if paused
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      // Safety reset - cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      return true;
    } catch (error) {
      console.error("Failed to initialize speech synthesis:", error);
      return false;
    }
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!isSpeechSupported) {
        console.warn("Speech synthesis not supported");
        return;
      }

      // Check if speech synthesis is initialized
      if (!speechSynthesisInitialized) {
        console.warn("Speech synthesis not fully initialized yet");
        return;
      }

      // Initialize speech synthesis
      if (!initSpeechSynthesis()) {
        console.error("Failed to initialize speech synthesis");
        return;
      }

      console.log("Starting speech synthesis");
      
      try {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        setIsReading(false);

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

        utterance.rate = 1.0; // Normal speed
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Set up event handlers
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
          
          // Only show toast for errors that aren't user-initiated cancellations
          if (event.error !== 'canceled') {
            toast({
              title: "Speech Error",
              description: "There was an error playing the voice. Falling back to text-only mode.",
              variant: "destructive"
            });
          }
        };

        // Store the current utterance
        setCurrentUtterance(utterance);
        
        // Reset speech synthesis before speaking (helps with browser bugs)
        window.speechSynthesis.cancel();
        
        // Use a small delay to ensure synthesis is reset
        setTimeout(() => {
          try {
            // Safari specific workaround
            const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
            if (isSafari) {
              console.log("Safari detected, applying fix");
              // Safari needs a dummy utterance to "wake up" the speech synthesis
              window.speechSynthesis.speak(new SpeechSynthesisUtterance(''));
            }
            
            // Actually speak the text
            window.speechSynthesis.speak(utterance);
            
            // Firefox and Chrome bug fix: check if speech actually started
            const checkSpeechStarted = setTimeout(() => {
              if (!speechSynthesis.speaking && utterance === currentUtterance) {
                console.log("Speech didn't start, trying again");
                try {
                  // Try to make sure we're not paused
                  if (window.speechSynthesis.paused) {
                    window.speechSynthesis.resume();
                  }
                  // Try speaking again
                  window.speechSynthesis.speak(utterance);
                } catch (retryError) {
                  console.error("Error during speech retry:", retryError);
                  // Force fallback to text-only mode
                  setIsReading(false);
                  toast({
                    title: "Speech Error",
                    description: "Could not start speech. Switching to text-only mode.",
                    variant: "destructive"
                  });
                }
              }
            }, 1000);
            
            // Clean up the timeout
            setTimeout(() => clearTimeout(checkSpeechStarted), 2000);
          } catch (innerError) {
            console.error("Secondary speech synthesis error:", innerError);
            setIsReading(false);
            setCurrentUtterance(null);
            toast({
              title: "Speech Error",
              description: "There was an error playing the voice. Falling back to text-only mode.",
              variant: "destructive"
            });
          }
        }, 100);
      } catch (error) {
        console.error("Exception in speech synthesis:", error);
        toast({
          title: "Speech Error",
          description: "There was an error with speech synthesis. Falling back to text-only mode.",
          variant: "destructive"
        });
        setIsReading(false);
      }
    },
    [
      isSpeechSupported, 
      getBestVoice, 
      language, 
      currentUtterance, 
      initSpeechSynthesis, 
      speechSynthesisInitialized
    ]
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
