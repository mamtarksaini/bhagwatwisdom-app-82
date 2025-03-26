
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Volume2, VolumeX, Crown, X, AlertCircle } from "lucide-react";
import { Language } from "@/types";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { callGeminiDirectly } from "@/lib/wisdom/geminiApi";
import { canUseVoiceAgent, getRemainingFreeResponses, incrementVoiceAgentUsage } from "@/lib/wisdom/voiceAgent";
import { AudioVisualizer } from "./AudioVisualizer";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [useTextOnly, setUseTextOnly] = useState(false);
  const [callTime, setCallTime] = useState(0);
  const [speechInitFailed, setSpeechInitFailed] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showTextResponse, setShowTextResponse] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTranscriptRef = useRef<string>("");
  const silenceThreshold = 2000; // 2 seconds of silence will trigger processing
  
  const speechRecognition = useSpeechRecognition(language);
  const speechSynthesis = useSpeechSynthesis(language);
  
  useEffect(() => {
    if (speechRecognition.isListening) {
      setUserInput(speechRecognition.transcript);
      
      // If we have a transcript, reset the silence timer
      if (speechRecognition.transcript !== lastTranscriptRef.current) {
        lastTranscriptRef.current = speechRecognition.transcript;
        
        // Clear any existing silence timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
        
        // Set a new silence timer
        if (speechRecognition.transcript.trim()) {
          silenceTimerRef.current = setTimeout(() => {
            // Only auto-stop if we have some content and we're still listening
            if (speechRecognition.isListening && speechRecognition.transcript.trim()) {
              stopListening();
            }
          }, silenceThreshold);
        }
      }
    }
  }, [speechRecognition.transcript, speechRecognition.isListening]);

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      speechSynthesis.stop();
      speechRecognition.stopListening();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [speechSynthesis, speechRecognition]);

  // Timer effect for "call" duration
  useEffect(() => {
    if (isListening || isProcessing || speechSynthesis.isReading) {
      // Start or continue timer
      if (!timerRef.current) {
        const startTime = Date.now() - callTime * 1000; // Account for existing time
        timerRef.current = setInterval(() => {
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          setCallTime(elapsed);
        }, 1000);
      }
    } else {
      // Stop timer
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
  }, [isListening, isProcessing, speechSynthesis.isReading, callTime]);

  // Check for speech synthesis support and capability on initial load
  useEffect(() => {
    // Detect if speech synthesis is properly working
    const checkSpeechSupport = () => {
      try {
        if (!speechSynthesis.isSpeechSupported) {
          console.warn("Speech synthesis not supported in this browser");
          setUseTextOnly(true);
          setSpeechInitFailed(true);
          setShowTextResponse(true);
          return;
        }
        
        // If supported but no voices, speech might not work well
        if (speechSynthesis.voices.length === 0) {
          console.warn("No voices available for speech synthesis");
          setUseTextOnly(true);
          setSpeechInitFailed(true);
          setShowTextResponse(true);
        }
      } catch (error) {
        console.error("Error checking speech synthesis support:", error);
        setUseTextOnly(true);
        setSpeechInitFailed(true);
        setShowTextResponse(true);
      }
    };
    
    // Short delay to give voices time to load
    const timer = setTimeout(checkSpeechSupport, 2000);
    return () => clearTimeout(timer);
  }, [speechSynthesis.isSpeechSupported, speechSynthesis.voices]);
  
  const startListening = () => {
    // Reset any previous errors
    setApiError(null);
    
    // In testing mode, we always allow listening without restrictions
    setIsListening(true);
    speechRecognition.startListening();
    toast({
      title: "Listening",
      description: "Speak now. I'm listening... I'll process after you pause speaking.",
    });
    
    // Reset refs
    lastTranscriptRef.current = "";
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };
  
  const stopListening = async () => {
    // Clear silence timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
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
    
    // Reset any previous errors
    setApiError(null);
    
    // In testing mode, we always allow voice requests without restrictions
    setIsProcessing(true);
    setAiResponse("");
    
    try {
      // Check if user specifically requested text-only mode
      if (input.toLowerCase().includes("give me text") || 
          input.toLowerCase().includes("text only") || 
          input.toLowerCase().includes("show text") ||
          speechInitFailed) {
        setUseTextOnly(true);
        setShowTextResponse(true);
      }
      
      const prompt = `You are a helpful assistant responding to voice input. 
                    Please provide a concise response to the following question or statement. 
                    Keep your answer under 100 words for better voice synthesis.
                    User input: ${input}
                    ${language === 'hindi' ? 'Please respond in Hindi.' : 'Please respond in English.'}`;
      
      toast({
        title: "Processing",
        description: "Connecting to AI services...",
      });
      
      const response = await callGeminiDirectly(prompt);
      
      if (response) {
        setAiResponse(response);
        setRetryCount(0); // Reset retry count on success
        
        // Only trigger speech if not in text-only mode
        if (!useTextOnly && speechSynthesis.isSpeechSupported && !speechInitFailed) {
          // Auto-play the response using speech synthesis
          setTimeout(() => {
            try {
              speechSynthesis.speak(response);
              
              // Always show text response as a fallback after a short delay
              setTimeout(() => {
                setShowTextResponse(true);
              }, 1000);
              
            } catch (error) {
              console.error("Error speaking response:", error);
              // If speech fails, show the text version
              setUseTextOnly(true);
              setShowTextResponse(true);
              toast({
                title: "Speech Error",
                description: "Voice output failed. Showing text response instead.",
                variant: "destructive"
              });
            }
          }, 500);
        } else {
          // If we're in text-only mode (either by user choice or as a fallback)
          setUseTextOnly(true);
          setShowTextResponse(true);
        }
      } else {
        // Handle API failure with retry logic
        if (retryCount < 2) {
          // Try again with a short delay
          setRetryCount(prevCount => prevCount + 1);
          toast({
            title: "Retrying",
            description: "Connection issue detected. Trying again...",
          });
          
          setTimeout(() => {
            handleSendVoiceRequest(input);
          }, 1500);
          return;
        }
        
        setApiError("Failed to get response from AI. Please try again.");
        toast({
          title: "Error",
          description: "Failed to get response from AI. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Voice agent error:", error);
      setApiError("Failed to process your request. Please try again.");
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
      // Always show text when playing speech
      setShowTextResponse(true);
      
      try {
        // Only attempt to play speech if not already in text-only mode due to errors
        if (!speechInitFailed) {
          setUseTextOnly(false); // Reset text-only mode when manually playing speech
          speechSynthesis.speak(aiResponse);
        } else {
          toast({
            title: "Speech Not Available", 
            description: "Speech synthesis is not available in your browser. Using text-only mode.",
            variant: "destructive"
          });
        }
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
    speechSynthesis.stop();
    speechRecognition.stopListening();
    setIsListening(false);
    setCallTime(0);
    setApiError(null);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };
  
  const retryRequest = () => {
    setApiError(null);
    if (userInput) {
      handleSendVoiceRequest(userInput);
    } else {
      toast({
        title: "No Input",
        description: "Please speak first to send a request.",
      });
    }
  };
  
  const toggleTextDisplay = () => {
    setShowTextResponse(!showTextResponse);
  };
  
  return (
    <div className="max-w-xl mx-auto w-full">
      <Card className="bg-[#1A1F2C] border-[#33C3F0]/30 text-white overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-[#1EAEDB] text-2xl font-normal flex items-center justify-between">
            AI Assistant
            <span className="flex items-center text-gold text-sm">
              <Crown className="h-4 w-4 mr-1" />
              Premium Mode (Testing)
            </span>
          </CardTitle>
          {speechInitFailed && (
            <Alert variant="destructive" className="bg-amber-500/10 border border-amber-500/50 mt-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-xs">
                Voice output not available in your browser. Using text-only mode.
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
      
        <CardContent className="p-6 pt-4 min-h-[400px] flex flex-col items-center justify-center">
          <div className="w-full h-[300px] flex items-center justify-center relative">
            <div className="relative h-56 w-56">
              <div className={`absolute inset-0 rounded-full ${isListening || isProcessing || speechSynthesis.isReading ? 'border-2 border-[#1EAEDB] animate-pulse' : ''}`}>
                <AudioVisualizer isActive={isListening || isProcessing || speechSynthesis.isReading} color="#1EAEDB" />
              </div>
            </div>
            
            {isListening && (
              <div className="absolute bottom-0 w-full text-center">
                <p className="text-white/80 mb-2">{userInput || "Listening..."}</p>
              </div>
            )}
            
            {aiResponse && !isListening && (
              <div className="absolute bottom-0 w-full text-center max-h-48 overflow-y-auto">
                <p className={`text-white/90 mb-2 ${showTextResponse ? 'block' : 'hidden'}`}>
                  {aiResponse}
                </p>
                {aiResponse && !showTextResponse && !speechSynthesis.isReading && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 text-[#33C3F0]/80 border-[#33C3F0]/30 hover:bg-[#33C3F0]/10"
                    onClick={toggleTextDisplay}
                  >
                    Show Text Response
                  </Button>
                )}
              </div>
            )}
            
            {apiError && !isProcessing && !isListening && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-red-900/80 text-white p-4 rounded-lg max-w-[80%] text-center">
                  <div className="flex items-center justify-center mb-2">
                    <svg className="w-6 h-6 text-red-300 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" strokeWidth="2" />
                      <path strokeLinecap="round" strokeWidth="2" d="M12 8v4M12 16h.01" />
                    </svg>
                    <span className="font-medium">Error</span>
                  </div>
                  <p>{apiError}</p>
                  <div className="flex justify-center gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-300 text-red-300 hover:bg-red-800/50"
                      onClick={() => setApiError(null)}
                    >
                      Dismiss
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-green-300 text-green-300 hover:bg-green-800/50"
                      onClick={retryRequest}
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="w-full text-center mt-2">
            <p className="text-[#1EAEDB]/80 text-sm">
              {(isListening || isProcessing || speechSynthesis.isReading) && 
                `On call with AI Assistant • ${formatTime(callTime)}`}
            </p>
            {speechInitFailed && !isListening && !isProcessing && !speechSynthesis.isReading && (
              <p className="text-amber-400/80 text-xs mt-1">
                Speech synthesis unavailable. Using text-only mode.
              </p>
            )}
          </div>
        </CardContent>
      
        <div className="border-t border-[#33C3F0]/20">
          <div className="flex items-center justify-center p-4 gap-2">
            {!isListening ? (
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
              >
                <MicOff className="h-6 w-6" />
              </Button>
            )}
            
            {aiResponse && !speechInitFailed && (
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
            
            {/* Text toggle button */}
            {aiResponse && (
              <Button
                variant="outline"
                className={`rounded-full h-12 w-12 border-[#33C3F0]/50 text-[#33C3F0] hover:bg-[#33C3F0]/10 ${showTextResponse ? 'bg-[#33C3F0]/20' : ''}`}
                onClick={toggleTextDisplay}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 7V4h16v3"></path>
                  <path d="M9 20h6"></path>
                  <path d="M12 4v16"></path>
                </svg>
              </Button>
            )}
            
            {(isListening || isProcessing || speechSynthesis.isReading) && (
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
            Premium Mode Enabled for Testing
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
