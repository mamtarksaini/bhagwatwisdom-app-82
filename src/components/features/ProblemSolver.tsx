
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Language } from "@/types";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { Mic, MicOff, Volume2, VolumeX, RotateCcw, Send } from "lucide-react";

interface ProblemSolverProps {
  language: Language;
  isPremium?: boolean;
}

// Define a more comprehensive set of sample problem categories and responses
const wisdomResponses = {
  english: {
    relationships: "The Bhagavad Gita teaches us that true relationships are based on selfless love and understanding. In Chapter 12, Lord Krishna explains that devotion and compassion are the foundations of meaningful connections. Your relationship challenges may stem from attachment to outcomes rather than appreciating the present moment. Practice seeing the divine in others, forgive past hurts, and approach your relationships with patience. Remember that we are all spiritual beings on a journey, and treating others with respect and understanding will strengthen your bonds.",
    career: "According to the Bhagavad Gita, work done with detachment and as an offering to the divine brings true fulfillment. In Chapter 3, Krishna explains the importance of doing your duty (dharma) without being attached to results. Your career concerns should be approached with dedication to excellence while letting go of anxiety about outcomes. Focus on contributing your skills with integrity and view your work as service. Success will follow naturally when you align your career with your authentic purpose and values.",
    health: "The Gita teaches that the body is a temple for the soul and must be maintained with balance. In Chapter 6, Lord Krishna emphasizes the importance of moderation in all aspects of life including diet, sleep, and activity for maintaining health. Your current health challenges may benefit from bringing greater balance to your lifestyle, incorporating mindful practices, and recognizing the connection between mental peace and physical wellbeing. Remember that proper self-care is not selfish but necessary for fulfilling your higher purpose.",
    spirituality: "The essence of spiritual growth according to the Bhagavad Gita is found in steady practice and detachment. In Chapter 6, Lord Krishna explains that the mind can be your greatest friend or enemy depending on how you train it. Your spiritual questions reflect a deepening journey. Regular meditation, study of sacred texts, and selfless service will help quiet the mind and reveal inner wisdom. Remember that spiritual growth isn't linear—challenges are opportunities for deeper understanding and connection with your true nature.",
    anxiety: "The Bhagavad Gita addresses anxiety directly in Chapter 2, where Lord Krishna teaches Arjuna to overcome fear through knowledge of the eternal self. Your anxiety stems from identification with temporary circumstances rather than your unchanging essence. Practice witnessing your thoughts without attachment, focusing on the present moment, and remembering that you are not your emotions but the consciousness that observes them. Regular meditation and karma yoga (selfless action) will help establish peace of mind even amidst challenging circumstances.",
    default: "The wisdom of the Bhagavad Gita reminds us that life's challenges are opportunities for growth and self-discovery. In Chapter 2, Verse 47, Lord Krishna teaches us to focus on our actions without attachment to results. Your current situation requires patience and perseverance. Remember that challenges are temporary, but the wisdom you gain is eternal. Try approaching this problem with detachment, focusing on your duty (dharma) rather than the outcome. This shift in perspective will bring clarity and peace."
  },
  hindi: {
    relationships: "भगवद गीता हमें सिखाती है कि सच्चे संबंध निःस्वार्थ प्रेम और समझ पर आधारित होते हैं। अध्याय 12 में, भगवान कृष्ण बताते हैं कि भक्ति और करुणा सार्थक संबंधों की नींव हैं। आपकी रिश्तों की चुनौतियाँ वर्तमान क्षण की सराहना करने के बजाय परिणामों से जुड़ाव से उत्पन्न हो सकती हैं। दूसरों में दिव्य को देखने का अभ्यास करें, पिछले दुखों को क्षमा करें, और अपने संबंधों को धैर्य के साथ देखें। याद रखें कि हम सभी एक यात्रा पर आध्यात्मिक प्राणी हैं, और दूसरों के साथ सम्मान और समझ के साथ व्यवहार करने से आपके बंधन मजबूत होंगे।",
    career: "भगवद गीता के अनुसार, अनासक्ति के साथ और दिव्य को समर्पित किया गया कार्य सच्ची पूर्ति लाता है। अध्याय 3 में, कृष्ण परिणामों से जुड़े बिना अपना कर्तव्य (धर्म) करने के महत्व को समझाते हैं। आपकी करियर संबंधी चिंताओं को परिणामों के बारे में चिंता छोड़कर उत्कृष्टता के प्रति समर्पण के साथ देखा जाना चाहिए। अपने कौशल को ईमानदारी के साथ योगदान देने पर ध्यान केंद्रित करें और अपने काम को सेवा के रूप में देखें। जब आप अपने करियर को अपने प्रामाणिक उद्देश्य और मूल्यों के साथ संरेखित करते हैं तो सफलता स्वाभाविक रूप से मिलेगी।",
    health: "गीता सिखाती है कि शरीर आत्मा के लिए एक मंदिर है और इसे संतुलन के साथ बनाए रखा जाना चाहिए। अध्याय 6 में, भगवान कृष्ण स्वास्थ्य बनाए रखने के लिए आहार, नींद और गतिविधि सहित जीवन के सभी पहलुओं में संयम के महत्व पर जोर देते हैं। आपकी वर्तमान स्वास्थ्य चुनौतियों को अपनी जीवनशैली में अधिक संतुलन लाने, सचेत अभ्यासों को शामिल करने और मानसिक शांति और शारीरिक स्वास्थ्य के बीच संबंध को पहचानने से लाभ हो सकता है। याद रखें कि उचित आत्म-देखभाल स्वार्थी नहीं है बल्कि आपके उच्च उद्देश्य को पूरा करने के लिए आवश्यक है।",
    spirituality: "भगवद गीता के अनुसार आध्यात्मिक विकास का सार स्थिर अभ्यास और अनासक्ति में पाया जाता है। अध्याय 6 में, भगवान कृष्ण बताते हैं कि मन आपके प्रशिक्षण के आधार पर आपका सबसे बड़ा मित्र या दुश्मन हो सकता है। आपके आध्यात्मिक प्रश्न एक गहरी यात्रा को दर्शाते हैं। नियमित ध्यान, पवित्र ग्रंथों का अध्ययन और निःस्वार्थ सेवा मन को शांत करने और आंतरिक ज्ञान को प्रकट करने में मदद करेगी। याद रखें कि आध्यात्मिक विकास रैखिक नहीं है - चुनौतियां आपकी वास्तविक प्रकृति के साथ गहरी समझ और संबंध के अवसर हैं।",
    anxiety: "भगवद गीता अध्याय 2 में सीधे चिंता को संबोधित करती है, जहां भगवान कृष्ण अर्जुन को शाश्वत स्वयं के ज्ञान के माध्यम से भय पर काबू पाना सिखाते हैं। आपकी चिंता अपने अपरिवर्तनीय सार के बजाय अस्थायी परिस्थितियों से पहचान से उत्पन्न होती है। बिना लगाव के अपने विचारों को देखने का अभ्यास करें, वर्तमान क्षण पर ध्यान केंद्रित करें, और याद रखें कि आप अपनी भावनाएं नहीं हैं बल्कि वह चेतना हैं जो उन्हें देखती है। नियमित ध्यान और कर्म योग (निःस्वार्थ कार्य) चुनौतीपूर्ण परिस्थितियों के बीच भी मन की शांति स्थापित करने में मदद करेंगे।",
    default: "भगवद गीता का ज्ञान हमें याद दिलाता है कि जीवन की चुनौतियां विकास और आत्म-खोज के अवसर हैं। अध्याय 2, श्लोक 47 में, भगवान कृष्ण हमें परिणामों से जुड़ाव के बिना अपने कर्मों पर ध्यान केंद्रित करना सिखाते हैं। आपकी वर्तमान स्थिति धैर्य और दृढ़ता की मांग करती है। याद रखें कि चुनौतियां अस्थायी हैं, लेकिन आपके द्वारा प्राप्त ज्ञान शाश्वत है। इस समस्या को निर्लिप्तता के साथ, परिणाम के बजाय अपने कर्तव्य (धर्म) पर ध्यान केंद्रित करके समझने का प्रयास करें। दृष्टिकोण में यह बदलाव स्पष्टता और शांति लाएगा।"
  }
};

