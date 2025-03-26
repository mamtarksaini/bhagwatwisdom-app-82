
import React, { useState } from 'react';
import { PageLayout } from "@/components/layout/PageLayout";
import { Language } from "@/types";
import { LanguagePicker } from "@/components/features/LanguagePicker";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Globe, RefreshCw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

// Sample affirmations
const affirmationsData = {
  english: [
    "I am at peace with my past and present, as taught in the Bhagavad Gita.",
    "My true self is eternal and unchanging, regardless of life's circumstances.",
    "I perform my duties with dedication, without attachment to results.",
    "I accept what I cannot change with equanimity.",
    "My worth is not determined by external achievements but by inner spiritual growth.",
    "I choose peace over reaction in challenging situations.",
    "I am connected to the divine source of all wisdom.",
    "My happiness comes from within, not from external possessions.",
    "I am guided by higher wisdom in all my actions.",
    "I embrace both joy and challenges as teachers on my path."
  ],
  hindi: [
    "मैं अपने अतीत और वर्तमान से शांति से जुड़ा हूँ, जैसा भगवद गीता में सिखाया गया है।",
    "मेरा वास्तविक स्वयं शाश्वत और अपरिवर्तनीय है, जीवन की परिस्थितियों से निरपेक्ष।",
    "मैं अपने कर्तव्यों को समर्पण के साथ निभाता हूँ, परिणामों से अनासक्त रहकर।",
    "मैं जो नहीं बदल सकता उसे समभाव से स्वीकार करता हूँ।",
    "मेरा मूल्य बाहरी उपलब्धियों से नहीं बल्कि आंतरिक आध्यात्मिक विकास से निर्धारित होता है।",
    "मैं चुनौतीपूर्ण स्थितियों में प्रतिक्रिया के बजाय शांति का चयन करता हूँ।",
    "मैं सभी ज्ञान के दिव्य स्रोत से जुड़ा हूँ।",
    "मेरी खुशी भीतर से आती है, बाहरी वस्तुओं से नहीं।",
    "मैं अपने सभी कार्यों में उच्च ज्ञान द्वारा निर्देशित हूँ।",
    "मैं आनंद और चुनौतियों दोनों को अपने मार्ग पर शिक्षकों के रूप में स्वीकार करता हूँ।"
  ]
};

export function AffirmationsPage() {
  const [language, setLanguage] = useState<Language>("english");
  const [currentAffirmation, setCurrentAffirmation] = useState(0);
  const [showAffirmation, setShowAffirmation] = useState(false);
  const { isPremium } = useAuth();
  
  const getRandomAffirmation = () => {
    const affirmations = affirmationsData[language] || affirmationsData.english;
    const randomIndex = Math.floor(Math.random() * affirmations.length);
    setCurrentAffirmation(randomIndex);
  };

  return (
    <PageLayout
      title="Daily Affirmations"
      description="Positive affirmations inspired by Bhagavad Gita teachings for your daily practice"
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
        
        {!showAffirmation ? (
          <div className="flex justify-center">
            <Button 
              onClick={() => setShowAffirmation(true)} 
              className="button-gradient flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Show Today's Affirmation
            </Button>
          </div>
        ) : (
          <Card className="glass-card border border-gold/30">
            <CardHeader>
              <CardTitle className="text-gradient">Daily Affirmation</CardTitle>
              <CardDescription>
                Repeat this affirmation throughout your day to cultivate positive mindset
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-spiritual dark:bg-gray-800/40 rounded-lg p-6 border border-spiritual-dark dark:border-gray-700">
                <blockquote className="text-xl md:text-2xl font-heading font-medium text-center">
                  "{(affirmationsData[language] || affirmationsData.english)[currentAffirmation]}"
                </blockquote>
              </div>
              
              <div className="flex justify-center gap-4">
                <Button 
                  onClick={getRandomAffirmation} 
                  className="button-gradient flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  New Affirmation
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setShowAffirmation(false)}
                >
                  Hide Affirmation
                </Button>
              </div>
              
              {!isPremium && (
                <div className="mt-4 bg-gold/10 dark:bg-gold/20 rounded-lg p-4 text-sm">
                  <p className="font-medium mb-1">Upgrade to Premium for enhanced affirmations:</p>
                  <ul className="list-disc pl-5 space-y-1 text-foreground/80">
                    <li>Personalized affirmations based on your spiritual needs</li>
                    <li>Daily affirmation notifications and reminders</li>
                    <li>Audio recordings to accompany your affirmation practice</li>
                    <li>Create custom affirmation collections for different aspects of life</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
