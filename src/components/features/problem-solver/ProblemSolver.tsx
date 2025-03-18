
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Language } from "@/types";
import { ProblemInput } from './ProblemInput';
import { WisdomDisplay } from './WisdomDisplay';
import { PremiumBanner } from './PremiumBanner';
import { useProblemSolver } from './useProblemSolver';

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
    handleReset,
    handleSubmit
  } = useProblemSolver(language, isPremium);

  return (
    <Card className="glass-card border border-gold/30">
      <CardHeader>
        <CardTitle className="text-gradient">Wisdom Guide</CardTitle>
        <CardDescription>Share your challenge and receive guidance from ancient Bhagavad Gita wisdom</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
          />
        )}
        
        {!isPremium && <PremiumBanner />}
      </CardContent>
    </Card>
  );
}
