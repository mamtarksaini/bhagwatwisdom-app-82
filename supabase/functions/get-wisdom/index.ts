
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

serve(async (req) => {
  try {
    // Validate API key
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured in environment variables')
    }

    // Validate request
    const { question, category, language } = await req.json()
    if (!question || !category || !language) {
      throw new Error('Missing required fields: question, category, or language')
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
      throw new Error('Invalid response from Gemini API')
    }

    // Return successful response
    return new Response(
      JSON.stringify({ 
        answer: data.candidates[0].content.parts[0].text,
        status: 'success'
      }), 
      {
        headers: { "Content-Type": "application/json" },
        status: 200
      }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        error: error.message,
        status: 'error'
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    )
  }
})
