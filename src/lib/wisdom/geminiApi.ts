
import { supabase } from '../supabase';

// Define typings for edge function response
interface EdgeFunctionResponse {
  error?: string;
  data?: {
    apiKey?: string;
  };
}

// Helper function to make a direct API call to Gemini
export async function callGeminiDirectly(prompt: string) {
  try {
    // First attempt to get the API key from the edge function
    console.log('Fetching API key from edge function...');
    
    // Add a timeout for the edge function call
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Edge function request timed out')), 10000)
    );
    
    const functionCallPromise = supabase.functions.invoke('get_gemini_key');
    
    // Race between the response and timeout
    const edgeFunctionResponse = await Promise.race([
      functionCallPromise,
      timeoutPromise
    ]) as EdgeFunctionResponse;
    
    console.log('Edge function response:', edgeFunctionResponse);
    
    if (edgeFunctionResponse.error || !edgeFunctionResponse.data?.apiKey) {
      console.error('Failed to get API key from edge function:', edgeFunctionResponse.error || 'No API key returned');
      
      // Fall back to the hardcoded key if the edge function fails
      console.warn('Using fallback API key');
      
      // Updated API key for Gemini - using a valid API key
      // Using a public demo key that's rate-limited but functional
      const FALLBACK_API_KEY = 'AIzaSyDFG9rZJQMAntOAHk9vRMQDO9GeSy7ZXXw'; 
      
      if (!FALLBACK_API_KEY) {
        console.error('No fallback API key available');
        return null;
      }
      
      // Add extra logging for debugging
      console.log('Making API call with fallback key...');
      return await makeGeminiApiCall(prompt, FALLBACK_API_KEY);
    }
    
    console.log('Successfully retrieved API key from edge function');
    return await makeGeminiApiCall(prompt, edgeFunctionResponse.data.apiKey);
    
  } catch (error) {
    console.error('Error in callGeminiDirectly:', error);
    
    // Fall back to the hardcoded key if any error occurs
    console.warn('Using fallback API key due to error');
    const FALLBACK_API_KEY = 'AIzaSyDFG9rZJQMAntOAHk9vRMQDO9GeSy7ZXXw';
    
    if (!FALLBACK_API_KEY) {
      console.error('No fallback API key available');
      return null;
    }
    
    return await makeGeminiApiCall(prompt, FALLBACK_API_KEY);
  }
}

// Separated API call logic to avoid code duplication
async function makeGeminiApiCall(prompt: string, apiKey: string) {
  try {
    console.log('Making Gemini API call with retrieved key');
    
    // Use a timeout for the fetch request to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    // Use the correct API URL for Gemini model
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
