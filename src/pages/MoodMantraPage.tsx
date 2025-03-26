
import React, { useState } from 'react';
import { PageLayout } from "@/components/layout/PageLayout";
import { MoodMantra } from "@/components/features/MoodMantra";
import { Language } from "@/types";
import { LanguagePicker } from "@/components/features/LanguagePicker";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Globe } from "lucide-react";

export function MoodMantraPage() {
  const [language, setLanguage] = useState<Language>("english");
  const { isPremium } = useAuth();

  return (
    <PageLayout
      title="Mood Mantra"
      description="Discover sacred mantras based on your current emotional state"
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
          <AlertDescription>
            Currently, our AI wisdom services are experiencing some connectivity issues. We're working to restore full functionality. You'll still receive wisdom, but some responses may be from our offline database rather than AI-generated content.
          </AlertDescription>
        </Alert>
        
        <MoodMantra language={language} isPremium={isPremium} />
      </div>
    </PageLayout>
  );
}
