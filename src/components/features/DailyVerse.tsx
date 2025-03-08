
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Verse, Language } from "@/types";
import { PLACEHOLDER_VERSE } from "@/utils/constants";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { Volume2, VolumeX, Copy, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DailyVerseProps {
  language: Language;
}

export function DailyVerse({ language }: DailyVerseProps) {
  const [verse, setVerse] = useState<Verse>(PLACEHOLDER_VERSE);
  const [isLoading, setIsLoading] = useState(false);
  const { speak, stop, isReading } = useSpeechSynthesis(language);
  const { toast } = useToast();

  useEffect(() => {
    // In a real app, this would fetch from an API
    // For now, we'll use the placeholder verse
    setIsLoading(true);
    setTimeout(() => {
      setVerse(PLACEHOLDER_VERSE);
      setIsLoading(false);
    }, 500);
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
