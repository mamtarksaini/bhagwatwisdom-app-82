
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Language } from "@/types";
import { ProblemInput } from './ProblemInput';
import { WisdomDisplay } from './WisdomDisplay';
import { PremiumBanner } from './PremiumBanner';
import { useProblemSolver } from './useProblemSolver';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ProblemSolverProps {
  language: Language;
  isPremium?: boolean;
}

export function ProblemSolver({ language, isPremium = false }: ProblemSolverProps) {
  const {
    problem,
    setProblem,
    solution,
    isLoading,
    usingFallback,
    networkError,
    handleReset,
    handleSubmit,
    handleRetry,
    retryCount,
    directApiUsed,
    aiServiceUnavailable,
    errorDetails
  } = useProblemSolver(language, isPremium);

  return (
    <Card className="glass-card border border-gold/30">
      <CardHeader>
        <CardTitle className="text-gradient">Wisdom Guide</CardTitle>
        <CardDescription>Share your challenge and receive guidance from ancient Bhagavad Gita wisdom</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
        
        {aiServiceUnavailable && !isLoading && (
          <Alert variant="destructive" className="bg-red-500/10 border border-red-500/30">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {language === 'hindi' 
                ? "API कुंजी समस्या" 
                : "API Key Issue"}
            </AlertTitle>
            <AlertDescription>
              {language === 'hindi' 
                ? "कृपया Supabase Edge Function सीक्रेट्स में GEMINI_API_KEY की जांच करें।" 
                : "Please check GEMINI_API_KEY in Supabase Edge Function secrets."}
            </AlertDescription>
          </Alert>
        )}
        
        {directApiUsed && !isLoading && (
          <Alert variant="default" className="bg-blue-500/10 border border-blue-500/30">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <AlertDescription>
              {language === 'hindi' 
                ? "सीधे API कनेक्शन का उपयोग कर रहे हैं। मुख्य सेवा उपलब्ध नहीं है।" 
                : "Using direct API connection. Primary service unavailable."}
            </AlertDescription>
          </Alert>
        )}

        <ProblemInput
          problem={problem}
          setProblem={setProblem}
          onSubmit={handleSubmit}
          onReset={handleReset}
          isLoading={isLoading}
          language={language}
        />
        
        {solution && (
          <WisdomDisplay
            solution={solution}
            usingFallback={usingFallback}
            isPremium={isPremium}
            language={language}
            onRetry={handleRetry}
            retryCount={retryCount}
            networkError={networkError}
            directApiUsed={directApiUsed}
            aiServiceUnavailable={aiServiceUnavailable}
            errorDetails={errorDetails}
          />
        )}
        
        {!isPremium && <PremiumBanner />}
      </CardContent>
    </Card>
  );
}
