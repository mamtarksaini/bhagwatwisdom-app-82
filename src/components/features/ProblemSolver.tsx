import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Language } from "@/types";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { Mic, MicOff, Volume2, VolumeX, RotateCcw, Send } from "lucide-react";
import { getWisdomResponse, determineResponseCategory, fallbackWisdomResponses } from "@/lib/wisdom";
import { toast } from "@/components/ui/use-toast";

interface ProblemSolverProps {
  language: Language;
  isPremium?: boolean;
}

export function ProblemSolver({ language, isPremium = false }: ProblemSolverProps) {
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { isListening, transcript, startListening, stopListening, resetTranscript, error } = useSpeechRecognition(language);
  const { speak, stop, isReading } = useSpeechSynthesis(language);

  const handleSpeechInput = () => {
    if (isListening) {
      stopListening();
      setProblem(prev => prev + " " + transcript);
      resetTranscript();
    } else {
      startListening();
    }
  };

  const handleReset = () => {
    setProblem("");
    setSolution("");
    resetTranscript();
  };

  const handleSubmit = async () => {
    if (!problem.trim()) return;
    
    setIsLoading(true);
    console.log('Submitting problem:', { problem, language });
    
    try {
      const category = determineResponseCategory(problem);
      console.log('Determined category:', category);
      
      const response = await getWisdomResponse(category, language, problem);
      console.log('Got wisdom response:', response);
      
      if (response) {
        setSolution(response);
      } else {
        console.error('No response received from getWisdomResponse');
        const responses = fallbackWisdomResponses[language] || fallbackWisdomResponses.english;
        const fallbackResponse = responses[category] || responses.default;
        setSolution(fallbackResponse);
        toast({
          title: "Using Fallback Response",
          description: "Could not connect to wisdom service. Using pre-defined wisdom.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Error getting wisdom:", error);
      
      const responses = fallbackWisdomResponses[language] || fallbackWisdomResponses.english;
      const category = determineResponseCategory(problem);
      const fallbackResponse = responses[category] || responses.default;
      
      setSolution(fallbackResponse);
      toast({
        title: "Error",
        description: "Something went wrong. Using pre-defined wisdom instead.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = () => {
    if (isReading) {
      stop();
      return;
    }
    
    speak(solution);
  };

  useEffect(() => {
    if (isListening) {
      setProblem(transcript);
    }
  }, [transcript, isListening]);

  return (
    <Card className="glass-card border border-gold/30">
      <CardHeader>
        <CardTitle className="text-gradient">Wisdom Guide</CardTitle>
        <CardDescription>Share your challenge and receive guidance from ancient Bhagavad Gita wisdom</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
              disabled={!problem.trim() || isLoading}
              className="button-gradient"
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
        
        {solution && (
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
          </div>
        )}
        
        {!isPremium && (
          <div className="mt-4 bg-gold/10 dark:bg-gold/20 rounded-lg p-4 text-sm">
            <p className="font-medium mb-1">Upgrade to Premium for enhanced guidance:</p>
            <ul className="list-disc pl-5 space-y-1 text-foreground/80">
              <li>Detailed solutions with specific verse references</li>
              <li>Personalized mantras for your situation</li>
              <li>Access to all available languages</li>
              <li>Voice input and output in all languages</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
