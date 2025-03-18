
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Language } from "@/types";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface WisdomDisplayProps {
  solution: string;
  usingFallback: boolean;
  isPremium: boolean;
  language: Language;
  onRetry?: () => void;
  retryCount?: number;
}

export function WisdomDisplay({ 
  solution, 
  usingFallback, 
  isPremium,
  language,
  onRetry,
  retryCount = 0
}: WisdomDisplayProps) {
  return (
    <div className="space-y-4">
      {usingFallback && (
        <Alert variant="default" className="bg-amber-500/10 border border-amber-500/30">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertDescription>
            {language === 'hindi' 
              ? "हम वर्तमान में ऑफलाइन ज्ञान प्रदान कर रहे हैं। कृपया फिर से कोशिश करें।" 
              : "We're currently providing offline wisdom. Please retry for AI-powered insights."}
          </AlertDescription>
        </Alert>
      )}
      
      {isPremium && usingFallback && (
        <Alert variant="default" className="bg-blue-500/10 border border-blue-500/30">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertTitle>Note for premium users</AlertTitle>
          <AlertDescription>
            {language === 'hindi' 
              ? "सुपाबेस एज फंक्शन या जेमिनी AI API कुंजी की समस्या के कारण AI बुद्धि प्रदान नहीं कर सकते हैं। AI उत्तर के लिए पुनः प्रयास करें।" 
              : "We cannot provide AI wisdom due to a Supabase Edge Function or Gemini AI API key issue. Retry for AI response."}
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
                  ? "हम वर्तमान में ऑफलाइन ज्ञान प्रदान कर रहे हैं। AI उत्तर जल्द ही उपलब्ध होंगे।" 
                  : "We're currently providing offline wisdom. AI-powered responses will be available soon."}
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
