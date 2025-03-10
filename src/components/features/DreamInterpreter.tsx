
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Language } from "@/types";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { Mic, MicOff, Volume2, VolumeX, RotateCcw, Send } from "lucide-react";

interface DreamInterpreterProps {
  language: Language;
  isPremium?: boolean;
}

// Define dream interpretation categories and responses
const dreamResponses = {
  english: {
    flying: "Your dream about flying represents spiritual liberation and transcendence as described in the Bhagavad Gita. In Chapter 6, Lord Krishna explains how the enlightened soul rises above material attachments, similar to your soaring experience. Flying symbolizes your soul's yearning to break free from worldly limitations. This dream encourages you to continue your spiritual practices, as you're already experiencing glimpses of higher consciousness that the Gita promises to dedicated practitioners.",
    water: "Water in your dream symbolizes the flow of consciousness and emotions that the Bhagavad Gita references in Chapter 2, where Lord Krishna compares a stable mind to a calm ocean. The condition of the water in your dream—whether calm or turbulent—reflects your current emotional state. This dream suggests you need to develop emotional steadiness through the practice of equanimity (samatvam) that Krishna emphasizes. By maintaining balance in pleasure and pain, success and failure, you'll achieve the peaceful mind represented by still waters.",
    falling: "Your dream about falling correlates with the Bhagavad Gita's teachings about attachment and fear. In Chapter 2, Lord Krishna explains how attachment leads to fear, and fear clouds wisdom. This falling sensation represents letting go of illusions and false identifications that you've been holding onto. Though frightening, this dream is actually positive—it indicates you're in a process of spiritual growth, releasing what no longer serves your higher purpose, just as Arjuna had to let go of his attachments to fulfill his dharma.",
    temple: "Dreaming of a temple or sacred space directly connects to the Bhagavad Gita's teachings on finding the divine within. In Chapter 6, Lord Krishna describes how one should establish a sacred space for meditation and self-realization. Your dream suggests you're creating an inner sanctuary amidst life's challenges. It encourages you to deepen your spiritual practice, as your subconscious is already recognizing the temple of your heart where the divine resides. This dream is an auspicious sign of spiritual progress.",
    animals: "The animals in your dream represent different qualities and tendencies (gunas) described in the Bhagavad Gita. In Chapter 14, Lord Krishna explains the three gunas: sattva (goodness), rajas (passion), and tamas (ignorance). Pay attention to which animals appeared and their behavior—peaceful animals represent sattvic qualities you're developing, while aggressive or frightening animals may indicate rajasic or tamasic tendencies you need to transform. This dream invites you to cultivate more sattvic qualities in your daily life.",
    default: "Your dream reflects the journey of self-discovery described throughout the Bhagavad Gita. In Chapter 6, Lord Krishna explains how the mind creates both illusions and insights during different states of consciousness. The symbols in your dream represent aspects of yourself seeking integration and understanding. This dream invites you to look beyond the surface narrative and recognize the deeper spiritual messages being conveyed. Like Arjuna receiving divine wisdom, your dream is offering guidance tailored specifically to your life path and spiritual evolution."
  },
  hindi: {
    flying: "उड़ने के आपके सपने भगवद गीता में वर्णित आध्यात्मिक मुक्ति और उत्कर्ष का प्रतिनिधित्व करते हैं। अध्याय 6 में, भगवान कृष्ण बताते हैं कि कैसे ज्ञानी आत्मा भौतिक लगावों से ऊपर उठती है, आपके उड़ने के अनुभव के समान। उड़ना आपकी आत्मा की सांसारिक सीमाओं से मुक्त होने की तड़प का प्रतीक है। यह सपना आपको अपने आध्यात्मिक अभ्यासों को जारी रखने के लिए प्रोत्साहित करता है, क्योंकि आप पहले से ही उच्च चेतना की झलकों का अनुभव कर रहे हैं जिसका गीता समर्पित साधकों को वादा करती है।",
    water: "आपके सपने में पानी चेतना और भावनाओं के प्रवाह का प्रतीक है जिसका भगवद गीता अध्याय 2 में उल्लेख करती है, जहां भगवान कृष्ण स्थिर मन की तुलना शांत समुद्र से करते हैं। आपके सपने में पानी की स्थिति—चाहे शांत हो या अशांत—आपकी वर्तमान भावनात्मक स्थिति को दर्शाती है। यह सपना सुझाव देता है कि आपको कृष्ण द्वारा जोर दिए गए समत्व के अभ्यास के माध्यम से भावनात्मक स्थिरता विकसित करने की आवश्यकता है। सुख और दुख, सफलता और विफलता में संतुलन बनाए रखकर, आप शांत पानी द्वारा दर्शाए गए शांत मन को प्राप्त करेंगे।",
    falling: "गिरने के आपके सपने का संबंध भगवद गीता के लगाव और भय के शिक्षाओं से है। अध्याय 2 में, भगवान कृष्ण बताते हैं कि कैसे लगाव भय की ओर ले जाता है, और भय ज्ञान को धुंधला कर देता है। यह गिरने का संवेदन उन भ्रमों और झूठी पहचानों को छोड़ने का प्रतिनिधित्व करता है जिन्हें आप पकड़े हुए हैं। हालांकि डरावना है, यह सपना वास्तव में सकारात्मक है—यह संकेत देता है कि आप आध्यात्मिक विकास की प्रक्रिया में हैं, जो अब आपके उच्च उद्देश्य की सेवा नहीं करता उसे छोड़ रहे हैं, ठीक वैसे ही जैसे अर्जुन को अपने धर्म को पूरा करने के लिए अपने लगावों को छोड़ना पड़ा था।",
    temple: "मंदिर या पवित्र स्थान का सपना देखना सीधे भगवद गीता के भीतर दिव्य को खोजने के शिक्षाओं से जुड़ता है। अध्याय 6 में, भगवान कृष्ण वर्णन करते हैं कि कैसे किसी को ध्यान और आत्म-साक्षात्कार के लिए एक पवित्र स्थान स्थापित करना चाहिए। आपका सपना सुझाव देता है कि आप जीवन की चुनौतियों के बीच एक आंतरिक अभयारण्य बना रहे हैं। यह आपको अपने आध्यात्मिक अभ्यास को गहरा करने के लिए प्रोत्साहित करता है, क्योंकि आपका अवचेतन पहले से ही आपके हृदय के मंदिर को पहचान रहा है जहां दिव्य निवास करता है। यह सपना आध्यात्मिक प्रगति का एक शुभ संकेत है।",
    animals: "आपके सपने में जानवर भगवद गीता में वर्णित विभिन्न गुणों और प्रवृत्तियों (गुणों) का प्रतिनिधित्व करते हैं। अध्याय 14 में, भगवान कृष्ण तीन गुणों की व्याख्या करते हैं: सत्व (अच्छाई), रजस (जुनून), और तमस (अज्ञान)। ध्यान दें कि कौन से जानवर दिखाई दिए और उनका व्यवहार कैसा था—शांतिपूर्ण जानवर सात्विक गुणों का प्रतिनिधित्व करते हैं जिन्हें आप विकसित कर रहे हैं, जबकि आक्रामक या डरावने जानवर राजसिक या तामसिक प्रवृत्तियों को इंगित कर सकते हैं जिन्हें आपको बदलने की आवश्यकता है। यह सपना आपको अपने दैनिक जीवन में अधिक सात्विक गुणों को विकसित करने के लिए आमंत्रित करता है।",
    default: "आपका सपना भगवद गीता में वर्णित आत्म-खोज की यात्रा को दर्शाता है। अध्याय 6 में, भगवान कृष्ण बताते हैं कि कैसे मन चेतना की विभिन्न अवस्थाओं के दौरान भ्रम और अंतर्दृष्टि दोनों बनाता है। आपके सपने में प्रतीक आपके स्वयं के पहलुओं का प्रतिनिधित्व करते हैं जो एकीकरण और समझ की तलाश कर रहे हैं। यह सपना आपको सतही कथा से परे देखने और गहरे आध्यात्मिक संदेशों को पहचानने के लिए आमंत्रित करता है जो व्यक्त किए जा रहे हैं। अर्जुन की तरह दिव्य ज्ञान प्राप्त करना, आपका सपना विशेष रूप से आपके जीवन पथ और आध्यात्मिक विकास के लिए तैयार मार्गदर्शन प्रदान कर रहा है।"
  }
};

