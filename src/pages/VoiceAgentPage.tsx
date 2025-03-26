
import React, { useState, useEffect } from 'react';
import { PageLayout } from "@/components/layout/PageLayout";
import { Language } from "@/types";
import { LanguagePicker } from "@/components/features/LanguagePicker";
import { useAuth } from "@/contexts/AuthContext";
import { Globe, AlertCircle, Volume2, Mic, MicOff, X, Phone } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useConversation } from "@11labs/react";
import { toast } from "@/components/ui/use-toast";
import { AudioVisualizer } from "@/components/features/problem-solver/AudioVisualizer";

// Import types from @11labs/react to ensure compatibility
import type { OnMessageProps } from '@11labs/react';

// Define local types for message handling
type Role = 'user' | 'assistant' | 'system' | 'ai';

interface TranscriptMessage {
  type: 'transcript';
  text: string;
  isFinal: boolean;
}

interface ResponseMessage {
  type: 'response';
  text: string;
}

interface ErrorMessage {
  type: 'error';
  text?: string;
}

interface LegacyMessage {
  message: string;
  source: Role;
}

type ElevenLabsMessage = TranscriptMessage | ResponseMessage | ErrorMessage | LegacyMessage;

export function VoiceAgentPage() {
  const [language, setLanguage] = useState<Language>("english");
  const { isPremium } = useAuth();
  const [isTalking, setIsTalking] = useState<boolean>(false);
  const [sessionActive, setSessionActive] = useState<boolean>(false);
  const [callTime, setCallTime] = useState<number>(0);
  const [isTextOnly, setIsTextOnly] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");
  const [responses, setResponses] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const { 
    startSession, 
    endSession, 
    status, 
    isSpeaking,
    setVolume
  } = useConversation({
    onMessage: (message: OnMessageProps) => {
      // Cast to our union type for easier handling
      const msg = message as unknown as ElevenLabsMessage;
      
      // Handle legacy message format
      if ('message' in msg && 'source' in msg) {
        if (msg.source === 'user') {
          setTranscript(msg.message);
        } else if (msg.source === 'assistant' || msg.source === 'ai') {
          setResponses(prev => [...prev, msg.message]);
        }
        return;
      }
      
      // Handle new message format
      if ('type' in msg) {
        if (msg.type === 'transcript' && msg.isFinal && msg.text) {
          setTranscript(msg.text);
        } 
        
        if (msg.type === 'response' && msg.text) {
          // Add new response
          setResponses(prev => [...prev, msg.text]);
        }
        
        if (msg.type === 'error') {
          setErrorMessage("There was an error with the voice service. Please try again.");
          toast({
            title: "Voice Service Error",
            description: "There was an error with the voice agent. Please try again.",
            variant: "destructive"
          });
        }
      }
    },
    onConnect: () => {
      setSessionActive(true);
      setErrorMessage(null);
      toast({
        title: "Voice Agent Connected",
        description: "You can start speaking now.",
      });
    },
    onDisconnect: () => {
      setSessionActive(false);
      setIsTalking(false);
      resetTimer();
    },
    onError: (error) => {
      console.error("ElevenLabs conversation error:", error);
      setErrorMessage("There was an error connecting to the voice service. Please try again.");
      setSessionActive(false);
      resetTimer();
      toast({
        title: "Connection Error",
        description: "Failed to connect to the voice service. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Timer for call duration
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (sessionActive) {
      timer = setInterval(() => {
        setCallTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [sessionActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (status === 'connected') {
        endSession();
      }
    };
  }, [status, endSession]);

  const startConversation = async () => {
    setErrorMessage(null);
    setResponses([]);
    setTranscript("");
    setCallTime(0);
    setIsTalking(true);
    
    try {
      const elevenLabsAgentId = "UBrWV90gjXHjFCdjaYBK";
      
      await startSession({ 
        agentId: elevenLabsAgentId,
      });
      
      // Set volume to 100%
      setVolume({ volume: 1.0 });
      
    } catch (error) {
      console.error("Error starting conversation:", error);
      setErrorMessage("Failed to start the voice conversation. Please try again.");
      setIsTalking(false);
      toast({
        title: "Connection Error",
        description: "Failed to start the voice conversation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const stopConversation = async () => {
    try {
      await endSession();
      setIsTalking(false);
      resetTimer();
    } catch (error) {
      console.error("Error ending conversation:", error);
    }
  };

  const resetTimer = () => {
    setCallTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTextOnly = () => {
    setIsTextOnly(!isTextOnly);
  };

  return (
    <PageLayout
      title="Voice Agent"
      description="Interact with ancient wisdom through natural conversation"
    >
      <div className="space-y-6">
        <Alert variant="default" className="bg-amber-500/10 border border-amber-500/30 mb-6">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertDescription>
            Click the mic button to start a conversation with our AI voice agent powered by ElevenLabs.
            Simply speak naturally and the agent will respond to your questions about spiritual wisdom.
            <span className="ml-2 text-green-500 font-medium">(Premium Mode Enabled for Testing)</span>
          </AlertDescription>
        </Alert>

        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Select Language</span>
        </div>
        
        <div className="w-full max-w-xs mb-8">
          <LanguagePicker value={language} onValueChange={setLanguage} />
        </div>
        
        <div className="max-w-xl mx-auto w-full">
          <Card className="bg-[#1A1F2C] border-[#33C3F0]/30 text-white overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-[#1EAEDB] text-2xl font-normal flex items-center justify-between">
                ElevenLabs Voice Agent
                <span className="flex items-center text-gold text-sm">
                  <Volume2 className="h-4 w-4 mr-1" />
                  Voice Enabled
                </span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Have a natural conversation with our spiritual wisdom AI
              </CardDescription>
            </CardHeader>
          
            <CardContent className="p-6 pt-4 min-h-[400px] flex flex-col">
              {/* Visualization container */}
              {isTalking && (
                <div className="flex justify-center items-center mb-4">
                  <div className="h-48 w-48 relative">
                    <div className={`absolute inset-0 rounded-full flex items-center justify-center ${isSpeaking ? 'animate-pulse' : ''}`}>
                      <AudioVisualizer isActive={sessionActive} color={isSpeaking ? "#33C3F0" : "#1EAEDB"} />
                    </div>
                  </div>
                </div>
              )}
              
              <div className={`flex-1 ${isTalking ? 'mb-4 max-h-64 overflow-y-auto' : 'mb-4 overflow-y-auto'}`}>
                {/* Display user transcript */}
                {transcript && (
                  <div className="bg-blue-900/20 p-3 rounded-lg mb-3 max-w-[85%] ml-auto">
                    <p className="text-blue-100 text-sm">{transcript}</p>
                  </div>
                )}
                
                {/* Display AI responses */}
                {responses.map((response, index) => (
                  <div key={index} className="bg-purple-900/20 p-3 rounded-lg mb-3 max-w-[85%]">
                    <p className="text-purple-100 text-sm">{response}</p>
                  </div>
                ))}
                
                {errorMessage && (
                  <div className="bg-red-900/30 border border-red-800 p-3 rounded-lg text-center my-4">
                    <p className="text-red-200 text-sm">{errorMessage}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 border-red-400 text-red-200 hover:bg-red-900/50"
                      onClick={() => setErrorMessage(null)}
                    >
                      Dismiss
                    </Button>
                  </div>
                )}
                
                {!sessionActive && !isTalking && !errorMessage && responses.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="h-32 w-32 mb-4 relative">
                      <AudioVisualizer isActive={false} color="#33C3F0" />
                    </div>
                    <p className="text-[#33C3F0]/80 font-medium">Click the mic button to start a voice conversation</p>
                    <p className="text-gray-400 text-sm mt-2">Your AI assistant is ready to discuss spiritual wisdom</p>
                  </div>
                )}
              </div>
              
              {sessionActive && (
                <div className="text-center text-sm text-[#33C3F0]/80 my-2">
                  <div className="flex items-center justify-center gap-2">
                    <Phone className="h-3 w-3" />
                    <span>On call • {formatTime(callTime)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          
            <CardFooter className="border-t border-[#33C3F0]/20 p-4 flex justify-center">
              {!isTalking ? (
                <Button 
                  onClick={startConversation}
                  className="rounded-full h-14 w-14 bg-[#1EAEDB] hover:bg-[#33C3F0] text-white"
                >
                  <Mic className="h-6 w-6" />
                </Button>
              ) : (
                <div className="flex gap-4">
                  <Button
                    onClick={stopConversation}
                    className="rounded-full h-14 w-14 bg-red-500 hover:bg-red-600 text-white"
                    title="End conversation"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    className={`rounded-full h-14 w-14 border-[#33C3F0]/50 ${isTextOnly ? 'bg-[#33C3F0]/20' : ''} text-[#33C3F0] hover:bg-[#33C3F0]/10`}
                    onClick={toggleTextOnly}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 7V4h16v3"></path>
                      <path d="M9 20h6"></path>
                      <path d="M12 4v16"></path>
                    </svg>
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
