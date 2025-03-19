import { Language } from '@/types';
import { toast } from '@/hooks/use-toast';
import { supabase } from './supabase';

// Response type for getWisdomResponse
type WisdomResponse = {
  answer: string;
  isFallback: boolean;
  isNetworkIssue?: boolean;
  isApiKeyIssue?: boolean;
  errorDetails?: string;
}

// Helper function to make a direct API call to Gemini
async function callGeminiDirectly(prompt: string) {
  // Use a valid API key - this one should be replaced with your own
  const DIRECT_GEMINI_API_KEY = 'YOUR_ACTUAL_GEMINI_API_KEY'; 
  
  if (!DIRECT_GEMINI_API_KEY || DIRECT_GEMINI_API_KEY === 'YOUR_ACTUAL_GEMINI_API_KEY') {
    console.warn('No valid direct Gemini API key provided for fallback');
    return null;
  }
  
  try {
    console.log('Attempting direct Gemini API call with client-side key');
    
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': DIRECT_GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        }
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Direct Gemini API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid Gemini API response structure');
    }
    
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Direct Gemini API call failed:', error);
    return null;
  }
}

// Function to get wisdom from Supabase Edge Function or direct API call
export async function getWisdomResponse(category: string, language: Language, question: string): Promise<WisdomResponse> {
  try {
    console.log('Calling get-wisdom function with:', { category, language, question });
    
    // Construct prompt for modern relevance
    const prompt = `You are both a wise spiritual guide knowledgeable in the Bhagavad Gita AND a modern psychologist or life coach. Respond to this problem in a way that today's generation would relate to while providing authentic wisdom.

    The user's problem is: "${question}" (category: ${category})
    
    Your response should:
    1. Acknowledge their struggle with empathy in 1-2 sentences
    2. Provide one or two relevant principles from the Bhagavad Gita, explaining the concept in modern language
    3. Outline 2-3 practical steps they can take, rooted in this wisdom but presented in contemporary terms
    4. End with a brief encouraging statement
    
    Use accessible language while preserving the depth of the wisdom. Avoid religious jargon that might alienate someone unfamiliar with Hindu concepts - instead, focus on the psychological insights.
    
    Keep your response concise (200-400 words).
    ${language === 'hindi' ? "Please respond in conversational Hindi language that's easy to understand." : ""}`;
    
    // First, try Supabase Edge Function as our primary method
    console.log('Trying edge function first');
    
    // Add a reasonable timeout for the edge function call
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Edge function request timed out')), 25000)
    );
    
    let edgeFunctionResponse;
    let edgeError = null;
    
    try {
      // Try to call the Edge Function as primary method
      const functionCallPromise = supabase.functions.invoke('get-wisdom', {
        body: {
          question,
          category,
          language
        }
      });
      
      // Race between the response and timeout
      edgeFunctionResponse = await Promise.race([
        functionCallPromise,
        timeoutPromise.then(() => { 
          throw new Error('Edge function request timed out');
        })
      ]);
      
    } catch (error) {
      console.error('Edge function error:', error);
      edgeError = error;
    }
    
    // Process Edge Function response if successful
    if (edgeFunctionResponse && !edgeFunctionResponse.error) {
      const data = edgeFunctionResponse.data;
      
      // Add extra logging to see what's coming back
      console.log('Response from edge function:', JSON.stringify(data));
  
      // Handle error status from edge function
      if (data?.status === 'error') {
        console.error('Server returned error:', data.message);
        
        // Check if it's an API key issue
        const isApiKeyIssue = 
          data.message?.includes('API key') || 
          data.message?.includes('unauthorized') || 
          data.message?.includes('API authentication');
          
        if (isApiKeyIssue) {
          throw new Error(`AI service unavailable: API key issue - ${data.error || data.message}`);
        }
        
        throw new Error(data.message || 'Server error');
      }
  
      // Check if we need to use fallback (API key missing or other server error)
      if (data?.useFallback) {
        console.warn('Server indicated fallback should be used:', data);
        
        if (data?.error) {
          console.error('Server error details:', data.error);
        }
        
        // Check if it looks like an API key issue
        const isApiKeyIssue = 
          data.error?.includes('API key') || 
          data.error?.includes('unauthorized') || 
          data.error?.includes('API authentication') ||
          data.message?.includes('API key');
          
        if (isApiKeyIssue) {
          throw new Error(`AI service unavailable: API key issue - ${data.error || 'check your API key'}`);
        }
        
        throw new Error(`AI service unavailable: ${data.error || 'Unknown reason'}`);
      }
  
      if (data && data.answer) {
        console.log('Got wisdom response from edge function:', data.answer.substring(0, 100) + '...');
        return {
          answer: data.answer,
          isFallback: false
        };
      }
    }
    
    // If edge function fails, try direct API as fallback
    console.warn('Edge Function failed, trying direct API');
    const directAnswer = await callGeminiDirectly(prompt);
    
    if (directAnswer) {
      console.log('Got wisdom response from direct API call:', directAnswer.substring(0, 100) + '...');
      
      return {
        answer: directAnswer,
        isFallback: false
      };
    }
    
    // If both methods fail, use fallback response
    console.warn('Both Edge Function and Direct API failed, using static fallback');
    
    // Check if the error is related to API key issues
    const errorMessage = edgeError instanceof Error ? edgeError.message : String(edgeError);
    const isApiKeyIssue = 
      errorMessage.includes('API key') || 
      errorMessage.includes('unauthorized') || 
      errorMessage.includes('API authentication');
      
    throw new Error(isApiKeyIssue 
      ? `AI service unavailable: API key issue - ${errorMessage}` 
      : 'All wisdom services unavailable');
    
  } catch (error) {
    console.error('Error fetching wisdom response:', error);
    
    // Extract error message
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Check if it's a network/connection error
    const isNetworkIssue = 
      errorMessage.includes('Failed to fetch') || 
      errorMessage.includes('NetworkError') ||
      errorMessage.includes('Failed to send a request') ||
      errorMessage.includes('Failed to connect to wisdom service') ||
      errorMessage.includes('timed out');
    
    // Check if it's an API key issue
    const isApiKeyIssue = 
      errorMessage.includes('API key') || 
      errorMessage.includes('unauthorized') || 
      errorMessage.includes('API authentication');
    
    // Get fallback response
    const response = getFallbackResponse(category, language);
    
    return {
      answer: response,
      isFallback: true,
      isNetworkIssue: isNetworkIssue,
      isApiKeyIssue: isApiKeyIssue,
      errorDetails: errorMessage
    };
  }
}