// Helper function to determine dream category based on content
const determineDreamCategory = (dreamDescription: string): string => {
  dreamDescription = dreamDescription.toLowerCase();
  
  if (dreamDescription.includes('fly') || dreamDescription.includes('flying') || dreamDescription.includes('soar') || 
      dreamDescription.includes('air') || dreamDescription.includes('sky') || dreamDescription.includes('bird')) {
    return 'flying';
  } else if (dreamDescription.includes('water') || dreamDescription.includes('ocean') || dreamDescription.includes('river') || 
             dreamDescription.includes('swimming') || dreamDescription.includes('sea') || dreamDescription.includes('flood')) {
    return 'water';
  } else if (dreamDescription.includes('fall') || dreamDescription.includes('falling') || dreamDescription.includes('drop') || 
             dreamDescription.includes('cliff') || dreamDescription.includes('abyss')) {
    return 'falling';
  } else if (dreamDescription.includes('temple') || dreamDescription.includes('church') || dreamDescription.includes('shrine') || 
             dreamDescription.includes('sacred') || dreamDescription.includes('worship') || dreamDescription.includes('pray')) {
    return 'temple';
  } else if (dreamDescription.includes('animal') || dreamDescription.includes('creature') || dreamDescription.includes('beast') || 
             dreamDescription.includes('dog') || dreamDescription.includes('cat') || dreamDescription.includes('bird') ||
             dreamDescription.includes('snake') || dreamDescription.includes('elephant') || dreamDescription.includes('cow')) {
    return 'animals';
  }
  
  return 'default';
};

