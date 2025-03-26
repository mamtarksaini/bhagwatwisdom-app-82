
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
      
      // Updated API key (make sure this is a valid Gemini API key)
      const FALLBACK_API_KEY = 'AIzaSyDFgEV8YgD7CHtKlINtHE2YeAGiNJzCGe4'; 
      
      if (!FALLBACK_API_KEY) {
        console.error('No fallback API key available');
        return null;
      }
      
      // Add extra logging for debugging
      console.log('Making API call with fallback key...');
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
    
    // Use a timeout for the fetch request to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    // FIXED: Use the correct API URL for Gemini model
    // Changed from v1/models/gemini-pro:generateContent to v1/models/gemini-1.5-pro:generateContent
    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent', {
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
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Log response status for debugging
    console.log(`Direct Gemini API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error details:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid Gemini API response structure');
    }
    
    // Log success
    console.log('Successfully received response from Gemini API');
    
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API call failed:', error);
    return null;
  }
}
