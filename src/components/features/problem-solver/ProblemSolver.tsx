
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Language } from "@/types";
import { ProblemInput } from './ProblemInput';
import { WisdomDisplay } from './WisdomDisplay';
import { useProblemSolver } from './useProblemSolver';
import { AlertCircle, Info } from 'lucide-react';
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
      </CardContent>
    </Card>
  );
}