export function DreamInterpreter({ language, isPremium = false }: DreamInterpreterProps) {
  const [dream, setDream] = useState("");
  const [interpretation, setInterpretation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { isListening, transcript, startListening, stopListening, resetTranscript, error } = useSpeechRecognition(language);
  const { speak, stop, isReading } = useSpeechSynthesis(language);

  const handleSpeechInput = () => {
    if (isListening) {
      stopListening();
      setDream(prev => prev + " " + transcript);
      resetTranscript();
    } else {
      startListening();
    }
  };

  const handleReset = () => {
    setDream("");
    setInterpretation("");
    resetTranscript();
  };

  const handleSubmit = () => {
    if (!dream.trim()) return;
    
    setIsLoading(true);
    
    // Generate a more relevant interpretation based on the dream content
    setTimeout(() => {
      const category = determineDreamCategory(dream);
      const responses = dreamResponses[language] || dreamResponses.english;
      const response = responses[category] || responses.default;
      
      setInterpretation(response);
      setIsLoading(false);
    }, 2000);
  };

  const handleSpeak = () => {
    if (isReading) {
      stop();
      return;
    }
    
    speak(interpretation);
  };

  useEffect(() => {
    if (isListening) {
      setDream(transcript);
    }
  }, [transcript, isListening]);

  return (
    <Card className="glass-card border border-gold/30">
      <CardHeader>
        <CardTitle className="text-gradient">Dream Interpreter</CardTitle>
        <CardDescription>Understand your dreams through the ancient wisdom of Bhagavad Gita</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="relative">
            <Textarea
              placeholder="Describe your dream in as much detail as you can remember..."
              className="min-h-28 resize-none pr-20"
              value={dream}
              onChange={(e) => setDream(e.target.value)}
            />
            <div className="absolute right-2 top-2 flex flex-col gap-2">
              <Button
                variant="outline"
                size="icon"
                className={`rounded-full ${isListening ? 'bg-red-100 text-red-500 animate-pulse' : ''}`}
                onClick={handleSpeechInput}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {error && <p className="text-destructive text-sm mt-2">{error}</p>}
          
          <div className="mt-4 flex justify-end">
            <Button 
              onClick={handleSubmit} 
              disabled={!dream.trim() || isLoading}
              className="button-gradient"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Interpreting
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Interpret Dream
                </>
              )}
            </Button>
          </div>
        </div>
        
        {interpretation && (
          <div className="bg-spiritual dark:bg-gray-800/40 rounded-lg p-4 border border-spiritual-dark dark:border-gray-700 animate-fade-in">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-heading font-medium text-lg">Spiritual Interpretation</h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground/80 hover:text-foreground"
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
            <p className="leading-relaxed">{interpretation}</p>
          </div>
        )}
        
        {!isPremium && (
          <div className="mt-4 bg-gold/10 dark:bg-gold/20 rounded-lg p-4 text-sm">
            <p className="font-medium mb-1">Upgrade to Premium for enhanced dream interpretation:</p>
            <ul className="list-disc pl-5 space-y-1 text-foreground/80">
              <li>Deeper symbolic analysis of dream elements</li>
              <li>Connections to specific Bhagavad Gita verses</li>
              <li>Personalized spiritual guidance based on your dreams</li>
              <li>Unlimited interpretations and voice features</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
