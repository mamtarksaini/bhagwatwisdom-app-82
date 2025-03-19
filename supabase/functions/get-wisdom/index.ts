
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') 
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    
    // Check API key explicitly with improved error messages
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not available in environment variables');
      return new Response(
        JSON.stringify({ 
          status: 'error',
          message: 'API key not configured in Supabase Edge Function secrets',
          useFallback: true,
          error: 'GEMINI_API_KEY not found in Supabase Edge Function environment variables. Please add it to your secrets.'
        }),
        { headers: CORS_HEADERS, status: 400 }
      );
    }
    
    if (GEMINI_API_KEY.trim() === '') {
      console.error('GEMINI_API_KEY is empty');
      return new Response(
        JSON.stringify({ 
          status: 'error',
          message: 'API key is empty in Supabase Edge Function secrets',
          useFallback: true,
          error: 'GEMINI_API_KEY is empty. Please set a valid API key in your Supabase Edge Function secrets.'
        }),
        { headers: CORS_HEADERS, status: 400 }
      );
    }
    
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
    ${language === 'hindi' ? "Please respond in conversational Hindi language that's easy to understand." : ""}`
    
    console.log('Calling Gemini API with key length:', GEMINI_API_KEY.length);
    
    try {
      // Call Gemini API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout for more reliability

      // Gemini API endpoint
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
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
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error(`Gemini API returned status: ${response.status}`);
        const errorText = await response.text();
        console.error(`Gemini API error response: ${errorText}`);
        
        // Provide more specific error messages for common API issues
        if (response.status === 403) {
          return new Response(
            JSON.stringify({ 
              status: 'error',
              message: 'Invalid or unauthorized Gemini API key',
              retryable: false,
              useFallback: true,
              error: `API authentication error: The Gemini API key appears to be invalid or unauthorized. Please check your API key in Supabase Edge Function secrets.`
            }),
            { headers: CORS_HEADERS, status: 403 }
          );
        } else if (response.status === 429) {
          return new Response(
            JSON.stringify({ 
              status: 'error',
              message: 'Gemini API rate limit exceeded',
              retryable: true,
              useFallback: true,
              error: `API rate limit exceeded: The Gemini API is currently rate limiting requests. Try again later.`
            }),
            { headers: CORS_HEADERS, status: 429 }
          );
        }
        
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Received response from Gemini API');
      
      // Validate Gemini API response
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.error('Invalid Gemini API response structure:', JSON.stringify(data).substring(0, 200));
        throw new Error('Invalid API response format');
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
          headers: CORS_HEADERS,
          status: 200
        }
      );
    } catch (apiError) {
      console.error('Gemini API error:', apiError.message);
      
      // Check if it's an abort error (timeout)
      if (apiError.name === 'AbortError') {
        return new Response(
          JSON.stringify({ 
            status: 'error',
            message: 'Gemini API request timed out after 25 seconds',
            retryable: true,
            error: apiError.message
          }),
          { headers: CORS_HEADERS, status: 504 }
        );
      }
      
      // Return a specific error message to help with debugging
      return new Response(
        JSON.stringify({ 
          status: 'error',
          message: `Gemini API error: ${apiError.message}`,
          retryable: true,
          useFallback: true,
          error: apiError.message
        }),
        { headers: CORS_HEADERS, status: 500 }
      );
    }
  } catch (error) {
    console.error('Edge function error:', error);
    
    // Return error status with more details
    return new Response(
      JSON.stringify({ 
        status: 'error',
        message: error.message || 'Request processing failed',
        retryable: true,
        useFallback: true,
        error: error.stack
      }),
      { 
        status: 500,
        headers: CORS_HEADERS
      }
    );
  }
});
