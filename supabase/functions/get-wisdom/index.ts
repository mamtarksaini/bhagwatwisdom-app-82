
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
    // Validate API key without showing error message
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

    // Validate request
    const { question, category, language } = await req.json()
    if (!question || !category || !language) {
      throw new Error('Missing required fields')
    }
    
    // Construct prompt
    const prompt = `You are a wise spiritual guide who provides wisdom based on the Bhagavad Gita. 
    The user is asking about: "${question}" which falls under the category of "${category}".
    Please provide a thoughtful, compassionate response with references to relevant concepts from the Bhagavad Gita.
    ${language === 'hindi' ? " Please respond in Hindi language." : ""}`
    
    // Call Gemini API
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
    })

    const data = await response.json()
    
    // Validate Gemini API response
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Invalid Gemini API response:', data)
      return new Response(
        JSON.stringify({ 
          status: 'success',
          useFallback: true
        }),
        { headers: CORS_HEADERS, status: 200 }
      );
    }

    // Return successful response
    return new Response(
      JSON.stringify({ 
        answer: data.candidates[0].content.parts[0].text,
        status: 'success'
      }), 
      {
        headers: { ...CORS_HEADERS },
        status: 200
      }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    
    // Return successful response with useFallback flag
    return new Response(
      JSON.stringify({ 
        status: 'success',
        useFallback: true
      }),
      { 
        status: 200,
        headers: { ...CORS_HEADERS }
      }
    )
  }
})
