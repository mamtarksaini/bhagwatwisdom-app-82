
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
    
    // Add a timeout for the edge function call (reduced for better fallback)
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Edge function request timed out')), 8000)
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
      
      // Using verified working API keys for Gemini
      const FALLBACK_API_KEYS = [
        'AIzaSyCU28PvXUyLmp_wxj-g9WesUvLXSdFsCtM',
        'AIzaSyDfDU4BIRp9O9j1R8NDy5wUQLl4s3GZKHM',
        'AIzaSyAZQSouviq6f7djOiucP6U-NJIefRwdZ5g'
      ];
      
      // Try each fallback key in order until one works
      for (const fallbackKey of FALLBACK_API_KEYS) {
        try {
          console.log(`Trying fallback API key starting with ${fallbackKey.substring(0, 5)}...`);
          const result = await makeGeminiApiCall(prompt, fallbackKey);
          if (result) return result;
        } catch (keyError) {
          console.error(`Fallback key failed:`, keyError);
          // Continue to next key if this one fails
        }
      }
      
      console.error('All fallback API keys failed');
      return null;
    }
    
    console.log('Successfully retrieved API key from edge function');
    return await makeGeminiApiCall(prompt, edgeFunctionResponse.data.apiKey);
    
  } catch (error) {
    console.error('Error in callGeminiDirectly:', error);
    
    // Fall back to the hardcoded keys if any error occurs
    console.warn('Using fallback API keys due to error');
    const FALLBACK_API_KEYS = [
      'AIzaSyCU28PvXUyLmp_wxj-g9WesUvLXSdFsCtM',
      'AIzaSyDfDU4BIRp9O9j1R8NDy5wUQLl4s3GZKHM',
      'AIzaSyAZQSouviq6f7djOiucP6U-NJIefRwdZ5g'
    ];
    
    // Try each fallback key in order until one works
    for (const fallbackKey of FALLBACK_API_KEYS) {
      try {
        console.log(`Trying fallback API key starting with ${fallbackKey.substring(0, 5)}...`);
        const result = await makeGeminiApiCall(prompt, fallbackKey);
        if (result) return result;
      } catch (keyError) {
        console.error(`Fallback key failed:`, keyError);
        // Continue to next key if this one fails
      }
    }
    
    console.error('All fallback API keys failed');
    return null;
  }
}

// Separated API call logic to avoid code duplication
async function makeGeminiApiCall(prompt: string, apiKey: string) {
  try {
    console.log('Making Gemini API call with key starting with:', apiKey.substring(0, 5));
    
    // Use a timeout for the fetch request to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    // Ensure we're using the most up-to-date API URL and model name
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
    
    // Log the response structure to debug any unexpected formats
    console.log('Gemini API response received, checking structure...');
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Invalid Gemini API response structure:', data);
      throw new Error('Invalid Gemini API response structure');
    }
    
    // Log success
    console.log('Successfully received valid response from Gemini API');
    
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API call failed:', error);
    // Return null instead of throwing to allow fallback to next key
    return null;
  }
}
