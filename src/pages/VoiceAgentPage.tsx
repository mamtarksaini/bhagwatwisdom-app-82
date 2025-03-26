
import React, { useState } from 'react';
import { PageLayout } from "@/components/layout/PageLayout";
import { VoiceAgent } from "@/components/features/problem-solver/VoiceAgent";
import { Language } from "@/types";
import { LanguagePicker } from "@/components/features/LanguagePicker";
import { useAuth } from "@/contexts/AuthContext";
import { Globe } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function VoiceAgentPage() {
  const [language, setLanguage] = useState<Language>("english");
  const { isPremium } = useAuth();

  return (
    <PageLayout
      title="Voice Agent"
      description="Interact with ancient wisdom through natural conversation"
    >
      <div className="space-y-6">
        <Alert variant="default" className="bg-amber-500/10 border border-amber-500/30 mb-6">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertDescription>
            Just click the mic button and start speaking. The AI will automatically respond after you pause speaking for 2 seconds.
            You can also click the mic-off button to manually stop and get a response immediately.
            Say "give me text" if you prefer text-only responses without audio.
            <span className="ml-2 text-green-500 font-medium">(Premium Mode Enabled for Testing)</span>
          </AlertDescription>
        </Alert>

        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Select Language</span>
        </div>
        
        <div className="w-full max-w-xs mb-8">
          <LanguagePicker value={language} onValueChange={setLanguage} />
        </div>
        
        <VoiceAgent language={language} />
      </div>
    </PageLayout>
  );
}
