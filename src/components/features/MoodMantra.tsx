
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Language } from "@/types";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { Volume2, VolumeX, Copy, RotateCcw } from "lucide-react";
import { MOODS } from "@/utils/constants";
import { useToast } from "@/hooks/use-toast";

interface MoodMantraProps {
  language: Language;
  isPremium?: boolean;
}

export function MoodMantra({ language, isPremium = false }: MoodMantraProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [mantra, setMantra] = useState<{ text: string; meaning: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { speak, stop, isReading } = useSpeechSynthesis(language);
  const { toast } = useToast();

  const handleSelectMood = (mood: string) => {
    setSelectedMood(mood);
    setMantra(null);
    
    setIsLoading(true);
    
    // Mock API call for mantra
    setTimeout(() => {
      const mockMantras: Record<string, { [key: string]: { text: string; meaning: string } }> = {
        "Calm": {
          english: {
            text: "Om Shanti Om",
            meaning: "I am peace, divine peace flows through me. This mantra aligns with the Bhagavad Gita's teaching from Chapter 2, Verse 71 about achieving peace by abandoning desires and living without longing, free from possessiveness and ego."
          },
          hindi: {
            text: "ॐ शांति ॐ",
            meaning: "मैं शांति हूँ, दिव्य शांति मुझमें से बहती है। यह मंत्र भगवद गीता के अध्याय 2, श्लोक 71 के शिक्षा से मेल खाता है, जिसमें इच्छाओं को त्याग कर और लालसा के बिना, अपनत्व और अहंकार से मुक्त होकर शांति प्राप्त करने के बारे में बताया गया है।"
          }
        },
        "Anxious": {
          english: {
            text: "Om Namah Shivaya",
            meaning: "I bow to the divine within. This powerful mantra helps calm anxious thoughts, reminding you of your divine nature beyond temporary worries, aligning with the Gita's Chapter 6 teachings on meditation and controlling the mind."
          },
          hindi: {
            text: "ॐ नमः शिवाय",
            meaning: "मैं अपने भीतर के दिव्य को नमन करता हूँ। यह शक्तिशाली मंत्र चिंताग्रस्त विचारों को शांत करने में मदद करता है, आपको अस्थायी चिंताओं से परे आपके दिव्य स्वभाव की याद दिलाता है, गीता के अध्याय 6 के ध्यान और मन को नियंत्रित करने के शिक्षाओं के अनुरूप है।"
          }
        },
        "Happy": {
          english: {
            text: "Om Anandham Paramanandham",
            meaning: "I am bliss, I am supreme bliss. This mantra celebrates your natural state of joy, reflecting the Gita's teaching that true happiness comes from within, not external circumstances."
          },
          hindi: {
            text: "ॐ आनन्दम् परमानन्दम्",
            meaning: "मैं आनंद हूँ, मैं परम आनंद हूँ। यह मंत्र आपकी प्राकृतिक आनंद की स्थिति का जश्न मनाता है, गीता की शिक्षा को दर्शाता है कि सच्चा सुख बाहरी परिस्थितियों से नहीं, भीतर से आता है।"
          }
        }
      };
      
      // Get mantra for selected mood, fallback to English if language not available
      const moodMantras = mockMantras[selectedMood || "Calm"] || mockMantras["Calm"];
      const selectedMantra = moodMantras[language] || moodMantras.english;
      
      setMantra(selectedMantra);
      setIsLoading(false);
    }, 1000);
  };

  const handleReset = () => {
    setSelectedMood(null);
    setMantra(null);
  };

  const handleSpeak = () => {
    if (!mantra) return;
    
    if (isReading) {
      stop();
      return;
    }
    
    speak(`${mantra.text}. ${mantra.meaning}`);
  };

  const handleCopy = () => {
    if (!mantra) return;
    
    const textToCopy = `Mantra: ${mantra.text}\n\nMeaning: ${mantra.meaning}`;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "Mantra has been copied to your clipboard",
      });
    });
  };

  return (
    <Card className="glass-card border border-gold/30">
      <CardHeader>
        <CardTitle className="text-gradient">Mood Mantras</CardTitle>
        <CardDescription>Discover sacred mantras based on your current emotional state</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">How are you feeling today?</h3>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((mood) => (
              <Button
                key={mood}
                variant={selectedMood === mood ? "default" : "outline"}
                className={selectedMood === mood ? "bg-gold text-foreground hover:bg-gold-dark" : "hover:border-gold"}
                onClick={() => handleSelectMood(mood)}
              >
                {mood}
              </Button>
            ))}
          </div>
          
          {selectedMood && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="ghost"
                className="text-muted-foreground"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          )}
        </div>
        
        {isLoading && (
          <div className="flex items-center justify-center py-10">
            <svg className="animate-spin h-8 w-8 text-gold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
        
        {mantra && !isLoading && (
          <div className="bg-spiritual dark:bg-gray-800/40 rounded-lg p-4 border border-spiritual-dark dark:border-gray-700 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading font-medium text-lg">Your Personalized Mantra</h3>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-8 w-8"
                  onClick={handleCopy}
                >
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copy</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-8 w-8"
                  onClick={handleSpeak}
                >
                  {isReading ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                  <span className="sr-only">{isReading ? "Stop" : "Listen"}</span>
                </Button>
              </div>
            </div>
            
            <div className="text-center mb-4">
              <blockquote className="font-heading text-2xl md:text-3xl font-semibold text-gradient">
                {mantra.text}
              </blockquote>
            </div>
            
            <div className="mt-4 pt-4 border-t border-border">
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Meaning & Significance:</h4>
              <p className="text-foreground/90">{mantra.meaning}</p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-border">
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Practice Guide:</h4>
              <p className="text-foreground/90">
                Repeat this mantra 108 times with focused attention, or for at least 5-10 minutes. As you recite it, 
                breathe deeply and allow the vibration of the sounds to resonate throughout your body, bringing your 
                mind to a state of calm and clarity.
              </p>
            </div>
          </div>
        )}
        
        {!isPremium && !isLoading && !mantra && (
          <div className="mt-8 text-center text-muted-foreground">
            Select your current mood to receive a personalized mantra
          </div>
        )}
        
        {!isPremium && (
          <div className="mt-4 bg-gold/10 dark:bg-gold/20 rounded-lg p-4 text-sm">
            <p className="font-medium mb-1">Upgrade to Premium for enhanced mantra features:</p>
            <ul className="list-disc pl-5 space-y-1 text-foreground/80">
              <li>Access to over 100+ ancient Vedic mantras</li>
              <li>Personalized mantras with pronunciation guides</li>
              <li>Guided meditation audio with your mantras</li>
              <li>Create custom mantra playlists for different moods</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
