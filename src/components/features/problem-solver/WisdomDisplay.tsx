
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Language } from "@/types";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, Info, Wifi, WifiOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface WisdomDisplayProps {
  solution: string;
  usingFallback: boolean;
  isPremium: boolean;
  language: Language;
  onRetry?: () => void;
  retryCount?: number;
  networkError?: boolean;
}

export function WisdomDisplay({ 
  solution, 
  usingFallback, 
  isPremium,
  language,
  onRetry,
  retryCount = 0,
  networkError = false
}: WisdomDisplayProps) {
  return (
    <div className="space-y-4">
      {usingFallback && (
        <Alert variant="default" className="bg-amber-500/10 border border-amber-500/30">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertDescription>
            {language === 'hindi' 
              ? "अभी हम ऑफ़लाइन ज्ञान दिखा रहे हैं। AI उत्तर प्राप्त करने के लिए पुनः प्रयास करें।" 
              : "Currently showing offline wisdom. Please retry for AI-powered responses."}
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
              ? "एज फंक्शन से कनेक्ट करने में समस्या है। सुनिश्चित करें कि एज फंक्शन डिप्लॉय है।" 
              : "Unable to connect to Edge Function. Please ensure the Edge Function is deployed."}
          </AlertDescription>
        </Alert>
      )}
      
      {isPremium && usingFallback && (
        <Alert variant="default" className="bg-blue-500/10 border border-blue-500/30">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertTitle>API Setup Check</AlertTitle>
          <AlertDescription>
            {language === 'hindi' 
              ? "सुनिश्चित करें कि GEMINI_API_KEY सुपाबेस एज फंक्शन सीक्रेट्स में सही तरीके से कॉन्फ़िगर किया गया है और एज फंक्शन डिप्लॉय है।" 
              : "Ensure GEMINI_API_KEY is correctly configured in Supabase Edge Function Secrets and that the edge function is deployed."}
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
      
      {usingFallback && (
        <div className="text-sm text-muted-foreground">
          {isPremium ? (
            <div className="flex items-center justify-center px-4 py-2 rounded-md bg-amber-500/10 border border-amber-500/30">
              <p>
                {language === 'hindi' 
                  ? "एज फंक्शन कनेक्शन सुनिश्चित करें और GEMINI_API_KEY की जांच करें। पुनः प्रयास करें।" 
                  : "Verify edge function connection and check GEMINI_API_KEY. Try again."}
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p>
                {language === 'hindi' 
                  ? "प्रीमियम सदस्यता के साथ AI-उत्पन्न उत्तर प्राप्त करें" 
                  : "Get AI-generated responses with premium membership"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
