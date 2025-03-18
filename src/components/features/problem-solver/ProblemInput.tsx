
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, RotateCcw, Send } from "lucide-react";
import { Language } from "@/types";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { toast } from "@/components/ui/use-toast";

interface ProblemInputProps {
  problem: string;
  setProblem: (value: string) => void;
  onSubmit: () => void;
  onReset: () => void;
  isLoading: boolean;
  language: Language;
}

export function ProblemInput({ 
  problem, 
  setProblem, 
  onSubmit, 
  onReset, 
  isLoading, 
  language 
}: ProblemInputProps) {
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    resetTranscript, 
    error: speechError 
  } = useSpeechRecognition(language);
  
  const handleSpeechInput = () => {
    if (isListening) {
      stopListening();
      if (transcript) {
        // Safely concatenate strings
        setProblem((prev) => {
          const trimmedPrev = prev.trim();
          const trimmedTranscript = transcript.trim();
          
          if (!trimmedPrev) return trimmedTranscript;
          if (!trimmedTranscript) return trimmedPrev;
          
          return `${trimmedPrev} ${trimmedTranscript}`;
        });
        resetTranscript();
      }
    } else {
      startListening();
      toast({
        title: "Voice input activated",
        description: "Speak clearly to record your problem",
      });
    }
  };

  // If using speech recognition, update problem with transcript
  useEffect(() => {
    if (isListening && transcript) {
      setProblem(transcript);
    }
  }, [transcript, isListening, setProblem]);

  return (
    <div>
      <div className="relative">
        <Textarea
          placeholder="Describe the problem or challenge you're facing..."
          className="min-h-28 resize-none pr-20"
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
        />
        <div className="absolute right-2 top-2 flex flex-col gap-2">
          <Button
            variant="outline"
            size="icon"
            className={`rounded-full ${isListening ? 'bg-red-100 text-red-500 animate-pulse' : ''}`}
            onClick={handleSpeechInput}
            type="button"
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={onReset}
            type="button"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {speechError && <p className="text-destructive text-sm mt-2">{speechError}</p>}
      
      <div className="mt-4 flex justify-end">
        <Button 
          onClick={onSubmit} 
          disabled={!problem.trim() || isLoading}
          className="button-gradient"
          type="button"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Get Guidance
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
