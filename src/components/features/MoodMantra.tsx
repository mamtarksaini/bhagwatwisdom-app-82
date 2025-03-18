
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Language } from "@/types";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { Volume2, VolumeX, Copy, RotateCcw, Send, Plus } from "lucide-react";
import { MOODS } from "@/utils/constants";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface MoodMantraProps {
  language: Language;
  isPremium?: boolean;
}

type MantraData = {
  text: string;
  meaning: string;
};

// Create a map of mantras for different moods
const mockMantras: Record<string, { [key: string]: MantraData }> = {
  "Calm": {
    english: {
      text: "Om Shanti Om",
      meaning: "I am peace, divine peace flows through me. This mantra aligns with the Bhagavad Gita's teaching from Chapter 2, Verse 71 about achieving peace by abandoning desires and living without longing."
    },
    hindi: {
      text: "ॐ शांति ॐ",
      meaning: "मैं शांति हूँ, दिव्य शांति मुझमें से बहती है। यह मंत्र भगवद गीता के अध्याय 2, श्लोक 71 के शिक्षा से मेल खाता है।"
    }
  },
  "Anxious": {
    english: {
      text: "Om Namah Shivaya",
      meaning: "I bow to the divine within. This powerful mantra helps calm anxious thoughts, reminding you of your divine nature beyond temporary worries."
    },
    hindi: {
      text: "ॐ नमः शिवाय",
      meaning: "मैं अपने भीतर के दिव्य को नमन करता हूँ। यह शक्तिशाली मंत्र चिंताग्रस्त विचारों को शांत करने में मदद करता है।"
    }
  },
  "Happy": {
    english: {
      text: "Om Anandham Paramanandham",
      meaning: "I am bliss, I am supreme bliss. This mantra celebrates your natural state of joy and inner happiness."
    },
    hindi: {
      text: "ॐ आनन्दम् परमानन्दम्",
      meaning: "मैं आनंद हूँ, मैं परम आनंद हूँ। यह मंत्र आपकी प्राकृतिक आनंद की स्थिति का जश्न मनाता है।"
    }
  },
  "Sad": {
    english: {
      text: "Om Sarvesham Svastir Bhavatu",
      meaning: "May all beings be happy and free from suffering. This mantra helps transform sadness through compassion."
    },
    hindi: {
      text: "ॐ सर्वेषां स्वस्तिर्भवतु",
      meaning: "सभी प्राणी सुखी और दुख से मुक्त हों। यह मंत्र करुणा के माध्यम से दुख को बदलने में मदद करता है।"
    }
  },
  "Confused": {
    english: {
      text: "Om Gam Ganapataye Namaha",
      meaning: "I bow to the remover of obstacles. This mantra helps clear confusion and brings clarity of thought."
    },
    hindi: {
      text: "ॐ गं गणपतये नमः",
      meaning: "मैं बाधाओं को दूर करने वाले को नमन करता हूं। यह मंत्र भ्रम को दूर करने और विचारों में स्पष्टता लाने में मदद करता है।"
    }
  },
  "Fearful": {
    english: {
      text: "Om Durgaya Namaha",
      meaning: "I bow to the divine power that protects from all difficulties. This mantra invokes courage and protection, reminding us that fear is temporary while our divine nature is eternal."
    },
    hindi: {
      text: "ॐ दुर्गायै नमः",
      meaning: "मैं सभी कठिनाइयों से रक्षा करने वाली दिव्य शक्ति को नमन करता हूं। यह मंत्र साहस और सुरक्षा का आह्वान करता है, हमें याद दिलाता है कि भय अस्थायी है जबकि हमारा दिव्य स्वभाव शाश्वत है।"
    }
  },
  "Grateful": {
    english: {
      text: "Om Sarva Mangala Mangalye",
      meaning: "I honor the source of all auspiciousness. This mantra helps cultivate deep gratitude by recognizing the divine blessings in every aspect of life, as taught in the Bhagavad Gita's lessons on contentment."
    },
    hindi: {
      text: "ॐ सर्व मंगल मांगल्ये",
      meaning: "मैं सभी शुभता के स्रोत का सम्मान करता हूं। यह मंत्र जीवन के हर पहलू में दिव्य आशीर्वाद को पहचानकर गहरी कृतज्ञता को विकसित करने में मदद करता है, जैसा कि भगवद गीता के संतोष के पाठों में सिखाया गया है।"
    }
  },
  "Peaceful": {
    english: {
      text: "Om Sahana Vavatu",
      meaning: "May we be protected together. This ancient peace mantra creates harmony within and around us, resonating with the Bhagavad Gita's teachings on inner tranquility despite external circumstances."
    },
    hindi: {
      text: "ॐ सहना वावतु",
      meaning: "हम एक साथ सुरक्षित रहें। यह प्राचीन शांति मंत्र हमारे भीतर और हमारे आसपास सद्भाव बनाता है, जो बाहरी परिस्थितियों के बावजूद भगवद गीता के आंतरिक शांति के शिक्षाओं के साथ गूंजता है।"
    }
  },
  "Energetic": {
    english: {
      text: "Om Hreem Sooryaya Namaha",
      meaning: "I bow to the divine sun energy. This powerful energizing mantra awakens our inner vitality and enthusiasm, connecting us to the cosmic energy that fuels all action as described in the Bhagavad Gita."
    },
    hindi: {
      text: "ॐ ह्रीं सूर्याय नमः",
      meaning: "मैं दिव्य सूर्य ऊर्जा को नमन करता हूं। यह शक्तिशाली ऊर्जावान मंत्र हमारी आंतरिक प्राणशक्ति और उत्साह को जगाता है, हमें उस कॉस्मिक ऊर्जा से जोड़ता है जो भगवद गीता में वर्णित सभी कार्यों को शक्ति प्रदान करती है।"
    }
  },
  "Motivated": {
    english: {
      text: "Om Vajra Pani Namaha",
      meaning: "Salutations to the divine force of determination. This motivational mantra ignites inner strength and resolve, reflecting the Bhagavad Gita's guidance on disciplined action and perseverance."
    },
    hindi: {
      text: "ॐ वज्र पाणि नमः",
      meaning: "दृढ़ संकल्प की दिव्य शक्ति को नमस्कार। यह प्रेरणादायक मंत्र आंतरिक शक्ति और दृढ़ संकल्प को प्रज्वलित करता है, जो भगवद गीता के अनुशासित कार्य और दृढ़ता पर मार्गदर्शन को दर्शाता है।"
    }
  }
};

