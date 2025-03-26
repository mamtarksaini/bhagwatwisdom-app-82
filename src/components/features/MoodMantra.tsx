import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Language } from "@/types";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { Volume2, VolumeX, Copy, RotateCcw, Send, Plus } from "lucide-react";
import { MOODS } from "@/utils/constants";
import { useToast } from "@/hooks/use-toast";

interface MoodMantraProps {
  language: Language;
  isPremium?: boolean;
}

type MantraData = {
  text: string;
  meaning: string;
  source?: string;
};

const authenticMantras: Record<string, { [key: string]: MantraData }> = {
  "Calm": {
    english: {
      text: "Om Shanti Shanti Shanti",
      meaning: "This ancient peace mantra invokes peace at three levels: body, mind, and spirit. From the Upanishads, it helps establish deep tranquility within oneself regardless of external circumstances.",
      source: "Upanishads"
    },
    hindi: {
      text: "ॐ शांति शांति शांति",
      meaning: "यह प्राचीन शांति मंत्र तीन स्तरों पर शांति का आह्वान करता है: शरीर, मन और आत्मा। उपनिषदों से, यह बाहरी परिस्थितियों के बावजूद अपने भीतर गहरी शांति स्थापित करने में मदद करता है।",
      source: "उपनिषद"
    }
  },
  "Anxious": {
    english: {
      text: "Om Namah Shivaya",
      meaning: "This five-syllable mantra (panchakshari) from the Yajurveda is dedicated to Lord Shiva, the destroyer of ignorance and ego. Reciting it helps release fear and anxiety by surrendering to the divine consciousness within.",
      source: "Yajurveda and Shiva Purana"
    },
    hindi: {
      text: "ॐ नमः शिवाय",
      meaning: "यह पांच अक्षरों का मंत्र (पंचाक्षरी) यजुर्वेद से है जो भगवान शिव को समर्पित है, जो अज्ञान और अहंकार के विनाशक हैं। इसका जाप भीतर के दिव्य चेतना को समर्पित होकर भय और चिंता को मुक्त करने में मदद करता है।",
      source: "यजुर्वेद और शिव पुराण"
    }
  },
  "Happy": {
    english: {
      text: "Om Anandham Paramanandham",
      meaning: "From the Upanishads, this mantra celebrates divine bliss. It acknowledges that true joy is our natural state of being, rather than something to seek externally. The mantra helps amplify feelings of happiness by connecting to this eternal inner bliss.",
      source: "Taittiriya Upanishad"
    },
    hindi: {
      text: "ॐ आनन्दम् परमानन्दम्",
      meaning: "उपनिषदों से, यह मंत्र दिव्य आनंद का जश्न मनाता है। यह स्वीकार करता है कि वास्तविक आनंद हमारी प्राकृतिक अवस्था है, बजाय इसके क�� बाहर से कुछ खोजा जाए। यह मंत्र इस शाश्वत आंतरिक आनंद से जुड़कर खुशी की भावनाओं को बढ़ाने में मदद करता है।",
      source: "तैत्तिरीय उपनिषद"
    }
  },
  "Sad": {
    english: {
      text: "Om Trayambakam Yajamahe",
      meaning: "This verse from the Rig Veda (known as Maha Mrityunjaya Mantra) is dedicated to Lord Shiva as the healer. It's considered one of the most powerful mantras for relieving suffering and sadness. It invokes healing energy, supports emotional recovery, and gradually transforms sorrow into inner strength.",
      source: "Rig Veda"
    },
    hindi: {
      text: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्",
      meaning: "ऋग्वेद से यह श्लोक (महामृत्युंजय मंत्र के रूप में जाना जाता है) चिकित्सक के रूप में भगवान शिव को समर्पित है। इसे पीड़ा और दुःख को दूर करने के लिए सबसे शक्तिशाली मंत्रों में से एक माना जाता है। यह उपचार ऊर्जा का आह्वान करता है, भावनात्मक पुनर्प्राप्ति का समर्थन करता है, और धीरे-धीरे दुःख को आंतरिक शक्ति में बदल देता है।",
      source: "ऋग्वेद"
    }
  },
  "Confused": {
    english: {
      text: "Om Gam Ganapataye Namaha",
      meaning: "This Vedic mantra is dedicated to Lord Ganesha, the remover of obstacles and lord of wisdom. It helps clear mental confusion and brings clarity of thought. The mantra activates the root chakra, grounding your energy and enabling better decision-making.",
      source: "Ganapati Upanishad"
    },
    hindi: {
      text: "ॐ गं गणपतये नमः",
      meaning: "यह वैदिक मंत्र भगवान गणेश को समर्पित है, जो बाधाओं को दूर करने वाले और ज्ञान के स्वामी हैं। यह मानसिक भ्रम को दूर करने और विचारों में स्पष्टता लाने में मदद करता है। मंत्र मूलाधार चक्र को सक्रिय करता है, आपकी ऊर्जा को स्थापित करता है और बेहतर निर्णय लेने में सक्षम बनाता है।",
      source: "गणपति उपनिषद"
    }
  },
  "Fearful": {
    english: {
      text: "Om Sarva Abhaya Pradata Namaha",
      meaning: "This mantra invokes the divine quality of fearlessness (abhaya). From the Vishnu Sahasranama, it reminds us that our true nature is beyond fear. Regular practice helps dissolve anxiety and cultivates inner courage even in challenging situations.",
      source: "Vishnu Sahasranama"
    },
    hindi: {
      text: "ॐ सर्व अभय प्रदाता नमः",
      meaning: "यह मंत्र निर्भयता (अभय) के दिव्य गुण का आह्वान करता है। विष्णु सहस्रनाम से, यह हमें याद दिलाता है कि हमारा वास्तविक स्वभाव भय से परे है। नियमित अभ्यास चिंता को दूर करने और चुनौतीपूर्ण स्थितियों में भी आंतरिक साहस को विकसित करने में मदद करता है।",
      source: "विष्णु सहस्रनाम"
    }
  },
  "Grateful": {
    english: {
      text: "Om Purnam Adah Purnam Idam",
      meaning: "This mantra from the Brihadaranyaka Upanishad celebrates the completeness of existence. It helps cultivate deep gratitude by recognizing that even when parts are taken from wholeness, wholeness remains. It reminds us of the abundance that surrounds us always.",
      source: "Brihadaranyaka Upanishad"
    },
    hindi: {
      text: "ॐ पूर्णमदः पूर्णमिदम्",
      meaning: "बृहदारण्यक उपनिषद से यह मंत्र अस्तित्व की पूर्णता का जश्न मनाता है। यह इस बात को पहचानकर गहरी कृतज्ञता विकसित करने में मदद करता है कि पूर्णता से भागों को निकालने पर भी पूर्णता बनी रहती है। यह हमें हमेशा हमारे चारों ओर मौजूद प्रचुरता की याद दिलाता है।",
      source: "बृहदारण्यक उपनिषद"
    }
  },
  "Peaceful": {
    english: {
      text: "Om Sahana Vavatu",
      meaning: "This peace mantra from the Upanishads is traditionally recited by teachers and students. It creates harmony within relationships and communities, asking for protection, nourishment of intellect, and peaceful resolution of conflicts.",
      source: "Taittiriya Upanishad"
    },
    hindi: {
      text: "ॐ सहना वावतु",
      meaning: "उपनिषदों से यह शांति मंत्र परंपरागत रूप से शिक्षकों और छात्रों द्वारा जपा जाता है। यह रिश्तों और समुदायों के भीतर सद्भाव बनाता है, सुरक्षा, बुद्धि के पोषण और संघर्षों के शांतिपूर्ण समाधान के लिए कहता है।",
      source: "तैत्तिरीय उपनिषद"
    }
  },
  "Energetic": {
    english: {
      text: "Om Surya Namaha",
      meaning: "This Vedic solar mantra honors the sun deity, the cosmic source of vitality and energy. From the Aditya Hridayam in the Ramayana, reciting it helps awaken inner dynamism, clarity, and enthusiasm. It's traditionally chanted in the morning to align with solar energy.",
      source: "Aditya Hridayam, Ramayana"
    },
    hindi: {
      text: "ॐ सूर्य नमः",
      meaning: "यह वैदिक सौर मंत्र सूर्य देवता, जीवन शक्ति और ऊर्जा के ब्रह्मांडीय स्रोत का सम्मान करता है। रामायण में आदित्य हृदयम से, इसका जाप आंतरिक गतिशीलता, स्पष्टता और उत्साह को जगाने में मदद करता है। इसे परंपरागत रूप से सुबह के समय सौर ऊर्जा के साथ जुड़ने के लिए जपा जाता है।",
      source: "आदित्य हृदयम, रामायण"
    }
  },
  "Motivated": {
    english: {
      text: "Om Kleem Saraswataye Namaha",
      meaning: "This mantra invokes Goddess Saraswati, the deity of knowledge, creativity, and motivation. It helps remove mental obstacles that prevent focused action. Regular practice enhances willpower, mental clarity, and the drive to pursue your goals with determination.",
      source: "Devi Mahatmya"
    },
    hindi: {
      text: "ॐ क्लीं सरस्वत्यै नमः",
      meaning: "यह मंत्र देवी सरस्वती, ज्ञान, रचनात्मकता और प्रेरणा की देवी का आह्वान करता है। यह केंद्रित कार्रवाई को रोकने वाली मानसिक बाधाओं को दूर करने में मदद करता है। नियमित अभ्यास इच्छाशक्ति, मानसिक स्पष्टता और दृढ़ संकल्प के साथ अपने लक्ष्यों को प्राप्त करने की प्रेरणा को बढ़ाता है।",
      source: "देवी माहात्म्य"
    }
  },
  "Crying": {
    english: {
      text: "Om Dukha Haraaya Namaha",
      meaning: "This compassionate mantra from the Vishnu Sahasranama addresses deep sadness. It invokes the divine aspect that relieves suffering by reminding us that pain is temporary, while our true nature is eternal. The Bhagavad Gita (2:14) teaches that sensations of pleasure and pain are transient - they come and go. By reciting this mantra, we acknowledge our grief while gradually transcending it.",
      source: "Vishnu Sahasranama, Bhagavad Gita"
    },
    hindi: {
      text: "ॐ दुःख हराय नमः",
      meaning: "विष्णु सहस्रनाम से यह करुणामय मंत्र गहरे दुःख को संबोधित करता है। यह दिव्य पहलू का आह्वान करता है जो हमें याद दिलाता है कि पीड़ा अस्थायी है, जबकि हमारा वास्तविक स्वभाव शाश्वत है। भगवद गीता (2:14) सिखाती है कि सुख और दुःख की अनुभूतियां क्षणिक हैं - वे आती और जाती हैं। इस मंत्र का जाप करके, हम अपने दुःख को स्वीकार करते हुए धीरे-धीरे उससे ऊपर उठते हैं।",
      source: "विष्णु सहस्रनाम, भगवद गीता"
    }
  },
  "Grief": {
    english: {
      text: "Om Shanti Om Trayambakam",
      meaning: "This composite mantra combines the peace mantra (Om Shanti) with the first line of the healing Maha Mrityunjaya Mantra. From the Rig Veda, it specifically addresses grief and loss. The Bhagavad Gita teaches that the soul is eternal (2:20), helping us find peace amidst grief. This mantra gently guides transformation of sorrow while honoring the healing process.",
      source: "Rig Veda, Bhagavad Gita"
    },
    hindi: {
      text: "ॐ शांति ॐ त्र्यम्बकम्",
      meaning: "यह संयुक्त मंत्र शांति मंत्र (ॐ शांति) को उपचार महामृत्युंजय मंत्र की पहली पंक्ति के साथ जोड़ता है। ऋग्वेद से, यह विशेष रूप से शोक और हानि को संबोधित करता है। भगवद गीता सिखाती है कि आत्मा शाश्वत है (2:20), जो हमें शोक के बीच शांति पाने में मदद करती है। यह मंत्र उपचार प्रक्रिया का सम्मान करते हुए धीरे-धीरे दुःख के परिवर्तन का मार्गदर्शन करता है।",
      source: "ऋग्वेद, भगवद गीता"
    }
  }
};

