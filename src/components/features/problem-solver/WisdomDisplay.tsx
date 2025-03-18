
import React from 'react';
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { Language } from "@/types";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";

interface WisdomDisplayProps {
  solution: string;
  usingFallback: boolean;
  isPremium: boolean;
  language: Language;
}

export function WisdomDisplay({ 
  solution, 
  usingFallback, 
  isPremium,
  language 
}: WisdomDisplayProps) {
  const { speak, stop, isReading } = useSpeechSynthesis(language);

  const handleSpeak = () => {
    if (isReading) {
      stop();
      return;
    }
    
    speak(solution);
  };

  if (!solution) return null;

  return (
    <div className="bg-spiritual dark:bg-gray-800/40 rounded-lg p-4 border border-spiritual-dark dark:border-gray-700 animate-fade-in">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-heading font-medium text-lg">Bhagavad Gita Wisdom</h3>
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
      {usingFallback && isPremium && (
        <p className="text-sm text-muted-foreground mt-2 italic">
          Note: This is a pre-written response. AI-generated personalized guidance will be available soon.
        </p>
      )}
    </div>
  );
}
