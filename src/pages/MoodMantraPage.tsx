
import React, { useState, useEffect } from 'react';
import { PageLayout } from "@/components/layout/PageLayout";
import { MoodMantra } from "@/components/features/MoodMantra";
import { Language } from "@/types";
import { LanguagePicker } from "@/components/features/LanguagePicker";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Globe, Info } from "lucide-react";
import { useLocation } from "react-router-dom";

export function MoodMantraPage() {
  const [language, setLanguage] = useState<Language>("english");
  const { isPremium } = useAuth();
  const location = useLocation();
  const [showStatusAlert, setShowStatusAlert] = useState(true);

  // Hide the status alert after 15 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowStatusAlert(false);
    }, 15000);
    
    return () => clearTimeout(timer);
  }, []);

  // Get page title based on route
  const getPageTitle = () => {
    console.log("Current route for page title:", location.pathname);
    return location.pathname === "/mantras" ? "Mantras" : "Mood Mantra";
  };

  // Log the current route for debugging
  useEffect(() => {
    console.log("Current route:", location.pathname);
  }, [location.pathname]);

  return (
    <PageLayout
      title={getPageTitle()}
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
        
        {showStatusAlert && (
          <Alert variant="default" className="bg-gold/10 border border-gold/30 mb-6">
            <Info className="h-4 w-4 text-gold" />
            <AlertTitle>Authentic Vedic Mantras</AlertTitle>
            <AlertDescription>
              Our mantras are sourced from authentic Vedic texts including the Upanishads, Bhagavad Gita, and ancient Sanskrit traditions. 
              Each mantra has been verified for authenticity and includes its source text. Custom mood entries are matched to genuine mantras 
              rather than artificially generated.
            </AlertDescription>
          </Alert>
        )}
        
        <MoodMantra language={language} isPremium={isPremium} />
      </div>
    </PageLayout>
  );
}
