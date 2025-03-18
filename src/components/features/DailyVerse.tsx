
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Verse, Language } from "@/types";
import { PLACEHOLDER_VERSE } from "@/utils/constants";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { Volume2, VolumeX, Copy, Share2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DailyVerseProps {
  language: Language;
}

// Collection of verses to show
const VERSES: Verse[] = [
  PLACEHOLDER_VERSE,
  {
    chapter: 2,
    verse: 47,
    text: {
      english: "You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions. Never consider yourself to be the cause of the results of your activities, nor be attached to inaction.",
      hindi: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥"
    },
    meaning: {
      english: "Focus on doing your duty without being attached to the outcomes. This verse teaches us to act with devotion and without expectation, which leads to inner peace and spiritual growth.",
      hindi: "आपको अपने कर्तव्यों का पालन करने का अधिकार है, लेकिन उनके फलों पर नहीं। कभी भी अपने को अपने कार्यों के परिणामों का कारण मत समझो, और न ही अकर्म से जुड़े रहो।"
    }
  },
  {
    chapter: 18,
    verse: 66,
    text: {
      english: "Abandon all varieties of religion and just surrender unto Me. I shall deliver you from all sinful reactions. Do not fear.",
      hindi: "सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज। अहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः॥"
    },
    meaning: {
      english: "This profound verse asks us to surrender completely to the divine, letting go of all other religious formalities. It promises spiritual liberation and freedom from worry through complete surrender.",
      hindi: "सभी धर्मों को त्यागकर केवल मेरी शरण में आओ। मैं तुम्हें समस्त पापों से मुक्त कर दूंगा, तुम शोक मत करो।"
    }
  },
  {
    chapter: 4,
    verse: 7,
    text: {
      english: "Whenever and wherever there is a decline in righteousness and an increase in unrighteousness, at that time I manifest myself.",
      hindi: "यदा यदा हि धर्मस्य ग्लानिर्भवति भारत। अभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्॥"
    },
    meaning: {
      english: "This verse explains the divine incarnation process. It assures us that whenever evil dominates and goodness fades in society, the divine will appear to restore balance and protect the righteous.",
      hindi: "हे भारत, जब-जब धर्म की हानि और अधर्म की वृद्धि होती है, तब-तब मैं स्वयं को प्रकट करता हूँ।"
    }
  },
  {
    chapter: 7,
    verse: 8,
    text: {
      english: "I am the taste of water, the light of the sun and the moon, the syllable Om in the Vedic mantras; I am the sound in ether and ability in man.",
      hindi: "रसोऽहमप्सु कौन्तेय प्रभास्मि शशिसूर्ययोः। प्रणवः सर्ववेदेषु शब्दः खे पौरुषं नृषु॥"
    },
    meaning: {
      english: "This verse reveals the divine presence in all elements of nature and human abilities. It shows that the divine is not distant but exists within every aspect of creation.",
      hindi: "हे कुंतीपुत्र, मैं जल का स्वाद हूँ, सूर्य और चंद्रमा का प्रकाश हूँ, समस्त वेदों में प्रणव (ॐ) हूँ, आकाश में शब्द और मनुष्यों में पौरुष (सामर्थ्य) हूँ।"
    }
  },
  {
    chapter: 12,
    verse: 13,
    text: {
      english: "One who is not envious but is a kind friend to all living entities, who does not think himself a proprietor and is free from false ego, who is equal in both happiness and distress, who is tolerant, always satisfied, self-controlled, and engaged in devotional service with determination, his mind and intelligence fixed on Me—such a devotee of Mine is very dear to Me.",
      hindi: "अद्वेष्टा सर्वभूतानां मैत्रः करुण एव च। निर्ममो निरहङ्कारः समदुःखसुखः क्षमी॥"
    },
    meaning: {
      english: "This verse describes the qualities of a true devotee who is dear to the divine. It emphasizes compassion, humility, equanimity, and selflessness as essential spiritual qualities.",
      hindi: "जो प्राणी मात्र से द्वेष नहीं रखता, सबका मित्र और करुणामय है, ममता-रहित, अहंकार-रहित, सुख-दुःख में समान और क्षमाशील है, वह भक्त मुझे प्रिय है।"
    }
  }
];

export function DailyVerse({ language }: DailyVerseProps) {
  const [verse, setVerse] = useState<Verse>(VERSES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const { speak, stop, isReading } = useSpeechSynthesis(language);
  const { toast } = useToast();

  // Function to get a random verse
  const getRandomVerse = () => {
    setIsLoading(true);
    
    // Get a random verse that's different from the current one
    let newVerseIndex: number;
    do {
      newVerseIndex = Math.floor(Math.random() * VERSES.length);
    } while (VERSES.length > 1 && VERSES[newVerseIndex].chapter === verse.chapter && 
             VERSES[newVerseIndex].verse === verse.verse);
    
    setTimeout(() => {
      setVerse(VERSES[newVerseIndex]);
      setIsLoading(false);
    }, 800);
  };

  useEffect(() => {
    // Get a random verse on first load
    getRandomVerse();
    // Set up a timer to change the verse every 24 hours
    const timer = setInterval(getRandomVerse, 24 * 60 * 60 * 1000);
    
    return () => clearInterval(timer);
  }, []);

  const handleSpeak = () => {
    if (isReading) {
      stop();
      return;
    }
    
    // Get the text in the current language or fall back to English
    const textToSpeak = verse.text[language] || verse.text.english || "";
    const meaningToSpeak = verse.meaning[language] || verse.meaning.english || "";
    
    speak(`${textToSpeak}. ${meaningToSpeak}`);
  };

  const handleCopy = () => {
    const textToCopy = `Bhagavad Gita, Chapter ${verse.chapter}, Verse ${verse.verse}:\n${verse.text[language] || verse.text.english}\n\nMeaning:\n${verse.meaning[language] || verse.meaning.english}`;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        title: "Copied to clipboard",
        description: "Verse has been copied to your clipboard",
      });
    });
  };

  const handleShare = async () => {
    const shareText = `Bhagavad Gita, Chapter ${verse.chapter}, Verse ${verse.verse}: "${verse.text[language] || verse.text.english}"`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Daily Wisdom from Bhagavad Gita',
          text: shareText,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to copy
      handleCopy();
    }
  };

  const handleRefresh = () => {
    getRandomVerse();
  };

  return (
    <Card className="glass-card overflow-hidden border border-gold/30 transform transition-all duration-500 hover:shadow-glow">
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="bg-gold/10 dark:bg-gold/20 px-3 py-1 rounded-full text-xs font-medium text-foreground/80">
            Daily Verse
          </div>
          <div className="text-sm text-muted-foreground">
            Chapter {verse.chapter}, Verse {verse.verse}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4 py-6">
            <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-muted rounded animate-pulse w-full"></div>
            <div className="h-4 bg-muted rounded animate-pulse w-2/3"></div>
            <div className="h-4 bg-muted rounded animate-pulse w-5/6"></div>
          </div>
        ) : (
          <>
            <blockquote className="font-heading text-xl md:text-2xl italic font-medium text-foreground leading-relaxed">
              {verse.text[language] || verse.text.english}
            </blockquote>
            
            <div className="pt-2">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Meaning:</h3>
              <p className="text-foreground/90">
                {verse.meaning[language] || verse.meaning.english}
              </p>
            </div>
          </>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="transition-all-200 text-foreground/80 hover:text-foreground"
              onClick={handleSpeak}
            >
              {isReading ? (
                <VolumeX className="h-4 w-4 mr-2" />
              ) : (
                <Volume2 className="h-4 w-4 mr-2" />
              )}
              {isReading ? "Stop" : "Listen"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="transition-all-200 text-foreground/80 hover:text-foreground"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
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
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
              <span className="sr-only">Share</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
