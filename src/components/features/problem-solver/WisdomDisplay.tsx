
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Language } from "@/types";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, Info, Wifi, WifiOff, Key } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  errorDetails = ""
}: WisdomDisplayProps) {
  return (
    <div className="space-y-4">
      {usingFallback && !aiServiceUnavailable && !networkError && (
        <Alert variant="default" className="bg-amber-500/10 border border-amber-500/30">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertDescription>
            {language === 'hindi' 
              ? "अभी हम ऑफ़लाइन ज्ञान दिखा रहे हैं। AI उत्तर प्राप्त करने के लिए पुनः प्रयास करें।" 
              : "Currently showing offline wisdom. Please retry for AI-powered responses."}
          </AlertDescription>
        </Alert>
      )}
      
      {aiServiceUnavailable && (
        <Alert variant="destructive" className="bg-red-500/10 border border-red-500/30">
          <Key className="h-4 w-4" />
          <AlertTitle>
            {language === 'hindi' 
              ? "API कुंजी समस्या" 
              : "API Key Issue"}
          </AlertTitle>
          <AlertDescription>
            {language === 'hindi' 
              ? "API कुंजी के साथ समस्या। वैकल्पिक ज्ञान दिखा रहे हैं।" 
              : "Issues with API key. Showing alternative wisdom."}
            {isPremium && errorDetails && (
              <div className="mt-2 text-xs opacity-80 bg-red-500/5 p-2 rounded">
                {errorDetails}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {networkError && (
        <Alert variant="destructive" className="bg-red-500/10 border border-red-500/30">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>
            {language === 'hindi' 
              ? "नेटवर्क कनेक्शन समस्या" 
              : "Network Connection Issue"}
          </AlertTitle>
          <AlertDescription>
            {language === 'hindi' 
              ? "ज्ञान सेवाओं से कनेक्ट करने में समस्या है। वैकल्पिक ज्ञान दिखा रहे हैं।" 
              : "Unable to connect to wisdom services. Showing alternative wisdom."}
          </AlertDescription>
        </Alert>
      )}
      
      {directApiUsed && !usingFallback && (
        <Alert variant="default" className="bg-green-500/10 border border-green-500/30">
          <Wifi className="h-4 w-4 text-green-500" />
          <AlertTitle>
            {language === 'hindi' 
              ? "AI ज्ञान उपलब्ध" 
              : "AI Wisdom Available"}
          </AlertTitle>
          <AlertDescription>
            {language === 'hindi' 
              ? "AI द्वारा उत्पन्न ज्ञान आपके लिए उपलब्ध है।" 
              : "AI-generated wisdom is available for you."}
          </AlertDescription>
        </Alert>
      )}
      
      <Card className="border border-gold/30 bg-card/80 backdrop-blur">
        <CardContent className="pt-6">
          <div className="prose dark:prose-invert">
            {solution.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          
          {usingFallback && onRetry && (
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={onRetry}
                disabled={retryCount >= 3}
              >
                <RefreshCw className="h-4 w-4" />
                {retryCount >= 3 ? 'Max retries reached' : 'Try AI wisdom'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
