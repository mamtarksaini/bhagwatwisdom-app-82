
import React, { useState } from 'react';
import { PageLayout } from "@/components/layout/PageLayout";
import { ProblemSolver } from "@/components/features/ProblemSolver";
import { Language } from "@/types";
import { LanguagePicker } from "@/components/features/LanguagePicker";
import { useAuth } from "@/contexts/AuthContext";
import { Globe } from "lucide-react";

export function ProblemSolverPage() {
  const [language, setLanguage] = useState<Language>("english");
  const { isPremium } = useAuth();

  return (
    <PageLayout
      title="Problem Solver"
      description="Find solutions to your problems based on Bhagavad Gita teachings"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Select Language</span>
        </div>
        
        <div className="w-full max-w-xs mb-8">
          <LanguagePicker value={language} onValueChange={setLanguage} />
        </div>
        
        <ProblemSolver language={language} isPremium={isPremium} />
      </div>
    </PageLayout>
  );
}
