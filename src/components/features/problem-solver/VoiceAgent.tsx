
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Volume2, VolumeX, Crown } from "lucide-react";
import { Language } from "@/types";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { callGeminiDirectly } from "@/lib/wisdom/geminiApi";
import { canUseVoiceAgent, getRemainingFreeResponses, incrementVoiceAgentUsage } from "@/lib/wisdom/voiceAgent";
import { PremiumUpgrade } from "@/components/premium/PremiumUpgrade";

interface VoiceAgentProps {
  language: Language;
  elevenLabsAgentId?: string;
}

export function VoiceAgent({ language, elevenLabsAgentId }: VoiceAgentProps) {
  const { user, isPremium } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [canUseFreeResponse, setCanUseFreeResponse] = useState(false);
  const [remainingResponses, setRemainingResponses] = useState(0);
  const [showPremiumOffer, setShowPremiumOffer] = useState(false);
  const [useTextOnly, setUseTextOnly] = useState(false);
  
  const speechRecognition = useSpeechRecognition(language);
  const speechSynthesis = useSpeechSynthesis(language);
  
  useEffect(() => {
    const checkUsage = async () => {
      if (!user && !isPremium) {
        setCanUseFreeResponse(false);
        setRemainingResponses(0);
        return;
      }
      
      try {
        const canUse = await canUseVoiceAgent(user, isPremium);
        setCanUseFreeResponse(canUse);
        
        if (!isPremium && user) {
          const remaining = await getRemainingFreeResponses(user.id);
          setRemainingResponses(remaining);
          setShowPremiumOffer(remaining < 2);
        } else {
          setRemainingResponses(0);
          setShowPremiumOffer(false);
        }
      } catch (error) {
        console.error("Error checking voice agent usage:", error);
        // Default to allowing usage if there's an error checking
        setCanUseFreeResponse(true);
      }
    };
    
    checkUsage();
  }, [user, isPremium]);
  
  useEffect(() => {
    if (speechRecognition.isListening) {
      setUserInput(speechRecognition.transcript);
    }
  }, [speechRecognition.transcript, speechRecognition.isListening]);

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      speechSynthesis.stop();
      speechRecognition.stopListening();
    };
  }, [speechSynthesis, speechRecognition]);
  
  const startListening = () => {
    if (!canUseFreeResponse && !isPremium) {
      toast({
        title: "Usage Limit Reached",
        description: "Upgrade to Premium for unlimited voice agent responses.",
        variant: "destructive"
      });
      setShowPremiumOffer(true);
      return;
    }
    
    setIsListening(true);
    speechRecognition.startListening();
    toast({
      title: "Listening",
      description: "Speak now. I'm listening...",
    });
  };
  
  const stopListening = async () => {
    speechRecognition.stopListening();
    setIsListening(false);
    
    if (speechRecognition.transcript.trim()) {
      await handleSendVoiceRequest(speechRecognition.transcript);
    }
  };
  
  const handleSendVoiceRequest = async (input: string) => {
    if (!input.trim()) return;
    
    if (!canUseFreeResponse && !isPremium) {
      toast({
        title: "Usage Limit Reached",
        description: "Upgrade to Premium for unlimited voice agent responses.",
        variant: "destructive"
      });
      setShowPremiumOffer(true);
      return;
    }
    
    setIsProcessing(true);
    setAiResponse("");
    
    try {
      // Check if user specifically requested text-only mode
      if (input.toLowerCase().includes("give me text") || 
          input.toLowerCase().includes("text only") || 
          input.toLowerCase().includes("show text")) {
        setUseTextOnly(true);
      } else {
        setUseTextOnly(false);
      }
      
      const prompt = `You are a helpful assistant responding to voice input. 
                    Please provide a concise response to the following question or statement. 
                    Keep your answer under 100 words for better voice synthesis.
                    User input: ${input}
                    ${language === 'hindi' ? 'Please respond in Hindi.' : 'Please respond in English.'}`;
      
      const response = await callGeminiDirectly(prompt);
      
      if (response) {
        setAiResponse(response);
        
        // Only trigger speech if not in text-only mode
        if (!useTextOnly && speechSynthesis.isSpeechSupported) {
          // Auto-play the response using speech synthesis
          setTimeout(() => {
            speechSynthesis.speak(response);
          }, 500);
        }
        
        try {
          if (!isPremium && user) {
            await incrementVoiceAgentUsage(user.id);
            const remaining = await getRemainingFreeResponses(user.id);
            setRemainingResponses(remaining);
            setCanUseFreeResponse(remaining > 0);
            
            if (remaining === 0) {
              setShowPremiumOffer(true);
              toast({
                title: "Usage Limit Reached",
                description: "You've used all your free voice responses this month. Upgrade to Premium for unlimited access.",
                variant: "destructive"
              });
            } else if (remaining === 1) {
              toast({
                title: "Almost Out of Free Responses",
                description: "You have 1 free voice response remaining this month.",
                variant: "destructive"
              });
            }
          }
        } catch (error) {
          console.error("Error updating usage count:", error);
          // Continue without blocking the user experience
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to get response from AI. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Voice agent error:", error);
      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      speechRecognition.resetTranscript();
    }
  };
  
  const toggleSpeech = () => {
    if (speechSynthesis.isReading) {
      speechSynthesis.stop();
    } else if (aiResponse) {
      speechSynthesis.speak(aiResponse);
    }
  };
  
  return (
    <Card className="glass-card border border-gold/30">
      <CardHeader>
        <CardTitle className="text-gradient flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Voice Agent
        </CardTitle>
        <CardDescription>
          Ask questions using your voice and receive spoken wisdom
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!isPremium && (
          <div className="text-sm text-muted-foreground flex items-center justify-between">
            <span>
              {remainingResponses > 0 
                ? `${remainingResponses} free ${remainingResponses === 1 ? 'response' : 'responses'} remaining this month` 
                : "No free responses remaining this month"}
            </span>
            {isPremium && (
              <span className="flex items-center text-gold">
                <Crown className="h-4 w-4 mr-1" />
                Premium
              </span>
            )}
          </div>
        )}
        
        <div className="border rounded-lg p-4 bg-background/50 min-h-24 relative">
          {isListening ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center animate-pulse mb-2">
                <Mic className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-center text-sm">
                {userInput || "Listening..."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <Button 
                onClick={startListening}
                className="rounded-full h-16 w-16 button-gradient"
                disabled={isProcessing || (!canUseFreeResponse && !isPremium)}
              >
                <Mic className="h-8 w-8" />
              </Button>
              <p className="text-center text-sm mt-2">
                {isProcessing ? "Processing..." : "Tap to speak"}
              </p>
            </div>
          )}
          
          {isListening && (
            <Button
              variant="outline"
              size="sm"
              className="absolute bottom-2 right-2"
              onClick={stopListening}
            >
              <MicOff className="h-4 w-4 mr-1" />
              Stop
            </Button>
          )}
        </div>
        
        {aiResponse && (
          <div className="border rounded-lg p-4 bg-background/50 relative">
            <div className="prose dark:prose-invert">
              <p>{aiResponse}</p>
            </div>
            
            {!useTextOnly && (
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={toggleSpeech}
              >
                {speechSynthesis.isReading ? (
                  <>
                    <VolumeX className="h-4 w-4 mr-1" />
                    Stop
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4 mr-1" />
                    Play
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col">
        {showPremiumOffer && !isPremium && (
          <div className="w-full mt-4">
            <PremiumUpgrade />
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