// Helper function to get fallback response
function getFallbackResponse(category: string, language: Language) {
  console.log('Using fallback response for category:', category, 'language:', language);
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
             question.includes('fear') || question.includes('nervous') || question.includes('panic') ||
             question.includes('tension') || question.includes('tensed')) {
    return 'anxiety';
  } else if (question.includes('meaning') || question.includes('purpose') || question.includes('direction') ||
             question.includes('lost') || question.includes('confused') || question.includes('clarity')) {
    return 'purpose';
  } else if (question.includes('happy') || question.includes('happiness') || question.includes('joy') ||
             question.includes('content') || question.includes('satisfaction') || question.includes('fulfillment')) {
    return 'happiness';
  }
  
  return 'default';
};

// Enhanced fallback wisdom responses when API doesn't return results
export const fallbackWisdomResponses = {
  english: {
    relationships: "I understand how challenging relationships can be sometimes. The Bhagavad Gita offers profound insights here.\n\nAt its core, the Gita teaches that true relationships are based on selfless love rather than attachment. When we love someone for what we get from them, we create suffering for ourselves. Instead, try to:\n\n1. Practice seeing your relationships as opportunities for growth rather than just sources of happiness\n2. When conflicts arise, step back and observe your reactions before responding\n3. Approach difficult conversations with both honesty and compassion\n\nRemember, the quality of your relationships often reflects your relationship with yourself.",
    
    career: "Career challenges can feel overwhelming, and I hear your concern. The Bhagavad Gita offers a refreshing perspective on work.\n\nThe concept of 'Karma Yoga' teaches doing your work excellently while detaching from the outcome. This doesn't mean not caring - it means giving your best without allowing anxiety about results to control you.\n\nTry these approaches:\n1. Focus on developing your skills and giving your best effort rather than fixating on recognition or advancement\n2. Find aspects of your work that align with your values and strengths\n3. Set boundaries to maintain balance in your life\n\nYour career is important, but it's only one aspect of your complete self.",
    
    health: "Health concerns can be incredibly stressful, and I acknowledge what you're going through. The Bhagavad Gita offers wisdom about caring for our physical and mental wellbeing.\n\nThe Gita teaches that balance is key - 'Yoga is not for one who eats too much or too little, sleeps too much or too little.' This ancient wisdom aligns perfectly with modern health psychology.\n\nSome practical steps to consider:\n1. Approach self-care with consistency rather than intensity - small daily habits matter more than occasional major efforts\n2. Listen to your body's signals rather than pushing through pain or discomfort\n3. Remember that your thoughts significantly impact your physical wellbeing\n\nTaking care of yourself isn't selfish - it's necessary for showing up fully in all areas of your life.",
    
    spirituality: "Spiritual questions are some of the most profound we can ask, and your search is valuable. The Bhagavad Gita offers guidance for the spiritual journey that remains remarkably relevant today.\n\nOne of its core teachings is that spiritual growth comes through consistent practice and developing detachment from outcomes. As Krishna says, 'The mind is restless but can be trained through practice and dispassion.'\n\nYou might consider:\n1. Establishing a daily meditation practice, even if just for 5-10 minutes\n2. Regularly questioning your attachments to results and outcomes\n3. Finding opportunities to serve others without expectation of reward\n\nYour spiritual journey is uniquely yours - trust your inner wisdom while remaining open to guidance.",
    
    anxiety: "Anxiety can be overwhelming, and I empathize with what you're feeling. The Bhagavad Gita contains surprisingly modern insights about managing fear and worry.\n\nThe text suggests that much of our anxiety comes from identifying too strongly with changing circumstances rather than our unchanging inner awareness. When we see ourselves as separate from our thoughts, we gain freedom.\n\nTry these approaches:\n1. Practice observing your anxious thoughts without immediately believing or reacting to them\n2. Focus on what you can control right now, rather than future uncertainties\n3. Connect with your breath when feeling overwhelmed - it anchors you to the present moment\n\nRemember that anxiety, like all emotions, comes and goes - you are the awareness that remains constant through it all.",
    
    purpose: "Questioning your purpose or direction is a significant part of being human. The Bhagavad Gita offers profound wisdom on finding meaning in life.\n\nA core teaching is that we find purpose not through what we achieve, but through how we approach what we do. True fulfillment comes from aligning our actions with our authentic values and using our unique gifts in service of something larger than ourselves.\n\nConsider these steps:\n1. Identify your natural strengths and the activities that energize rather than drain you\n2. Look for ways to use these strengths to contribute to others' wellbeing\n3. Focus on the process rather than striving for some idealized endpoint\n\nYour search for purpose is itself meaningful - it demonstrates your depth and desire for an authentic life.",
    
    happiness: "The search for genuine happiness is universal, and I appreciate your question. The Bhagavad Gita offers timeless wisdom on true contentment.\n\nInterestingly, the text suggests that pursuing happiness directly often leads us away from it. Instead, lasting fulfillment comes when we act with integrity, remain fully present, and accept both pleasant and unpleasant experiences without clinging or resistance.\n\nSome practical approaches:\n1. Regularly identify and appreciate what's going well in your life, however small\n2. Engage in activities that create a sense of 'flow' - where you lose track of time\n3. Nurture meaningful connections with others, as relationships are consistently linked to wellbeing\n\nRemember that happiness isn't a constant state but includes the full spectrum of emotions experienced with awareness.",
    
    default: "Thank you for sharing your question. The Bhagavad Gita offers wisdom that remains remarkably relevant to our modern challenges.\n\nOne of its most powerful teachings is that we find peace not by controlling external circumstances, but by changing our relationship to them. As Krishna tells Arjuna, 'You have control over your actions alone, never over the results.'\n\nThis perspective invites us to:\n1. Focus on what we can influence rather than what we can't control\n2. Approach challenges as opportunities for growth rather than obstacles\n3. Be fully present with whatever arises, without excessive attachment to outcomes\n\nYour willingness to seek guidance shows wisdom. Trust that you have the inner resources to navigate this situation with both strength and compassion."
  },
  hindi: {
    relationships: "मैं समझता/समझती हूँ कि रिश्ते कभी-कभी कितने चुनौतीपूर्ण हो सकते हैं। भगवद गीता यहां गहरी अंतर्दृष्टि प्रदान करती है।\n\nमूल रूप से, गीता सिखाती है कि सच्चे संबंध लगाव के बजाय निःस्वार्थ प्रेम पर आधारित होते हैं। जब हम किसी से इसलिए प्यार करते हैं कि हम���ं उनसे क्या मिलता है, तो हम अपने लिए कष्ट पैदा करते हैं। इसके बजाय, यह करने का प्रयास करें:\n\n1. अपने रिश्तों को केवल खुशी के स्रोत के बजाय विकास के अवसर के रूप में देखने का अभ्यास करें\n2. जब संघर्ष उत्पन्न होते हैं, तो प्रतिक्रिया देने से पहले पीछे हटें और अपनी प्रतिक्रियाओं को देखें\n3. कठिन बातचीत को ईमानदारी और करुणा दोनों के साथ करें\n\nयाद रखें, आपके रिश्तों की गुणवत्ता अक्सर अपने साथ आपके रिश्ते को दर्शाती है।",
    
    career: "करियर की चुनौतियां अभिभूत करने वाली हो सकती हैं, और मैं आपकी चिंता को समझता/समझती हूं। भगवद गीता काम पर एक ताज़ा दृष्टिकोण प्रदान करती है।\n\n'कर्म योग' की अवधारणा परिणाम से अनासक्त होकर अपना काम उत्कृष्टता से करना सिखाती है। इसका मतलब यह नहीं है कि आप परवाह न करें - इसका मतलब है कि आप अपना सर्वश्रेष्ठ देते हुए परिणामों के बारे में चिंता को आप पर हावी न होने दें।\n\nइन दृष्टिकोणों को आजमाएं:\n1. मान्यता या उन्नति पर ध्यान केंद्रित करने के बजाय अपने कौशल विकसित करने और अपना सर्वश्रेष्ठ प्रयास ���ेने पर ध्यान दें\n2. अपने काम के ऐसे पहलू खोजे�� जो आपके मूल्यों और ताकतों के अनुरूप हों\n3. अपने जीवन में संतुलन बनाए रखने के लिए सीमाएं निर्धारित करें\n\nआपका करियर महत्वपूर्ण है, लेकिन यह आपके संपूर्ण स्वयं का केवल एक पहलू है।",
    
    health: "स्वास्थ्य संबंधी चिंताएं अविश्वसनीय रूप से तनावपूर्ण हो सकती हैं, और मैं आप जो कुछ भी अनुभव कर रहे हैं उसे समझता/समझती हूं। भगवद गीता हमारे शारीरिक और मानसिक कल्याण की देखभाल के बारे में ज्ञान प्रदान करती है।\n\nगीता सिखाती है कि संतुलन महत्वपूर्ण है - 'योग उसके लिए नहीं है जो बहुत अधिक या बहुत कम खाता है, बहुत अधिक या बहुत कम सोता है।' यह प्राचीन ज्ञान आधुनिक स्वास्थ्य मनोविज्ञान के साथ पूरी तरह से सहमत है।\n\nविचार करने के लिए क���छ व्यावहारिक कदम:\n1. तीव्रता के बजाय निरंतरता के साथ स्व-देखभाल का दृष्टिकोण अपनाएं - कभी-कभार के बड़े प्रयासों की तुलना में छोटी दैनिक आदतें अधिक मायने रखती हैं\n2. दर्द या असुविधा के माध्यम से धकेलने के बजाय अपने शरीर के संकेतों को सुनें\n3. याद रखें कि आपके विचार आपके शारीरिक कल्याण को महत्वपूर्ण रूप से प्रभावित करते हैं\n\nअपनी देखभाल करना स्वार्थी नहीं है - यह अपने जीवन के सभी क्षेत्रों में पूरी तरह से मौजूद होने के लिए आवश्यक है।",
    
    spirituality: "आध्यात्मिक प्रश्न कुछ सबसे गहरे प्रश्न हैं जो हम पूछ सकते हैं, और आपकी खोज मूल्यवान है। भगवद गीता आध्यात्मिक यात्रा के लिए मार्गदर्शन प्रदान करती है जो आज भी उल्लेखनीय रूप से प्रासंगिक है।\n\nइसकी मुख्य शिक्षाओं में से एक यह है कि आध्यात्मिक विकास निरंतर अभ्यास और परिणामों से अनासक्ति विकसित करने से आता है। जैसा कि कृष्ण कहते हैं, 'मन चंचल है लेकिन अभ्यास और वैराग्य के माध्यम से प्रशिक्षित किया जा सकता है।'\n\nआप विचार कर सकते हैं:\n1. एक द��निक ध्यान अभ्यास स्थापित करना, भले ही सिर्फ 5-10 मिनट के लिए\n2. नियमित रू��� से परिणामों और प्राप्तियों के प्रति अपने लगाव पर सवाल करना\n3. बिना पुरस्कार की अपेक्षा के दूसरों की सेवा करने के अवसर खोजना\n\nआपकी आध्यात्मिक यात्रा अद्वितीय रूप से आपकी है - मार्गदर्शन के लिए खुले रहते हुए अपने आंतरिक ज्ञान पर भरोसा करें।",
    
    anxiety: "चिंता अभिभूत करने वाली हो सकती है, और मैं आप जो महसूस कर रहे हैं उसके साथ सहानुभूति रखता/रखती हूं। भगवद गीता में भय और चिंता के प्रबंधन के बारे में आश्चर्यजनक रूप से आधुनिक अंतर्दृष्टि है।\n\nटेक्स्ट बताता है कि हमारी अधिकांश चिंता हमारी अपरिवर्तनीय आंतरिक जागरूकता के बजाय बदलती परिस्थितियों के साथ भुत अधिक पहचान बनाने से आती है। जब हम अपने आप को अपने विचारों से अलग देखते हैं, तो हमें स्वतंत्रता मिलती है।\n\nइन दृष्टिकोणों को आजमाएं:\n1. अपने चिंताजनक विचारों को तुरंत विश्वास या प्रतिक्रिया किए बिना देखने का अभ्यास करें\n2. भविष्य की अनिश्चितताओं के बजाय, इस पर ध्यान दें जिसे आप अभी नियंत्रित कर सकते हैं\n3. जब अभिभूत महसूस हो तो अपनी सांस के साथ जुड़ें - यह आपको वर्तमान क्षण में लंगर डालता है\n\nयाद रखें कि चिंता, सभी भावनाओं की तरह, आती है और जाती है - आप वह जागरूकता हैं जो इन सब के माध्यम से स्थिर रहती है।",
    
    purpose: "अपने उद्देश्य या दिशा पर सवाल करना मानव होने का एक महत्वपूर्ण हिस्सा है। भगवद गीता जीवन में अर्थ खोजने पर गहरा ज्ञान प्रदान करती है।\n\nएक मुख्य शिक्षा यह है कि हम उद्देश्य को इस बात से नहीं पाते कि हम क्या हासिल करते हैं, बल्कि इससे पाते हैं कि हम जो करते हैं उसे कैसे करते हैं। सच्ची पूर्ति हमारे कार्यों को हमारे प्रामाणिक मूल्यों के साथ संरेखित करने और अपनी अद्वितीय प्रतिभाओं का उपयोग स्वयं से बड़ी किसी चीज़ की सेवा में करने से आती है।\n\nइन चरणों पर विचार ���रें:\n1. अपनी प्राकृतिक शक्तियों और उन गतिविधि���ों की पहचान करें जो आपको ऊर्जा देती हैं न कि निचोड़ती हैं\n2. इन शक्तियों का उपयोग दूसरों के कल्याण में योगदान देने के तरीके खोजें\n3. किसी आदर्श अंतिम बिंदु के लिए प्रयास करने के बजाय प्रक्रिया पर ध्यान केंद्रित करें\n\nउद्देश्य की आपकी खोज स्वयं में अर्थपूर्ण है - यह आपकी गहराई और एक प्रामाणिक जीवन की इच्छा को दर्शाती है।",
    
    happiness: "वास्तविक खुशी की खोज सार्वभौमिक है, और मैं आपके प्रश्न की सराहना करता/करती हूं। भगवद गीता सच्चे संतोष पर अमर ज्ञान प्रदान करती है।\n\nदिलचस्प बात यह है कि टेक्स्ट बताता है कि सीधे खुशी का पीछा करने से अक्सर हम उससे दूर हो जाते हैं। इसके बजाय, स्थायी पूर्ति तब आती है जब हम अखंडता के साथ कार्य करते हैं, पूरी तरह से वर्तमान रहते हैं, और सुखद और अप्रिय अनुभवों दोनों को बिना चिपके या प्रतिरोध के स्वीकार करते हैं।\n\nकुछ व्यावहारिक दृष्टिकोण:\n1. नियमित रूप से अपने जीवन में जो अच्छा चल रहा है उसकी पहचान करें और उसकी सराहना करें, चाहे वह कितना भी छोटा हो\n2. ऐसी गतिविधियों में संलग्न हों जो 'प्रवाह' की भावना पैदा करती हों - जहां आप समय का हिसाब खो देते हैं\n3. दूसरों के साथ अर्थपूर्ण संबंध बनाएं, क्योंकि रिश्ते लगातार कल्याण से जुड़े होते हैं\n\nयाद रखें कि खुशी एक निरंतर स्थिति नहीं है बल्कि जागरूकता के साथ अनुभव किए गए भावनाओं के पूर्ण स्पेक्ट्रम को शामिल करती है।",
    
    default: "अपना प्रश्न साझा करने के लिए धन्यवाद। भगवद गीता ऐसा ज्ञान प्रदान करती है जो हमारी आधुनिक चुनौतियों के लिए उल्लेखनीय रूप से प्रासंगिक बना हुआ है।\n\nइसकी सबसे शक्तिशाली शिक्षाओं में से एक यह है कि हम बाहरी परिस्थितियों को नियंत्रित करके नहीं, बल्कि उनके साथ अपने संबंध को बदलकर शांति पाते हैं। जैसा कि कृष्ण अ���्जुन से कहते हैं, 'आपका नियंत्रण केवल अपने कर्मों पर है, कभी भी परि���ामों पर नहीं।'\n\nयह दृष्टिकोण हमें आमंत्रित करता है:\n1. जो हम नियंत्रित नहीं कर सकते उस पर नहीं बल्कि जिसे हम प्रभावित कर सकते हैं उस पर ध्यान केंद्रित करें\n2. चुनौतियों को बाधाओं के बजाय विकास के अवसरों के रूप में देखें\n3. बिना परिणामों से अत्यधिक जुड़े, जो भी उत्पन्न होता है उसके साथ पूरी तरह से मौजूद रहें\n\nमार्गदर्शन की तलाश में आपकी इच्छा ज्ञान दिखाती है। विश्वास रखें कि आपके पास इस स्थिति को शक्ति और करुणा दोनों के साथ नेविगेट करने के लिए आंतरिक संसाधन हैं।"
  }
};