// Helper function to determine response category based on the question
const determineResponseCategory = (question: string): string => {
  question = question.toLowerCase();
  
  if (question.includes('relationship') || question.includes('marriage') || question.includes('partner') || 
      question.includes('love') || question.includes('family') || question.includes('friend')) {
    return 'relationships';
  } else if (question.includes('job') || question.includes('career') || question.includes('work') || 
             question.includes('business') || question.includes('profession')) {
    return 'career';
  } else if (question.includes('health') || question.includes('illness') || question.includes('sick') || 
             question.includes('body') || question.includes('disease') || question.includes('pain')) {
    return 'health';
  } else if (question.includes('spiritual') || question.includes('meditation') || question.includes('soul') || 
             question.includes('enlightenment') || question.includes('god') || question.includes('divine')) {
    return 'spirituality';
  } else if (question.includes('worry') || question.includes('anxiety') || question.includes('stress') || 
             question.includes('fear') || question.includes('nervous') || question.includes('panic')) {
    return 'anxiety';
  }
  
  return 'default';
};

export function ProblemSolver({ language, isPremium = false }: ProblemSolverProps) {
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { isListening, transcript, startListening, stopListening, resetTranscript, error } = useSpeechRecognition(language);
  const { speak, stop, isReading } = useSpeechSynthesis(language);

  const handleSpeechInput = () => {
    if (isListening) {
      stopListening();
      setProblem(prev => prev + " " + transcript);
      resetTranscript();
    } else {
      startListening();
    }
  };

  const handleReset = () => {
    setProblem("");
    setSolution("");
    resetTranscript();
  };

  const handleSubmit = () => {
    if (!problem.trim()) return;
    
    setIsLoading(true);
    
    // Generate a more relevant response based on the question content
    setTimeout(() => {
      const category = determineResponseCategory(problem);
      const responses = wisdomResponses[language] || wisdomResponses.english;
      const response = responses[category] || responses.default;
      
      setSolution(response);
      setIsLoading(false);
    }, 2000);
  };

  const handleSpeak = () => {
    if (isReading) {
      stop();
      return;
    }
    
    speak(solution);
  };

  useEffect(() => {
    if (isListening) {
      setProblem(transcript);
    }
  }, [transcript, isListening]);

  return (
    <Card className="glass-card border border-gold/30">
      <CardHeader>
        <CardTitle className="text-gradient">Wisdom Guide</CardTitle>
        <CardDescription>Share your challenge and receive guidance from ancient Bhagavad Gita wisdom</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="relative">
            <Textarea
              placeholder="Describe the problem or challenge you're facing..."
              className="min-h-28 resize-none pr-20"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
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
              disabled={!problem.trim() || isLoading}
              className="button-gradient"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Get Guidance
                </>
              )}
            </Button>
          </div>
        </div>
        
        {solution && (
          <div className="bg-spiritual dark:bg-gray-800/40 rounded-lg p-4 border border-spiritual-dark dark:border-gray-700 animate-fade-in">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-heading font-medium text-lg">Bhagavad Gita Wisdom</h3>
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
            <p className="leading-relaxed">{solution}</p>
          </div>
        )}
        
        {!isPremium && (
          <div className="mt-4 bg-gold/10 dark:bg-gold/20 rounded-lg p-4 text-sm">
            <p className="font-medium mb-1">Upgrade to Premium for enhanced guidance:</p>
            <ul className="list-disc pl-5 space-y-1 text-foreground/80">
              <li>Detailed solutions with specific verse references</li>
              <li>Personalized mantras for your situation</li>
              <li>Access to all available languages</li>
              <li>Voice input and output in all languages</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
