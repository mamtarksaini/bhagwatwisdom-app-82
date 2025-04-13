
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Language } from "@/types";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { Mic, MicOff, Volume2, VolumeX, RotateCcw, Send, RefreshCw } from "lucide-react";
import { getWisdomResponse } from "@/lib/wisdom";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info } from 'lucide-react';

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
  const [retryCount, setRetryCount] = useState(0);
  const [directApiUsed, setDirectApiUsed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [errorDetails, setErrorDetails] = useState("");
  
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
    setDirectApiUsed(false);
    setErrorDetails("");
    setRetryCount(0);
  };

  const handleRetry = async () => {
    if (!dream.trim() || isLoading) return;
    
    setRetryCount(prev => prev + 1);
    setIsLoading(true);
    setInterpretation("");
    setUsingFallback(false);
    setNetworkError(false);
    setApiKeyError(false);
    setDirectApiUsed(false);
    setErrorDetails("");
    
    toast({
      title: "Retrying AI connection",
      description: "Attempting to connect to wisdom services again.",
      variant: "default"
    });
    
    try {
      await handleSubmitInternal(true);
    } catch (error) {
      console.error("Retry failed:", error);
      toast({
        title: "Retry failed",
        description: "Unable to connect to any wisdom service. Using offline guidance.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitInternal = async (isRetry = false) => {
    try {
      const dreamPrompt = `Interpret this dream through the lens of Bhagavad Gita and spiritual wisdom in a formal, respectful tone: "${dream}"
      
      ${language === 'hindi' ? "Important: Please use formal, respectful Hindi language. Avoid casual expressions like 'यार'. Maintain a tone appropriate for spiritual guidance." : ""}
      
      Provide an interpretation that is:
      1. Respectful and dignified in tone
      2. Spiritually insightful
      3. Connects to authentic Bhagavad Gita teachings when appropriate
      4. Offers practical wisdom without casual language`;
      
      console.log('Calling getWisdomResponse with dream prompt:', dreamPrompt.substring(0, 50) + '...');
      const response = await getWisdomResponse('spirituality', language, dreamPrompt);
      console.log('Response from getWisdomResponse:', response);
      
      setInterpretation(response.answer);
      setUsingFallback(response.isFallback || false);
      setNetworkError(response.isNetworkIssue || false);
      setApiKeyError(response.isApiKeyIssue || false);
      setDirectApiUsed(response.isDirectApiUsed || false);
      setErrorDetails(response.errorDetails || "");
      
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
      setErrorDetails(error instanceof Error ? error.message : String(error));
      
      toast({
        title: "Interpretation Error",
        description: "Could not connect to AI service. Using offline interpretation.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async () => {
    if (!dream.trim() || isLoading) return;
    
    setIsLoading(true);
    setInterpretation("");
    setUsingFallback(false);
    setNetworkError(false);
    setApiKeyError(false);
    setDirectApiUsed(false);
    setErrorDetails("");
    
    const loadingToast = toast({
      title: "Interpreting your dream",
      description: "Finding spiritual meaning in your dream...",
      variant: "default"
    });
    
    console.log('Submitting dream:', { dream, language });
    
    try {
      await handleSubmitInternal();
    } finally {
      loadingToast.dismiss();
      setIsLoading(false);
    }
  };

  const handleSpeak = () => {
    if (isReading) {
      // When stopping speech, don't show any error messages
      stop();
      return;
    }
    
    speak(interpretation);
  };
  
  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  useEffect(() => {
    if (isListening) {
      setDream(transcript);
    }
  }, [transcript, isListening]);

  return (
    <Card className="glass-card border border-gold/30">
      <CardContent className="space-y-6 pt-6">
        {networkError && !isLoading && (
          <Alert variant="default" className="bg-amber-500/10 border border-amber-500/30">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertDescription>
              {language === 'hindi' 
                ? "एज फंक्शन कनेक्शन में समस्या। प्रश्न उत्तर के लिए अतिरिक्त विकल्पों का उपयोग किया जा रहा है।" 
                : "Edge Function connection issues. Using alternative methods for responses."}
            </AlertDescription>
          </Alert>
        )}
        
        {apiKeyError && !isLoading && (
          <Alert variant="destructive" className="bg-red-500/10 border border-red-500/30">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {language === 'hindi' 
                ? "API कुंजी समस्या" 
                : "API Key Issue"}
            </AlertTitle>
            <AlertDescription>
              {language === 'hindi' 
                ? "API कुंजी के साथ समस्या। वैकल्पिक ज्ञान दिखा रहे हैं।" 
                : "Issues with API key. Showing alternative wisdom."}
            </AlertDescription>
          </Alert>
        )}
        
        {directApiUsed && !isLoading && !usingFallback && (
          <Alert variant="default" className="bg-green-500/10 border border-green-500/30">
            <Info className="h-4 w-4 text-green-500" />
            <AlertDescription>
              {language === 'hindi' 
                ? "AI द्वारा संचालित ज्ञान आपके लिए उपलब्ध है।" 
                : "AI-powered wisdom is available for you."}
            </AlertDescription>
          </Alert>
        )}
        
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
            
            {(networkError || apiKeyError) && retryCount < 2 && (
              <div className="mt-4 flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRetry}
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
