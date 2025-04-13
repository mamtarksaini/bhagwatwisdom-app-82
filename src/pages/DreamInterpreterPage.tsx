
import React, { useState } from 'react';
import { PageLayout } from "@/components/layout/PageLayout";
import { DreamInterpreter } from "@/components/features/DreamInterpreter";
import { Language } from "@/types";
import { LanguagePicker } from "@/components/features/LanguagePicker";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Globe, Info } from "lucide-react";

export function DreamInterpreterPage() {
  const [language, setLanguage] = useState<Language>("english");
  const { isPremium } = useAuth();
  
  return (
    <PageLayout
      title="Dream Interpreter"
      description="Understand your dreams through the ancient wisdom of Bhagavad Gita"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Select Language</span>
        </div>
        
        <div className="w-full max-w-xs mb-8">
          <LanguagePicker value={language} onValueChange={setLanguage} />
        </div>
        
        <Alert variant="default" className="bg-amber-500/10 border border-amber-500/30 mb-6">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-700 dark:text-amber-400">
            AI Connectivity Status
          </AlertTitle>
          <AlertDescription>
            Currently, our AI wisdom services are experiencing some connectivity issues. We've improved the system to use multiple fallback methods to ensure you receive wisdom even if primary services are unavailable.
          </AlertDescription>
        </Alert>
        
        <Alert variant="default" className="bg-blue-500/10 border border-blue-500/30 mb-6">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription>
            If your initial dream interpretation doesn't connect to AI, you can use the "Retry with AI" option to attempt reconnection up to two additional times.
          </AlertDescription>
        </Alert>
        
        <DreamInterpreter language={language} isPremium={isPremium} />
      </div>
    </PageLayout>
  );
}
