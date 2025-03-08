
import { useState, useEffect, useCallback } from "react";
import { Language } from "@/types";

interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
}

// Map our languages to the browser's SpeechRecognition language codes
const languageMap: Record<Language, string> = {
  english: "en-US",
  hindi: "hi-IN",
  sanskrit: "sa-IN", // Sanskrit might not be widely supported
  tamil: "ta-IN",
  telugu: "te-IN",
  gujarati: "gu-IN",
  marathi: "mr-IN",
  punjabi: "pa-IN",
  malayalam: "ml-IN",
  sindhi: "sd-IN", // Sindhi might not be widely supported
  odia: "or-IN",
  konkani: "kok-IN", // Konkani might not be widely supported
  bengali: "bn-IN"
};

export function useSpeechRecognition(language: Language = "english"): SpeechRecognitionHook {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in your browser.");
      return;
    }

    try {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = languageMap[language] || "en-US";

      recognitionInstance.onresult = (event) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);
      };

      recognitionInstance.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    } catch (err) {
      console.error("Error initializing speech recognition:", err);
      setError("Failed to initialize speech recognition");
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [language]);

  // Update language when it changes
  useEffect(() => {
    if (recognition) {
      recognition.lang = languageMap[language] || "en-US";
    }
  }, [language, recognition]);

  const startListening = useCallback(() => {
    setError(null);
    if (recognition) {
      try {
        recognition.start();
        setIsListening(true);
      } catch (err) {
        console.error("Error starting speech recognition:", err);
        setError("Failed to start speech recognition");
      }
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition]);

  const resetTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    error
  };
}