const emotionalKeywordMap: Record<string, string> = {
  "sad": "Sad",
  "crying": "Crying",
  "tearful": "Crying",
  "depressed": "Sad",
  "unhappy": "Sad",
  "miserable": "Sad",
  "sorrow": "Sad",
  "weeping": "Crying",
  "tears": "Crying",
  "grief": "Grief",
  "heartbroken": "Grief",
  "melancholy": "Sad",
  "cry": "Crying",
  "feeling to cry": "Crying",
  "want to cry": "Crying",
  "feel like crying": "Crying",
  
  "happy": "Happy",
  "joyful": "Happy",
  "excited": "Happy",
  "elated": "Happy",
  "cheerful": "Happy",
  "content": "Happy",
  "upbeat": "Happy",
  
  "anxious": "Anxious",
  "worried": "Anxious",
  "nervous": "Anxious",
  "stressed": "Anxious",
  "tense": "Anxious",
  "afraid": "Fearful",
  "scared": "Fearful",
  "fearful": "Fearful",
  "terrified": "Fearful",
  
  "peaceful": "Peaceful",
  "calm": "Calm",
  "relaxed": "Calm",
  "serene": "Calm",
  "tranquil": "Peaceful",
  "quiet": "Peaceful",
  
  "confused": "Confused",
  "uncertain": "Confused",
  "lost": "Confused",
  "grateful": "Grateful",
  "thankful": "Grateful",
  "appreciative": "Grateful",
  "motivated": "Motivated",
  "inspired": "Motivated",
  "driven": "Motivated",
  "energetic": "Energetic",
  "energized": "Energetic",
  "active": "Energetic",
  "vigorous": "Energetic"
};

