
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }
  
  try {
    // Validate request
    const { question, category, language } = await req.json()
    if (!question || !category || !language) {
      throw new Error('Missing required fields')
    }
    
    console.log(`Processing request for question: "${question}", category: "${category}", language: "${language}"`);
    
    // If Gemini API key is not available, return fallback immediately
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured in environment variables');
      return new Response(
        JSON.stringify({ 
          status: 'success',
          useFallback: true
        }),
        { headers: CORS_HEADERS, status: 200 }
      );
    }
    
    // Construct prompt
    const prompt = `You are a wise spiritual guide who provides wisdom based on the Bhagavad Gita. 
    The user is asking about: "${question}" which falls under the category of "${category}".
    Please provide a thoughtful, compassionate response with references to relevant concepts from the Bhagavad Gita.
    ${language === 'hindi' ? " Please respond in Hindi language." : ""}`
    
    console.log('Calling Gemini API with prompt.');
    
    try {
      // Call Gemini API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // Increased timeout to 8 seconds
      
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
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error(`Gemini API returned non-200 status: ${response.status}`);
        console.error(`Response text: ${await response.text()}`);
        return new Response(
          JSON.stringify({ 
            status: 'success',
            useFallback: true
          }),
          { headers: CORS_HEADERS, status: 200 }
        );
      }

      const data = await response.json();
      console.log('Received response from Gemini API');
      
      // Validate Gemini API response
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.error('Invalid Gemini API response structure:', JSON.stringify(data).substring(0, 200));
        return new Response(
          JSON.stringify({ 
            status: 'success',
            useFallback: true
          }),
          { headers: CORS_HEADERS, status: 200 }
        );
      }

      // Return successful response
      const answer = data.candidates[0].content.parts[0].text;
      console.log('Returning answer (truncated):', answer.substring(0, 50) + '...');
      
      return new Response(
        JSON.stringify({ 
          answer: answer,
          status: 'success',
          useFallback: false
        }), 
        {
          headers: { ...CORS_HEADERS },
          status: 200
        }
      );
    } catch (apiError) {
      // Handle fetch timeouts and other network errors
      console.error('Error calling Gemini API:', typeof apiError === 'object' ? JSON.stringify(apiError) : apiError);
      if (apiError.name === 'AbortError') {
        console.error('Request timed out');
      }
      
      return new Response(
        JSON.stringify({ 
          status: 'success',
          useFallback: true,
          error: 'API request failed or timed out'
        }),
        { headers: CORS_HEADERS, status: 200 }
      );
    }
  } catch (error) {
    console.error('Edge function error:', error);
    
    // Return successful response with useFallback flag
    return new Response(
      JSON.stringify({ 
        status: 'success',
        useFallback: true,
        error: 'Request processing failed'
      }),
      { 
        status: 200,
        headers: { ...CORS_HEADERS }
      }
    );
  }
});

