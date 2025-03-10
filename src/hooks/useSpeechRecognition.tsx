
import { useState, useEffect, useCallback } from 'react';
import { Language } from '@/types';

// Define our own type for SpeechRecognition as the browser types aren't always available
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface WebkitSpeechRecognition {
  new (): SpeechRecognitionInstance;
}

interface SpeechRecognitionInstance extends EventTarget {
  grammars: any;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: ((event: Event) => void) | null;
}

export interface SpeechRecognitionHook {
  transcript: string;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  hasRecognitionSupport: boolean;
  error: string | null;
}

export const useSpeechRecognition = (language: Language = "english"): SpeechRecognitionHook => {
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recognition, setRecognition] = useState<SpeechRecognitionInstance | null>(null);
  const [hasRecognitionSupport, setHasRecognitionSupport] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if the browser supports speech recognition
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      
      // Set language based on the provided language prop
      switch(language) {
        case "hindi": 
          recognitionInstance.lang = 'hi-IN'; 
          break;
        default:
          recognitionInstance.lang = 'en-US';
          break;
      }
      
      setRecognition(recognitionInstance);
      setHasRecognitionSupport(true);
    }
  }, [language]);

  const startListening = useCallback(() => {
    if (!recognition) return;
    
    setError(null);
    setTranscript('');
    setIsListening(true);
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let currentTranscript = '';
      
      // Safely iterate through results
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result && result[0]) {
          currentTranscript += result[0].transcript;
        }
      }
      
      setTranscript(currentTranscript);
    };
    
    recognition.onerror = (event) => {
      setError("Speech recognition error occurred. Please try again.");
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    try {
      recognition.start();
    } catch (error) {
      setError("Could not start speech recognition. Please try again.");
      setIsListening(false);
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (!recognition) return;
    
    recognition.stop();
    setIsListening(false);
  }, [recognition]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    hasRecognitionSupport,
    error
  };
};

export default useSpeechRecognition;
