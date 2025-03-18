
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Language } from "@/types";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

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
