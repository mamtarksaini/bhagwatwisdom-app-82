import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Volume2, VolumeX, Crown, X } from "lucide-react";
import { Language } from "@/types";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { callGeminiDirectly } from "@/lib/wisdom/geminiApi";
import { canUseVoiceAgent, getRemainingFreeResponses, incrementVoiceAgentUsage } from "@/lib/wisdom/voiceAgent";
import { PremiumUpgrade } from "@/components/premium/PremiumUpgrade";
import { AudioVisualizer } from "./AudioVisualizer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConversation } from "@11labs/react";

interface VoiceAgentProps {
  language: Language;
  elevenLabsAgentId?: string;
}

const DEFAULT_AGENT_ID = "UBrWV90gjXHjFCdjaYBK";

export function VoiceAgent({ language, elevenLabsAgentId = DEFAULT_AGENT_ID }: VoiceAgentProps) {
  const { user, isPremium } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [useTextOnly, setUseTextOnly] = useState(false);
  const [useElevenLabs, setUseElevenLabs] = useState(true);
  const [callTime, setCallTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTranscriptRef = useRef<string>("");
  const silenceThreshold = 2000; // 2 seconds of silence will trigger processing
  
  const speechRecognition = useSpeechRecognition(language);
  const speechSynthesis = useSpeechSynthesis(language);
  
  const elevenLabsConversation = useConversation({
    onMessage: (message) => {
      if (message && typeof message === 'object') {
        if ('transcript' in message && message.transcript) {
          const transcript = message.transcript;
          if (typeof transcript === 'string') {
            setUserInput(transcript);
          }
        }
        if ('text' in message && message.text) {
          const text = message.text;
          if (typeof text === 'string') {
            setAiResponse(text);
          }
        }
      }
    },
    onError: (error) => {
      console.error("ElevenLabs error:", error);
      setUseElevenLabs(false);
      toast({
        title: "Voice Agent Error",
        description: "Falling back to basic voice mode. Try refreshing the page.",
        variant: "destructive"
      });
    }
  });
  
  const isElevenLabsActive = elevenLabsConversation.status === "connected";
  const isElevenLabsSpeaking = elevenLabsConversation.isSpeaking;
  
  useEffect(() => {
    if (speechRecognition.isListening) {
      setUserInput(speechRecognition.transcript);
      
      if (speechRecognition.transcript !== lastTranscriptRef.current) {
        lastTranscriptRef.current = speechRecognition.transcript;
        
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
        
        if (speechRecognition.transcript.trim()) {
          silenceTimerRef.current = setTimeout(() => {
            if (speechRecognition.isListening && speechRecognition.transcript.trim()) {
              stopListening();
            }
          }, silenceThreshold);
        }
      }
    }
  }, [speechRecognition.transcript, speechRecognition.isListening]);

  useEffect(() => {
    return () => {
      if (useElevenLabs && isElevenLabsActive) {
        elevenLabsConversation.endSession();
      } else {
        speechSynthesis.stop();
        speechRecognition.stopListening();
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [speechSynthesis, speechRecognition, useElevenLabs, isElevenLabsActive, elevenLabsConversation]);

  useEffect(() => {
    const isActive = isListening || isProcessing || speechSynthesis.isReading || isElevenLabsActive;
    
    if (isActive) {
      if (!timerRef.current) {
        const startTime = Date.now() - callTime * 1000;
        timerRef.current = setInterval(() => {
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          setCallTime(elapsed);
        }, 1000);
      }
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isListening, isProcessing, speechSynthesis.isReading, isElevenLabsActive, callTime]);
  
  const startListening = async () => {
    try {
      if (useElevenLabs) {
        setIsProcessing(true);
        
        await elevenLabsConversation.startSession({
          agentId: elevenLabsAgentId,
        });
        
        setIsProcessing(false);
        setIsListening(true);
        
        toast({
          title: "ElevenLabs Voice Agent",
          description: "Agent connected. Start speaking...",
        });
      } else {
        setIsListening(true);
        speechRecognition.startListening();
        
        toast({
          title: "Listening",
          description: "Speak now. I'm listening... I'll process after you pause speaking.",
        });
      }
      
      lastTranscriptRef.current = "";
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    } catch (error) {
      console.error("Error starting voice agent:", error);
      setUseElevenLabs(false);
      setIsProcessing(false);
      
      toast({
        title: "Voice Agent Error",
        description: "Falling back to basic voice mode. Try again.",
        variant: "destructive"
      });
    }
  };
  
  const stopListening = async () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
    if (useElevenLabs && isElevenLabsActive) {
      return;
    }
    
    speechRecognition.stopListening();
    setIsListening(false);
    
    if (speechRecognition.transcript.trim()) {
      await handleSendVoiceRequest(speechRecognition.transcript);
    } else {
      toast({
        title: "No speech detected",
        description: "Please try again and speak clearly.",
      });
    }
  };
  
  const handleSendVoiceRequest = async (input: string) => {
    if (!input.trim()) return;
    
    setIsProcessing(true);
    setAiResponse("");
    
    try {
      if (input.toLowerCase().includes("give me text") || 
          input.toLowerCase().includes("text only") || 
          input.toLowerCase().includes("show text")) {
        setUseTextOnly(true);
      }
      
      const prompt = `You are a helpful assistant responding to voice input. 
                    Please provide a concise response to the following question or statement. 
                    Keep your answer under 100 words for better voice synthesis.
                    User input: ${input}
                    ${language === 'hindi' ? 'Please respond in Hindi.' : 'Please respond in English.'}`;
      
      const response = await callGeminiDirectly(prompt);
      
      if (response) {
        setAiResponse(response);
        
        if (!useTextOnly && speechSynthesis.isSpeechSupported) {
          setTimeout(() => {
            try {
              speechSynthesis.speak(response);
            } catch (error) {
              console.error("Error speaking response:", error);
              setUseTextOnly(true);
              toast({
                title: "Speech Error",
                description: "Voice output failed. Showing text response instead.",
                variant: "destructive"
              });
            }
          }, 500);
        } else {
          setUseTextOnly(true);
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
      try {
        speechSynthesis.speak(aiResponse);
      } catch (error) {
        console.error("Error playing speech:", error);
        setUseTextOnly(true);
        toast({
          title: "Speech Error", 
          description: "Unable to play voice. Showing text instead.",
          variant: "destructive"
        });
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const endCall = () => {
    if (useElevenLabs && isElevenLabsActive) {
      elevenLabsConversation.endSession();
    } else {
      speechSynthesis.stop();
      speechRecognition.stopListening();
    }
    
    setIsListening(false);
    setCallTime(0);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };
  
  const isAnyActive = isListening || isProcessing || speechSynthesis.isReading || isElevenLabsActive || isElevenLabsSpeaking;
  
  return (
    <div className="max-w-xl mx-auto w-full">
      <Card className="bg-[#1A1F2C] border-[#33C3F0]/30 text-white overflow-hidden">
        <CardHeader className="pb-0">
          <CardTitle className="text-[#1EAEDB] text-2xl font-normal flex items-center justify-between">
            AI Assistant
            <span className="flex items-center text-gold text-sm">
              <Crown className="h-4 w-4 mr-1" />
              {useElevenLabs ? "ElevenLabs Agent" : "Basic Voice Mode"}
            </span>
          </CardTitle>
          <Tabs defaultValue="voice" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#221F26]">
              <TabsTrigger 
                value="voice" 
                className="text-[#1EAEDB] data-[state=active]:bg-[#1EAEDB]/10 data-[state=active]:text-white"
              >
                Voice Assistant
              </TabsTrigger>
              <TabsTrigger 
                value="chat" 
                className="text-[#1EAEDB] data-[state=active]:bg-[#1EAEDB]/10 data-[state=active]:text-white"
                disabled
              >
                Chat Assistant
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
      
        <CardContent className="p-6 pt-8 min-h-[400px] flex flex-col items-center justify-center">
          <div className="w-full h-[300px] flex items-center justify-center relative">
            <div className="relative h-56 w-56">
              <div className={`absolute inset-0 rounded-full ${isAnyActive ? 'border-2 border-[#1EAEDB] animate-pulse' : ''}`}>
                <AudioVisualizer isActive={isAnyActive} color="#1EAEDB" />
              </div>
            </div>
            
            {(isListening || isElevenLabsActive) && (
              <div className="absolute bottom-0 w-full text-center">
                <p className="text-white/80 mb-2">{userInput || "Listening..."}</p>
              </div>
            )}
            
            {aiResponse && !isListening && !isElevenLabsActive && (
              <div className="absolute bottom-0 w-full text-center max-h-24 overflow-y-auto">
                <p className={`text-white/90 mb-2 ${useTextOnly || !speechSynthesis.isSpeechSupported ? 'block' : 'hidden'}`}>
                  {aiResponse}
                </p>
              </div>
            )}
          </div>
          
          <div className="w-full text-center mt-2">
            <p className="text-[#1EAEDB]/80 text-sm">
              {isAnyActive && 
                `On call with AI Assistant • ${formatTime(callTime)}`}
            </p>
          </div>
        </CardContent>
      
        <div className="border-t border-[#33C3F0]/20">
          <div className="flex items-center justify-center p-4 gap-2">
            {!isListening && !isElevenLabsActive ? (
              <Button 
                onClick={startListening}
                className="rounded-full h-12 w-12 bg-[#1EAEDB] hover:bg-[#33C3F0] text-white"
                disabled={isProcessing}
              >
                <Mic className="h-6 w-6" />
              </Button>
            ) : (
              <Button
                onClick={stopListening}
                className="rounded-full h-12 w-12 bg-red-500 hover:bg-red-600 text-white"
                title="Stop listening and get response"
                disabled={useElevenLabs && isElevenLabsActive}
              >
                <MicOff className="h-6 w-6" />
              </Button>
            )}
            
            {aiResponse && !useElevenLabs && (
              <Button
                variant="outline"
                className="rounded-full h-12 w-12 border-[#33C3F0]/50 text-[#33C3F0] hover:bg-[#33C3F0]/10"
                onClick={toggleSpeech}
              >
                {speechSynthesis.isReading ? (
                  <VolumeX className="h-6 w-6" />
                ) : (
                  <Volume2 className="h-6 w-6" />
                )}
              </Button>
            )}
            
            {isAnyActive && (
              <Button
                variant="outline"
                className="rounded-full h-12 w-12 border-red-500/50 text-red-500 hover:bg-red-500/10"
                onClick={endCall}
              >
                <X className="h-6 w-6" />
              </Button>
            )}
          </div>
        </div>
        
        <CardFooter className="flex flex-col bg-[#221F26] py-2 px-4">
          <div className="text-xs text-[#1EAEDB]/60 text-center w-full">
            {useElevenLabs ? "Using ElevenLabs Voice Agent" : "Using Basic Voice Mode"}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
