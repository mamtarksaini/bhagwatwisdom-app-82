
import { supabase } from '../supabase';

// Helper function to make a direct API call to Gemini
export async function callGeminiDirectly(prompt: string) {
  try {
    // First attempt to get the API key from the edge function
    console.log('Fetching API key from edge function...');
    const { data, error } = await supabase.functions.invoke('get_gemini_key');
    
    if (error || !data?.apiKey) {
      console.error('Failed to get API key from edge function:', error || 'No API key returned');
      
      // Fall back to the hardcoded key if the edge function fails
      console.warn('Using fallback API key');
      const FALLBACK_API_KEY = 'AIzaSyDFgEV8YgD7CHtKlINtHE2YeAGiNJzCGe4';
      
      if (!FALLBACK_API_KEY) {
        console.error('No fallback API key available');
        return null;
      }
      
      return await makeGeminiApiCall(prompt, FALLBACK_API_KEY);
    }
    
    console.log('Successfully retrieved API key from edge function');
    return await makeGeminiApiCall(prompt, data.apiKey);
    
  } catch (error) {
    console.error('Error in callGeminiDirectly:', error);
    return null;
  }
}

// Separated API call logic to avoid code duplication
async function makeGeminiApiCall(prompt: string, apiKey: string) {
  try {
    console.log('Making Gemini API call with retrieved key');
    
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
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
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid Gemini API response structure');
    }
    
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API call failed:', error);
    return null;
  }
}