export function MoodMantra({ language, isPremium = false }: MoodMantraProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [customMood, setCustomMood] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [mantra, setMantra] = useState<MantraData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { speak, stop, isReading } = useSpeechSynthesis(language);
  const { toast } = useToast();

  const findBestMatchingMantra = (inputMood: string): [string, MantraData] => {
    const normalizedInput = inputMood.toLowerCase().trim();
    
    if (emotionalKeywordMap[normalizedInput]) {
      const mappedMood = emotionalKeywordMap[normalizedInput];
      const mantras = authenticMantras[mappedMood] || authenticMantras["Sad"];
      return [mappedMood, mantras[language] || mantras.english];
    }
    
    for (const [keyword, mood] of Object.entries(emotionalKeywordMap)) {
      if (normalizedInput.includes(keyword) || keyword.includes(normalizedInput)) {
        const mantras = authenticMantras[mood] || authenticMantras["Sad"];
        return [mood, mantras[language] || mantras.english];
      }
    }
    
    const negativeKeywords = ["sad", "bad", "down", "low", "negative", "hurt", "pain", "cry", "tear"];
    for (const keyword of negativeKeywords) {
      if (normalizedInput.includes(keyword)) {
        const mantras = authenticMantras["Sad"] || authenticMantras["Crying"];
        return ["Sad", mantras[language] || mantras.english];
      }
    }
    
    const defaultMantras = authenticMantras["Calm"];
    return ["Calm", defaultMantras[language] || defaultMantras.english];
  };

  const handleSelectMood = (mood: string) => {
    setSelectedMood(mood);
    setMantra(null);
    setShowCustomInput(false);
    
    setIsLoading(true);
    
    setTimeout(() => {
      const moodMantras = authenticMantras[mood] || authenticMantras["Calm"];
      console.log(`Selected mood: ${mood}, Available mantras:`, Object.keys(authenticMantras));
      
      const selectedMantra = moodMantras[language] || moodMantras.english;
      console.log(`Mantra for ${mood} in ${language}:`, selectedMantra);
      
      setMantra(selectedMantra);
      setIsLoading(false);
    }, 800);
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
    
    try {
      const [mappedMood, matchedMantra] = findBestMatchingMantra(customMood);
      
      console.log(`Custom mood "${customMood}" mapped to "${mappedMood}"`);
      setSelectedMood(mappedMood);
      
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      setMantra(matchedMantra);
    } catch (error) {
      console.error("Error finding mantra for custom mood:", error);
      toast({
        title: "Error",
        description: "Could not find appropriate mantra. Please try again or select a predefined mood.",
        variant: "destructive"
      });
      
      const fallbackMantra = authenticMantras["Calm"][language] || authenticMantras["Calm"].english;
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
    
    const textToCopy = `Mantra: ${mantra.text}\n\nMeaning: ${mantra.meaning}${mantra.source ? `\n\nSource: ${mantra.source}` : ''}`;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "Mantra has been copied to your clipboard",
      });
    });
  };

  return (
    <Card className="glass-card border border-gold/30">
      <CardContent className="space-y-6 pt-6">
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
            
            {mantra.source && (
              <div className="mt-4 pt-4 border-t border-border">
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Source:</h4>
                <p className="text-foreground/90">{mantra.source}</p>
              </div>
            )}
            
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
