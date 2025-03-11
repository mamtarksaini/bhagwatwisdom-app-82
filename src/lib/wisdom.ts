
import { Language } from '@/types';
import { toast } from '@/components/ui/use-toast';

// Your Gemini API key - replace with your actual API key
const GEMINI_API_KEY = 'your-gemini-api-key-here';

// Function to get wisdom from Gemini API
export async function getWisdomResponse(category: string, language: Language, question: string) {
  try {
    // Call Gemini API to get a response
    const geminiResponse = await fetchGeminiResponse(question, category, language);
    
    // Return the response if successful
    if (geminiResponse) {
      return geminiResponse;
    }
    
    // Fall back to pre-defined responses if Gemini API call fails
    return getFallbackResponse(category, language);
  } catch (error) {
    console.error('Error fetching wisdom response:', error);
    return getFallbackResponse(category, language);
  }
}

// Function to call Gemini API
async function fetchGeminiResponse(question: string, category: string, language: Language) {
  try {
    // Construct prompt based on category and language
    let prompt = `You are a wise spiritual guide who provides wisdom based on the Bhagavad Gita. 
    The user is asking about: "${question}" which falls under the category of "${category}".
    Please provide a thoughtful, compassionate response with references to relevant concepts from the Bhagavad Gita.`;
    
    if (language === 'hindi') {
      prompt += " Please respond in Hindi language.";
    }
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        }
      })
    });
    
    const data = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    } else {
      console.error('Unexpected Gemini API response format:', data);
      toast({
        title: "Using Fallback Response",
        description: "Could not get a valid response from Gemini API. Using pre-defined wisdom.",
        variant: "destructive"
      });
      return null;
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    toast({
      title: "API Error",
      description: "Error connecting to Gemini API. Using pre-defined wisdom instead.",
      variant: "destructive"
    });
    return null;
  }
}

// Helper function to get fallback response
function getFallbackResponse(category: string, language: Language) {
  const responses = fallbackWisdomResponses[language] || fallbackWisdomResponses.english;
  return responses[category] || responses.default;
}

// Function to determine response category based on the question
export const determineResponseCategory = (question: string): string => {
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

// Fallback wisdom responses when Gemini API doesn't return results
export const fallbackWisdomResponses = {
  english: {
    relationships: "The Bhagavad Gita teaches us that true relationships are based on selfless love and understanding. Like Krishna advised Arjuna, 'Those who are motivated only by desire for the fruits of action are miserable, for they are constantly anxious about the results of what they do.' In relationships too, attachment to outcomes brings suffering, while selfless love brings peace.",
    career: "According to the Bhagavad Gita, work done with detachment and as an offering to the divine brings true fulfillment. As Lord Krishna says, 'You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions.' Focus on doing your work with excellence and dedication, rather than being anxious about results.",
    health: "The Gita teaches that the body is a temple for the soul and must be maintained with balance. Lord Krishna advises: 'Yoga is not for one who eats too much, or for one who eats too little; it is not for one who sleeps too much, or for one who sleeps too little.' Moderation in all aspects of life brings health and clarity.",
    spirituality: "The essence of spiritual growth according to the Bhagavad Gita is found in steady practice and detachment. Krishna teaches, 'The mind is restless and difficult to restrain, but it is subdued by practice and detachment.' Regular meditation, self-inquiry, and devotion will gradually reveal your true spiritual nature.",
    anxiety: "The Bhagavad Gita addresses anxiety directly in Chapter 2, where Lord Krishna teaches Arjuna to overcome fear through knowledge of the eternal self: 'For the soul there is never birth nor death. It is not that the soul once was not, has come into being, or will cease to be. It is unborn, eternal, ever-existing, undying and primeval.'",
    default: "The wisdom of the Bhagavad Gita reminds us that life's challenges are opportunities for growth and self-discovery. As Krishna guides Arjuna, 'Whatever happened, happened for good. Whatever is happening, is happening for good. Whatever will happen, will also happen for good.' Trust in the divine plan and perform your duties with devotion."
  },
  hindi: {
    relationships: "भगवद गीता हमें सिखाती है कि सच्चे संबंध निःस्वार्थ प्रेम और समझ पर आधारित होते हैं। जैसे कृष्ण ने अर्जुन को सलाह दी, 'जो केवल कर्म के फलों की इच्छा से प्रेरित होते हैं, वे दुखी होते हैं, क्योंकि वे लगातार अपने कार्यों के परिणामों के बारे में चिंतित रहते हैं।' रिश्तों में भी, परिणामों से जुड़ाव दुःख लाता है, जबकि निःस्वार्थ प्रेम शांति लाता है।",
    career: "भगवद गीता के अनुसार, अनासक्ति के साथ और दिव्य को समर्पित किया गया कार्य सच्ची पूर्ति लाता है। जैसा कि भगवान कृष्ण कहते हैं, 'आपको अपने निर्धारित कर्तव्यों को करने का अधिकार है, लेकिन आप अपने कर्मों के फलों के हकदार नहीं हैं।' परिणामों के बारे में चिंतित होने के बजाय, उत्कृष्टता और समर्पण के साथ अपना काम करने पर ध्यान दें।",
    health: "गीता सिखाती है कि शरीर आत्मा के लिए एक मंदिर है और इसे संतुलन के साथ बनाए रखा जाना चाहिए। भगवान कृष्ण सलाह देते हैं: 'योग उसके लिए नहीं है जो बहुत अधिक खाता है, या उसके लिए जो बहुत कम खाता है; यह उसके लिए नहीं है जो बहुत अधिक सोता है, या उसके लिए जो बहुत कम सोता है।' जीवन के सभी पहलुओं में संयम स्वास्थ्य और स्पष्टता लाता है।",
    spirituality: "भगवद गीता के अनुसार आध्यात्मिक विकास का सार स्थिर अभ्यास और अनासक्ति में पाया जाता है। कृष्ण सिखाते हैं, 'मन चंचल और नियंत्रित करना कठिन है, लेकिन यह अभ्यास और अनासक्ति से वश में होता है।' नियमित ध्यान, आत्म-जिज्ञासा, और भक्ति धीरे-धीरे आपके सच्चे आध्यात्मिक स्वभाव को प्रकट करेंगे।",
    anxiety: "भगवद गीता अध्याय 2 में सीधे चिन्ता को संबोधित करती है, जहां भगवान कृष्ण अर्जुन को शाश्वत स्वयं के ज्ञान के माध्यम से भय को दूर करना सिखाते हैं: 'आत्मा के लिए कभी जन्म नहीं है और न ही मृत्यु है। ऐसा नहीं है कि आत्मा कभी नहीं थी, अस्तित्व में आई है, या समाप्त हो जाएगी। यह अजन्मा, शाश्वत, सदा-विद्यमान, अमर और आदिकालीन है।'",
    default: "भगवद गीता का ज्ञान हमें याद दिलाता है कि जीवन की चुनौतियां विकास और आत्म-खोज के अवसर हैं। जैसे कृष्ण अर्जुन का मार्गदर्शन करते हैं, 'जो हुआ, अच्छे के लिए हुआ। जो हो रहा है, अच्छे के लिए हो रहा है। जो होगा, वह भी अच्छे के लिए होगा।' दिव्य योजना पर भरोसा करें और भक्ति के साथ अपने कर्तव्यों का पालन करें।"
  }
};