export function MoodMantra({ language, isPremium = false }: MoodMantraProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [customMood, setCustomMood] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [mantra, setMantra] = useState<MantraData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { speak, stop, isReading } = useSpeechSynthesis(language);
  const { toast } = useToast();

  const handleSelectMood = (mood: string) => {
    setSelectedMood(mood);
    setMantra(null);
    setShowCustomInput(false);
    
    setIsLoading(true);
    
    setTimeout(() => {
      // Get mantra for selected mood, fallback to Calm if mood not found
      const moodMantras = mockMantras[mood] || mockMantras["Calm"];
      console.log(`Selected mood: ${mood}, Available mantras:`, Object.keys(mockMantras));
      
      const selectedMantra = moodMantras[language] || moodMantras.english;
      console.log(`Mantra for ${mood} in ${language}:`, selectedMantra);
      
      setMantra(selectedMantra);
      setIsLoading(false);
    }, 1000);
  };

  const handleShowCustomInput = () => {
    setSelectedMood(null);
    setMantra(null);
    setShowCustomInput(true);
    setCustomMood("");
  };

  const handleCustomMoodSubmit = async () => {
    if (!customMood.trim()) return;
    
    setIsLoading(true);
    setSelectedMood(customMood);
    
    try {
      // In a production app, you would use an AI service here
      // using the GEMINI_API_KEY from edge function
      // For now, we'll simulate an API call
      
      const prompt = `Generate a spiritual mantra based on the user's mood: "${customMood}". 
      Include both the mantra text and a meaning that references concepts from the Bhagavad Gita. 
      Keep the mantra short and memorable. 
      ${language === 'hindi' ? "Please provide the response in Hindi language." : ""}`;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a dynamic mantra based on custom mood
      const generatedMantra: MantraData = {
        text: language === 'hindi' 
          ? `ॐ ${customMood} शांति` 
          : `Om ${customMood} Shanti`,
        meaning: language === 'hindi'
          ? `इस मंत्र के माध्यम से, आप अपने भीतर के '${customMood}' भाव को स्वीकार करते हैं और उससे परे जाते हैं। भगवद गीता में कृष्ण सिखाते हैं कि सभी भावनाएँ अस्थायी हैं, लेकिन आत्मा शाश्वत है।`
          : `Through this mantra, you acknowledge and transcend the feeling of '${customMood}'. In the Bhagavad Gita, Krishna teaches that all emotions are temporary, but the soul is eternal.`
      };
      
      setMantra(generatedMantra);
      
    } catch (error) {
      console.error("Error generating custom mantra:", error);
      toast({
        title: "Error",
        description: "Could not generate a custom mantra. Please try again or select a predefined mood.",
        variant: "destructive"
      });
      
      // Fallback to calm mantra
      const fallbackMantra = mockMantras["Calm"][language] || mockMantras["Calm"].english;
      setMantra(fallbackMantra);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedMood(null);
    setMantra(null);
    setShowCustomInput(false);
    setCustomMood("");
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
          
          {!showCustomInput ? (
            <>
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
                <Button
                  variant="outline"
                  className="border-dashed hover:border-gold"
                  onClick={handleShowCustomInput}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Custom Mood
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter your mood..."
                  value={customMood}
                  onChange={(e) => setCustomMood(e.target.value)}
                  className="flex-grow"
                />
                <Button 
                  onClick={handleCustomMoodSubmit}
                  disabled={!customMood.trim() || isLoading}
                  className="button-gradient"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => setShowCustomInput(false)}
              >
                ← Back to preset moods
              </Button>
            </div>
          )}
          
          {(selectedMood || showCustomInput) && (
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
            Select your current mood or enter a custom mood to receive a personalized mantra
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
