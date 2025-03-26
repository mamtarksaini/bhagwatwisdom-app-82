import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Language } from "@/types";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { Mic, MicOff, Volume2, VolumeX, RotateCcw, Send } from "lucide-react";
import { getWisdomResponse } from "@/lib/wisdom";
import { toast } from "@/hooks/use-toast";

interface DreamInterpreterProps {
  language: Language;
  isPremium?: boolean;
}

export function DreamInterpreter({ language, isPremium = false }: DreamInterpreterProps) {
  const [dream, setDream] = useState("");
  const [interpretation, setInterpretation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [apiKeyError, setApiKeyError] = useState(false);
  const { isListening, transcript, startListening, stopListening, resetTranscript, error } = useSpeechRecognition(language);
  const { speak, stop, isReading } = useSpeechSynthesis(language);

  const handleSpeechInput = () => {
    if (isListening) {
      stopListening();
      setDream(prev => prev + " " + transcript);
      resetTranscript();
    } else {
      startListening();
    }
  };

  const handleReset = () => {
    setDream("");
    setInterpretation("");
    resetTranscript();
    setUsingFallback(false);
    setNetworkError(false);
    setApiKeyError(false);
  };

  const handleSubmit = async () => {
    if (!dream.trim() || isLoading) return;
    
    setIsLoading(true);
    setInterpretation("");
    setUsingFallback(false);
    setNetworkError(false);
    setApiKeyError(false);
    
    // Show loading toast
    const loadingToast = toast({
      title: "Interpreting your dream",
      description: "Finding spiritual meaning in your dream...",
      variant: "default"
    });
    
    try {
      // Create a prompt specifically for dream interpretation using formal, respectful language
      const dreamPrompt = `Interpret this dream through the lens of Bhagavad Gita and spiritual wisdom in a formal, respectful tone: "${dream}"
      
      ${language === 'hindi' ? "Important: Please use formal, respectful Hindi language. Avoid casual expressions like 'यार'. Maintain a tone appropriate for spiritual guidance." : ""}
      
      Provide an interpretation that is:
      1. Respectful and dignified in tone
      2. Spiritually insightful
      3. Connects to authentic Bhagavad Gita teachings when appropriate
      4. Offers practical wisdom without casual language`;
      
      // Use the wisdom API to get an AI-generated interpretation
      const response = await getWisdomResponse('spirituality', language, dreamPrompt);
      
      setInterpretation(response.answer);
      setUsingFallback(response.isFallback || false);
      setNetworkError(response.isNetworkIssue || false);
      setApiKeyError(response.isApiKeyIssue || false);
      
      if (response.isFallback) {
        if (response.isApiKeyIssue) {
          toast({
            title: "API Key Configuration Issue",
            description: "Using offline dream interpretation.",
            variant: "destructive"
          });
        } else if (response.isNetworkIssue) {
          toast({
            title: "Network Connection Issue",
            description: "Using offline dream interpretation.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Using offline interpretation",
            description: "AI service unavailable. Showing offline wisdom.",
            variant: "default"
          });
        }
      } else {
        toast({
          title: "Dream interpreted",
          description: "AI-powered spiritual interpretation is ready.",
          variant: "success"
        });
      }
      
    } catch (error) {
      console.error("Error interpreting dream:", error);
      setUsingFallback(true);
      
      toast({
        title: "Interpretation Error",
        description: "Could not connect to AI service. Using offline interpretation.",
        variant: "destructive"
      });
      
    } finally {
      loadingToast.dismiss();
      setIsLoading(false);
    }
  };

  const handleSpeak = () => {
    if (isReading) {
      stop();
      return;
    }
    
    speak(interpretation);
  };

  useEffect(() => {
    if (isListening) {
      setDream(transcript);
    }
  }, [transcript, isListening]);

  return (
    <Card className="glass-card border border-gold/30">
      <CardHeader>
        <CardTitle className="text-gradient">Dream Interpreter</CardTitle>
        <CardDescription>Understand your dreams through the ancient wisdom of Bhagavad Gita</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="relative">
            <Textarea
              placeholder="Describe your dream in as much detail as you can remember..."
              className="min-h-28 resize-none pr-20"
              value={dream}
              onChange={(e) => setDream(e.target.value)}
            />
            <div className="absolute right-2 top-2 flex flex-col gap-2">
              <Button
                variant="outline"
                size="icon"
                className={`rounded-full ${isListening ? 'bg-red-100 text-red-500 animate-pulse' : ''}`}
                onClick={handleSpeechInput}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {error && <p className="text-destructive text-sm mt-2">{error}</p>}
          
          <div className="mt-4 flex justify-end">
            <Button 
              onClick={handleSubmit} 
              disabled={!dream.trim() || isLoading}
              className="button-gradient"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Interpreting
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Interpret Dream
                </>
              )}
            </Button>
          </div>
        </div>
        
        {interpretation && (
          <div className="bg-spiritual dark:bg-gray-800/40 rounded-lg p-4 border border-spiritual-dark dark:border-gray-700 animate-fade-in">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-heading font-medium text-lg">
                {usingFallback ? "Spiritual Interpretation (Offline)" : "AI Spiritual Interpretation"}
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
            <p className="leading-relaxed">{interpretation}</p>
            
            {(networkError || apiKeyError) && (
              <div className="mt-4 p-2 bg-amber-500/10 border border-amber-500/30 rounded-md text-sm">
                <p className="text-amber-700 dark:text-amber-400">
                  {apiKeyError ? "AI service API key issue detected. Using offline interpretation." : 
                   networkError ? "Network connection issue detected. Using offline interpretation." : 
                   "Using offline interpretation due to AI service unavailability."}
                </p>
              </div>
            )}
          </div>
        )}
        
        {!isPremium && (
          <div className="mt-4 bg-gold/10 dark:bg-gold/20 rounded-lg p-4 text-sm">
            <p className="font-medium mb-1">Upgrade to Premium for enhanced dream interpretation:</p>
            <ul className="list-disc pl-5 space-y-1 text-foreground/80">
              <li>Deeper symbolic analysis of dream elements</li>
              <li>Connections to specific Bhagavad Gita verses</li>
              <li>Personalized spiritual guidance based on your dreams</li>
              <li>Unlimited interpretations and voice features</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
