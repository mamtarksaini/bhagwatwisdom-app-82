
import { Language } from '@/types';
import { supabase } from '../supabase';
import { WisdomResponse } from './types';
import { callGeminiDirectly } from './geminiApi';
import { determineResponseCategory } from './categoryDetermination';
import { constructPrompt, getFallbackResponse, isApiKeyError, isNetworkError } from './utils';
import { fallbackWisdomResponses } from './fallbackResponses';

// Re-export utility functions and constants that need to be available externally
export { determineResponseCategory, fallbackWisdomResponses };

// Main function to get wisdom from Supabase Edge Function or direct API call
export async function getWisdomResponse(category: string, language: Language, question: string): Promise<WisdomResponse> {
  try {
    console.log('Calling get-wisdom function with:', { category, language, question });
    
    // Construct prompt for modern relevance
    const prompt = constructPrompt(question, category, language);
    
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
      
      console.log('Edge function response:', edgeFunctionResponse);
      
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
        if (isApiKeyError(data.message || '')) {
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
        if (isApiKeyError(data.error || '') || isApiKeyError(data.message || '')) {
          throw new Error(`AI service unavailable: API key issue - ${data.error || 'check your API key'}`);
        }
        
        throw new Error(`AI service unavailable: ${data.error || 'Unknown reason'}`);
      }
  
      if (data && data.answer) {
        console.log('Got wisdom response from edge function:', data.answer.substring(0, 100) + '...');
        return {
          answer: data.answer,
          isFallback: false,
          isDirectApiUsed: false // Explicitly set to false when using edge function
        };
      }
    }
    
    // If edge function fails, try direct API as fallback
    console.warn('Edge Function failed, trying direct API');
    console.log('Calling Gemini directly with prompt');
    
    const directAnswer = await callGeminiDirectly(prompt);
    
    if (directAnswer) {
      console.log('Got wisdom response from direct API call:', directAnswer.substring(0, 100) + '...');
      
      return {
        answer: directAnswer,
        isFallback: false,
        isDirectApiUsed: true // Set to true when using direct API
      };
    }
    
    // If both methods fail, use fallback response
    console.warn('Both Edge Function and Direct API failed, using static fallback');
    
    // Check if the error is related to API key issues
    const errorMessage = edgeError instanceof Error ? edgeError.message : String(edgeError);
    const isApiKeyIssue = isApiKeyError(errorMessage);
      
    throw new Error(isApiKeyIssue 
      ? `AI service unavailable: API key issue - ${errorMessage}` 
      : 'All wisdom services unavailable');
    
  } catch (error) {
    console.error('Error fetching wisdom response:', error);
    
    // Extract error message
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Check if it's a network/connection error
    const isNetworkIssue = isNetworkError(errorMessage);
    
    // Check if it's an API key issue
    const isApiKeyIssue = isApiKeyError(errorMessage);
    
    // Get fallback response
    const response = getFallbackResponse(category, language);
    
    return {
      answer: response,
      isFallback: true,
      isNetworkIssue: isNetworkIssue,
      isApiKeyIssue: isApiKeyIssue,
      isDirectApiUsed: false, // Explicitly set to false for fallback
      errorDetails: errorMessage
    };
  }
}
