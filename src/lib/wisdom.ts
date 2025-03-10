
import { supabase } from './supabase';
import { Language } from '@/types';

// Function to get wisdom based on category and language
export async function getWisdomResponse(category: string, language: Language) {
  try {
    // This assumes you will create a 'wisdom_responses' table in Supabase
    const { data, error } = await supabase
      .from('wisdom_responses')
      .select('*')
      .eq('category', category)
      .eq('language', language)
      .single();

    if (error) throw error;
    
    return data?.response || null;
  } catch (error) {
    console.error('Error fetching wisdom response:', error);
    return null;
  }
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

// Fallback wisdom responses when database doesn't return results
export const fallbackWisdomResponses = {
  english: {
    relationships: "The Bhagavad Gita teaches us that true relationships are based on selfless love and understanding...",
    career: "According to the Bhagavad Gita, work done with detachment and as an offering to the divine brings true fulfillment...",
    health: "The Gita teaches that the body is a temple for the soul and must be maintained with balance...",
    spirituality: "The essence of spiritual growth according to the Bhagavad Gita is found in steady practice and detachment...",
    anxiety: "The Bhagavad Gita addresses anxiety directly in Chapter 2, where Lord Krishna teaches Arjuna to overcome fear...",
    default: "The wisdom of the Bhagavad Gita reminds us that life's challenges are opportunities for growth and self-discovery..."
  },
  hindi: {
    relationships: "भगवद गीता हमें सिखाती है कि सच्चे संबंध निःस्वार्थ प्रेम और समझ पर आधारित होते हैं...",
    career: "भगवद गीता के अनुसार, अनासक्ति के साथ और दिव्य को समर्पित किया गया कार्य सच्ची पूर्ति लाता है...",
    health: "गीता सिखाती है कि शरीर आत्मा के लिए एक मंदिर है और इसे संतुलन के साथ बनाए रखा जाना चाहिए...",
    spirituality: "भगवद गीता के अनुसार आध्यात्मिक विकास का सार स्थिर अभ्यास और अनासक्ति में पाया जाता है...",
    anxiety: "भगवद गीता अध्याय 2 में सीधे चिंता को संबोधित करती है, जहां भगवान कृष्ण अर्जुन को शाश्वत स्वयं के ज्ञान...",
    default: "भगवद गीता का ज्ञान हमें याद दिलाता है कि जीवन की चुनौतियां विकास और आत्म-खोज के अवसर हैं..."
  }
};
