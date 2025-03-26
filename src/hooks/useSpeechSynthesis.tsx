
import { useState, useEffect, useCallback, useRef } from "react";
import { Language } from "@/types";
import { toast } from "@/hooks/use-toast";

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
  const speechInitializedRef = useRef<boolean>(false);
  const pendingRetryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const failedAttemptsRef = useRef<number>(0);
  const maxRetryAttempts = 2;

  // Cleanup function to properly stop and reset speech synthesis
  const cleanupSpeech = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      setCurrentUtterance(null);
      
      // Clear any pending retry attempts
      if (pendingRetryRef.current) {
        clearTimeout(pendingRetryRef.current);
        pendingRetryRef.current = null;
      }
    }
  }, []);

  // Chrome and Safari have a bug where speech synthesis sometimes stops unexpectedly
  // This function keeps it alive
  const keepAlive = useCallback(() => {
    if (window.speechSynthesis && isReading) {
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
      const timeout = setTimeout(keepAlive, 5000); // Keep checking every 5 seconds
      return () => clearTimeout(timeout);
    }
  }, [isReading]);

  useEffect(() => {
    if (isReading) {
      const timeoutId = setTimeout(keepAlive, 5000);
      return () => clearTimeout(timeoutId);
    }
  }, [isReading, keepAlive]);

  useEffect(() => {
    // Check if the browser supports speech synthesis
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setIsSpeechSupported(true);
      
      // Load voices
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices && availableVoices.length > 0) {
          setVoices(availableVoices);
          console.log("Available voices loaded:", availableVoices.length);
          speechInitializedRef.current = true;
        }
      };

      // Try to load voices immediately
      loadVoices();
      
      // Chrome loads voices asynchronously, so set up the event listener
      window.speechSynthesis.onvoiceschanged = loadVoices;
      
      // Set a timeout to check if voices loaded, as a fallback
      const voiceLoadingTimeout = setTimeout(() => {
        if (voices.length === 0) {
          console.warn("No voices loaded within timeout, attempting fallback loading method");
          const fallbackVoices = window.speechSynthesis.getVoices();
          if (fallbackVoices && fallbackVoices.length > 0) {
            setVoices(fallbackVoices);
            speechInitializedRef.current = true;
            console.log("Voices loaded via fallback method:", fallbackVoices.length);
          } else {
            console.error("Failed to load any voices, speech synthesis may not work");
            speechInitializedRef.current = false;
          }
        }
      }, 3000);
      
      return () => {
        cleanupSpeech();
        clearTimeout(voiceLoadingTimeout);
        window.speechSynthesis.onvoiceschanged = null;
      };
    } else {
      console.warn("Speech synthesis not supported in this browser");
      setIsSpeechSupported(false);
    }

    return cleanupSpeech;
  }, [cleanupSpeech, voices.length]);

  // Reset failed attempts counter when language changes
  useEffect(() => {
    failedAttemptsRef.current = 0;
  }, [language]);

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
      if (!voices || !voices.length) {
        console.warn("No voices available");
        return null;
      }

      // Try to find a voice that matches the language
      const langCode = languageVoiceMap[language] || "en";
      console.log(`Looking for voice with language code: ${langCode}`);
      
      // First try Google voices (usually better quality)
      let voice = voices.find(
        (v) => v.name?.includes("Google") && v.lang.toLowerCase().includes(langCode.toLowerCase())
      );
      
      // Then try any other cloud/remote voice
      if (!voice) {
        voice = voices.find(
          (v) => v.lang.toLowerCase().includes(langCode.toLowerCase()) && !v.localService
        );
      }
      
      // Then try a local voice
      if (!voice) {
        voice = voices.find(
          (v) => v.lang.toLowerCase().includes(langCode.toLowerCase())
        );
      }
      
      // Fallback to English if no matches for non-English languages
      if (!voice && langCode !== "en") {
        voice = voices.find(
          (v) => v.lang.toLowerCase().includes("en") && !v.localService
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

      // Reset any ongoing speech
      window.speechSynthesis.cancel();
      
      // Some browsers need a small delay after canceling
      return true;
    } catch (error) {
      console.error("Failed to initialize speech synthesis:", error);
      return false;
    }
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!isSpeechSupported) {
        toast({
          title: "Speech Error",
          description: "Speech synthesis is not supported in this browser. Using text-only mode.",
          variant: "destructive"
        });
        return;
      }

      // Check if we've had too many failed attempts
      if (failedAttemptsRef.current >= maxRetryAttempts) {
        toast({
          title: "Speech Error",
          description: "There was an error playing the voice. Falling back to text-only mode.",
          variant: "destructive"
        });
        console.warn("Too many failed speech attempts, not trying again");
        return;
      }

      // Clear any pending retries
      if (pendingRetryRef.current) {
        clearTimeout(pendingRetryRef.current);
        pendingRetryRef.current = null;
      }

      // Initialize speech synthesis
      if (!initSpeechSynthesis()) {
        failedAttemptsRef.current++;
        toast({
          title: "Speech Error",
          description: "Could not initialize speech engine. Using text-only mode.",
          variant: "destructive"
        });
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

        utterance.rate = 0.9; // Slightly slower for better comprehension
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Set up event handlers
        utterance.onstart = () => {
          console.log("Speech started");
          setIsReading(true);
          failedAttemptsRef.current = 0; // Reset failed attempts counter on success
        };
        
        utterance.onend = () => {
          console.log("Speech ended successfully");
          setIsReading(false);
          setCurrentUtterance(null);
        };
        
        utterance.onerror = (event) => {
          console.error("Speech synthesis error:", event);
          setIsReading(false);
          setCurrentUtterance(null);
          failedAttemptsRef.current++;
          
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
        
        // Use a small delay before speaking (helps with browser bugs)
        setTimeout(() => {
          try {
            // Detect browser for specific fixes
            const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
            const isChrome = /chrome/i.test(navigator.userAgent) && !/edge|edg/i.test(navigator.userAgent);
            const isFirefox = /firefox/i.test(navigator.userAgent);
            
            // Custom handling for different browsers
            if (isSafari) {
              console.log("Safari detected, applying Safari-specific fix");
              // Safari needs a dummy utterance to "wake up" the speech synthesis
              const dummyUtterance = new SpeechSynthesisUtterance(' ');
              dummyUtterance.volume = 0; // Make it silent
              window.speechSynthesis.speak(dummyUtterance);
              
              // Small delay after the dummy utterance
              setTimeout(() => {
                window.speechSynthesis.speak(utterance);
              }, 100);
            } else if (isFirefox) {
              // Firefox has different issues, sometimes needs a shorter text
              console.log("Firefox detected, applying Firefox-specific fix");
              // If text is very long, try to break it up
              if (text.length > 500) {
                const chunks = text.match(/[^\.!\?]+[\.!\?]+/g) || [];
                if (chunks.length > 1) {
                  // Speak just the first sentence to test
                  const shortUtterance = new SpeechSynthesisUtterance(chunks[0]);
                  shortUtterance.voice = utterance.voice;
                  shortUtterance.lang = utterance.lang;
                  shortUtterance.rate = utterance.rate;
                  shortUtterance.volume = utterance.volume;
                  window.speechSynthesis.speak(shortUtterance);
                  
                  // If that works, then queue up the rest
                  shortUtterance.onend = () => {
                    const remainingText = chunks.slice(1).join(' ');
                    const remainingUtterance = new SpeechSynthesisUtterance(remainingText);
                    remainingUtterance.voice = utterance.voice;
                    remainingUtterance.lang = utterance.lang;
                    remainingUtterance.rate = utterance.rate;
                    remainingUtterance.volume = utterance.volume;
                    window.speechSynthesis.speak(remainingUtterance);
                  };
                  return;
                }
              }
              window.speechSynthesis.speak(utterance);
            } else {
              // For Chrome and other browsers
              window.speechSynthesis.speak(utterance);
              
              if (isChrome) {
                // Chrome-specific workaround for the speech synthesis bug
                // where it stops after ~15 seconds
                setTimeout(() => {
                  if (window.speechSynthesis.speaking) {
                    window.speechSynthesis.pause();
                    window.speechSynthesis.resume();
                  }
                }, 14000);
              }
            }
            
            // Check if speech actually started
            pendingRetryRef.current = setTimeout(() => {
              if (!window.speechSynthesis.speaking && utterance === currentUtterance) {
                console.log("Speech didn't start properly, trying one more time");
                
                // Try again with a different approach
                window.speechSynthesis.cancel();
                
                setTimeout(() => {
                  try {
                    // Try a simpler approach - just speak without any fancy stuff
                    const simpleUtterance = new SpeechSynthesisUtterance(text);
                    if (voice) {
                      simpleUtterance.voice = voice;
                    }
                    window.speechSynthesis.speak(simpleUtterance);
                    
                    // If still no luck after retry
                    setTimeout(() => {
                      if (!window.speechSynthesis.speaking) {
                        failedAttemptsRef.current++;
                        console.error("Speech still not working after retry");
                        setIsReading(false);
                        toast({
                          title: "Speech Error",
                          description: "There was an error playing the voice. Falling back to text-only mode.",
                          variant: "destructive"
                        });
                      }
                    }, 1000);
                    
                  } catch (retryError) {
                    console.error("Error during speech retry:", retryError);
                    failedAttemptsRef.current++;
                    setIsReading(false);
                  }
                }, 100);
              }
            }, 1000);
            
          } catch (innerError) {
            console.error("Secondary speech synthesis error:", innerError);
            failedAttemptsRef.current++;
            setIsReading(false);
            setCurrentUtterance(null);
            toast({
              title: "Speech Error",
              description: "There was an error playing the voice. Falling back to text-only mode.",
              variant: "destructive"
            });
          }
        }, 50);
      } catch (error) {
        console.error("Exception in speech synthesis:", error);
        failedAttemptsRef.current++;
        setIsReading(false);
        toast({
          title: "Speech Error",
          description: "There was an error playing the voice. Falling back to text-only mode.",
          variant: "destructive"
        });
      }
    },
    [
      isSpeechSupported,
      getBestVoice,
      language,
      currentUtterance,
      initSpeechSynthesis
    ]
  );

  const stop = useCallback(() => {
    if (isSpeechSupported) {
      console.log("Stopping speech");
      window.speechSynthesis.cancel();
      setIsReading(false);
      setCurrentUtterance(null);
      
      // Clear any pending retry attempts
      if (pendingRetryRef.current) {
        clearTimeout(pendingRetryRef.current);
        pendingRetryRef.current = null;
      }
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
