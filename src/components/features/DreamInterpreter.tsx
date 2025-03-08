import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Language } from "@/types";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { Mic, MicOff, Volume2, VolumeX, RotateCcw, Send } from "lucide-react";

interface DreamInterpreterProps {
  language: Language;
  isPremium?: boolean;
}

export function DreamInterpreter({ language, isPremium = false }: DreamInterpreterProps) {
  const [dream, setDream] = useState("");
  const [interpretation, setInterpretation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
  };

  const handleSubmit = () => {
    if (!dream.trim()) return;
    
    setIsLoading(true);
    
    // Mock API call for interpretation
    setTimeout(() => {
      // This would be an actual API response in production
      const mockInterpretations = {
        english: "Your dream about flying above mountains reflects your spiritual aspirations and desire to transcend worldly attachments. In the Bhagavad Gita, Lord Krishna describes how the enlightened soul rises above material desires, just as you soared in your dream. The mountains symbolize the challenges you're facing, but your ability to fly over them suggests you possess the inner strength to overcome these obstacles. This dream encourages you to maintain your spiritual practice and trust in divine guidance. Like Arjuna, you are being called to embrace your higher purpose and follow your dharma with courage.",
        hindi: "पहाड़ों के ऊपर उड़ने के आपके सपने आपकी आध्यात्मिक आकांक्षाओं और सांसारिक लगावों को पार करने की इच्छा को दर्शाते हैं। भगवद गीता में, भगवान कृष्ण वर्णन करते हैं कि कैसे ज्ञानी आत्मा भौतिक इच्छाओं से ऊपर उठती है, ठीक वैसे ही जैसे आप अपने सपने में उड़े थे। पहाड़ उन चुनौतियों का प्रतीक हैं जिनका आप सामना कर रहे हैं, लेकिन उनके ऊपर उड़ने की आपकी क्षमता बताती है कि आपके पास इन बाधाओं को पार करने की आंतरिक शक्ति है। यह सपना आपको आपकी आध्यात्मिक साधना जारी रखने और दिव्य मार्गदर्शन में विश्वास करने के लिए प्रोत्साहित करता है। अर्जुन की तरह, आपको अपने उच्च उद्देश्य को अपनाने और साहस के साथ अपने धर्म का पालन करने के लिए बुलाया जा रहा है।"
      };
      
      setInterpretation(mockInterpretations[language] || mockInterpretations.english);
      setIsLoading(false);
    }, 2000);
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
              <h3 className="font-heading font-medium text-lg">Spiritual Interpretation</h3>
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
