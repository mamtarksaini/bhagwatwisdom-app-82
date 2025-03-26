
import React, { useState } from 'react';
import { PageLayout } from "@/components/layout/PageLayout";
import { VoiceAgent } from "@/components/features/problem-solver/VoiceAgent";
import { Language } from "@/types";
import { LanguagePicker } from "@/components/features/LanguagePicker";
import { useAuth } from "@/contexts/AuthContext";
import { Globe } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// ElevenLabs agent ID
const ELEVEN_LABS_AGENT_ID = "UBrWV90gjXHjFCdjaYBK";

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
            Click the mic button and start speaking. The AI will respond to your voice automatically.
            You can end the conversation at any time by clicking the X button.
            <span className="ml-2 text-green-500 font-medium">(Using ElevenLabs Voice Agent)</span>
          </AlertDescription>
        </Alert>

        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Select Language</span>
        </div>
        
        <div className="w-full max-w-xs mb-8">
          <LanguagePicker value={language} onValueChange={setLanguage} />
        </div>
        
        <VoiceAgent 
          language={language} 
          elevenLabsAgentId={ELEVEN_LABS_AGENT_ID}
        />
      </div>
    </PageLayout>
  );
}
