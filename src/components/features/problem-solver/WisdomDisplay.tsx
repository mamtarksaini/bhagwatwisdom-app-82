
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Volume2, VolumeX } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Language } from "@/types";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";

interface WisdomDisplayProps {
  solution: string;
  usingFallback: boolean;
  isPremium: boolean;
  language: Language;
  onRetry?: () => void;
  retryCount?: number;
  networkError?: boolean;
  directApiUsed?: boolean;
  aiServiceUnavailable?: boolean;
  errorDetails?: string;
}

export function WisdomDisplay({
  solution,
  usingFallback,
  isPremium,
  language,
  onRetry,
  retryCount = 0,
  networkError = false,
  directApiUsed = false,
  aiServiceUnavailable = false,
  errorDetails
}: WisdomDisplayProps) {
  const { speak, stop, isReading } = useSpeechSynthesis(language);
  
  const handleSpeak = () => {
    if (isReading) {
      stop();
      return;
    }
    
    speak(solution);
  };

  return (
    <div className="bg-spiritual dark:bg-gray-800/40 rounded-lg p-4 border border-spiritual-dark dark:border-gray-700 animate-fade-in">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-heading font-medium text-lg">
          {usingFallback ? "Spiritual Wisdom (Offline)" : "AI Spiritual Wisdom"}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="text-foreground/80 hover:text-foreground"
          onClick={handleSpeak}
        >
          {isReading ? (
            <VolumeX className="h-4 w-4 mr-2" />
          ) : (
            <Volume2 className="h-4 w-4 mr-2" />
          )}
          {isReading ? "Stop" : "Listen"}
        </Button>
      </div>
      <p className="leading-relaxed">{solution}</p>
      
      {(networkError || aiServiceUnavailable) && (
        <div className="mt-4 p-2 bg-amber-500/10 border border-amber-500/30 rounded-md text-sm">
          <p className="text-amber-700 dark:text-amber-400">
            {aiServiceUnavailable ? "AI service API key issue detected. Using offline wisdom." : 
             networkError ? "Network connection issue detected. Using offline wisdom." : 
             "Using offline wisdom due to AI service unavailability."}
          </p>
        </div>
      )}
      
      {(networkError || aiServiceUnavailable) && retryCount < 2 && (
        <div className="mt-4 flex justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onRetry}
            className="text-sm"
          >
            Retry with AI ({2 - retryCount} attempts left)
          </Button>
        </div>
      )}
      
      {errorDetails && (
        <Alert className="mt-4 bg-red-500/10 border border-red-500/30">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-xs overflow-auto max-h-24">
            {errorDetails}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
