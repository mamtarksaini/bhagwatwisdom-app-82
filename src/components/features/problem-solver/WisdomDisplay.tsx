
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Volume2, VolumeX, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Language } from "@/types";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { toast } from "@/hooks/use-toast";

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
  const [showDetails, setShowDetails] = useState(false);
  
  const handleSpeak = () => {
    if (isReading) {
      stop();
      return;
    }
    
    speak(solution);
  };
  
  const handleRetryWithToast = () => {
    toast({
      title: "Retrying AI connection",
      description: "Attempting to connect to the AI wisdom service...",
      variant: "default"
    });
    
    if (onRetry) onRetry();
  };
  
  const toggleDetails = () => {
    setShowDetails(!showDetails);
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
        <Alert className="mt-4 bg-amber-500/10 border border-amber-500/30">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-700 dark:text-amber-400 font-medium">
            {aiServiceUnavailable 
              ? "AI Service Configuration Issue" 
              : "Network Connection Issue"}
          </AlertTitle>
          <AlertDescription className="text-amber-700/80 dark:text-amber-400/80">
            {aiServiceUnavailable 
              ? "The AI service API key may need to be updated in Supabase Edge Function secrets." 
              : "Unable to connect to the AI wisdom service. This could be due to network connectivity or server issues."}
            {" "}Using offline wisdom for now.
          </AlertDescription>
        </Alert>
      )}
      
      {(networkError || aiServiceUnavailable) && retryCount < 2 && (
        <div className="mt-4 flex justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRetryWithToast}
            className="text-sm flex items-center"
          >
            <RefreshCw className="h-3 w-3 mr-2" />
            Retry with AI ({2 - retryCount} attempts left)
          </Button>
        </div>
      )}
      
      {errorDetails && (
        <div className="mt-4">
          <Button 
            variant="link" 
            size="sm" 
            onClick={toggleDetails} 
            className="text-xs text-muted-foreground p-0"
          >
            {showDetails ? "Hide technical details" : "Show technical details"}
          </Button>
          
          {showDetails && (
            <Alert className="mt-2 bg-red-500/10 border border-red-500/30">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-xs overflow-auto max-h-24 font-mono">
                {errorDetails}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}
