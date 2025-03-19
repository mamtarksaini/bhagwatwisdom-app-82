import { useState } from 'react';
import { determineResponseCategory, fallbackWisdomResponses, getWisdomResponse } from "@/lib/wisdom";
import { Language } from "@/types";
import { toast } from "@/components/ui/use-toast";

export function useProblemSolver(language: Language, isPremium: boolean = false) {
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [networkError, setNetworkError] = useState(false);
  const [directApiUsed, setDirectApiUsed] = useState(false);
  const [aiServiceUnavailable, setAiServiceUnavailable] = useState(false);
  const [errorDetails, setErrorDetails] = useState("");

  const handleReset = () => {
    setProblem("");
    setSolution("");
    setUsingFallback(false);
    setRetryCount(0);
    setNetworkError(false);
    setDirectApiUsed(false);
    setAiServiceUnavailable(false);
    setErrorDetails("");
  };

  const handleRetry = async () => {
    if (problem && !isLoading) {
      setRetryCount(prev => prev + 1);
      setIsLoading(true);
      setUsingFallback(false);
      setNetworkError(false);
      setDirectApiUsed(false);
      setAiServiceUnavailable(false);
      setErrorDetails("");
      
      toast({
        title: "Retrying AI connection",
        description: "Attempting to connect to wisdom services again.",
      });
      
      try {
        await handleSubmitInternal(true);
      } catch (error) {
        console.error("Retry failed:", error);
        toast({
          title: "Retry failed",
          description: "Unable to connect to any wisdom service. Using offline guidance.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmitInternal = async (isRetry = false) => {
    try {
      // Determine the category of the problem
      const category = determineResponseCategory(problem);
      console.log('Determined category:', category);
      
      // Track the original direct API state before the call
      const wasDirectApiUsed = directApiUsed;
      
      // Get wisdom response
      const response = await getWisdomResponse(category, language, problem);
      
      if (response.answer) {
        setSolution(response.answer);
        setErrorDetails(response.errorDetails || "");
        
        // Check if we're using fallback by comparing with fallback responses
        if (response.isFallback) {
          setUsingFallback(true);
          
          if (response.isApiKeyIssue) {
            setAiServiceUnavailable(true);
            if (isPremium) {
              toast({
                title: "API Key Configuration Issue",
                description: response.errorDetails || "Please check the GEMINI_API_KEY in Supabase Edge Function secrets.",
                variant: "destructive"
              });
            }
          } else if (response.isNetworkIssue) {
            setNetworkError(true);
            if (isPremium) {
              toast({
                title: "Network Connection Issue",
                description: "Unable to connect to wisdom services. Check Edge Function deployment.",
                variant: "destructive"
              });
            }
          } else {
            if (isPremium) {
              toast({
                title: "Using offline guidance",
                description: "Please ensure the Edge Function is deployed and API keys are properly configured.",
              });
            }
          }
        } else {
          setUsingFallback(false);
          
          // If we were previously using directApi and still are, keep the flag
          // otherwise, we must have successfully used the edge function, so reset the flag
          setDirectApiUsed(directApiUsed && wasDirectApiUsed);
          
          setNetworkError(false);
          setAiServiceUnavailable(false);
          setErrorDetails("");
          
          if (!isRetry) {
            toast({
              title: "AI wisdom found",
              description: "AI-powered guidance is now available for your reflection.",
              variant: "success"
            });
          }
        }
      } else {
        console.error('No response received from getWisdomResponse');
        setUsingFallback(true);
        setErrorDetails("No response from wisdom services");
        
        toast({
          title: "API Configuration Issue",
          description: "Unable to get a response from wisdom services.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Error getting wisdom:", error);
      
      // Check for specific API key issues
      const isApiKeyIssue = 
        error.message?.includes('API key') || 
        error.message?.includes('unauthorized') ||
        error.message?.includes('invalid key') ||
        error.message?.includes('API authentication');
      
      // Check for network error specifically
      const isNetworkError = 
        error.message?.includes('Failed to fetch') || 
        error.message?.includes('Network Error') ||
        error.message?.includes('Failed to connect to wisdom service') ||
        error.message?.includes('Failed to send a request');
      
      // Check for AI service unavailable specifically
      const isAiServiceUnavailable = 
        error.message?.includes('AI service unavailable') || 
        error.message?.includes('All wisdom services unavailable') ||
        error.message?.includes('API error') ||
        isApiKeyIssue;
      
      setNetworkError(isNetworkError);
      setAiServiceUnavailable(isAiServiceUnavailable);
      setErrorDetails(error.message || "Unknown error occurred");
      
      const responses = fallbackWisdomResponses[language] || fallbackWisdomResponses.english;
      const category = determineResponseCategory(problem);
      const fallbackResponse = responses[category] || responses.default;
      
      setSolution(fallbackResponse);
      setUsingFallback(true);
      
      // Don't show redundant toasts during retries
      if (!isRetry) {
        if (isApiKeyIssue) {
          toast({
            title: "API Key Configuration Issue",
            description: "The Gemini API key appears to be invalid or missing. Please check your Supabase Edge Function secrets.",
            variant: "destructive"
          });
        } else if (isAiServiceUnavailable) {
          toast({
            title: "AI Service Unavailable",
            description: "Please try again later. Showing offline wisdom.",
            variant: "destructive"
          });
        } else if (isNetworkError) {
          toast({
            title: "Connection Error",
            description: "Unable to connect to wisdom services. Showing offline wisdom.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Service Error",
            description: "An error occurred. Showing offline wisdom.",
            variant: "destructive"
          });
        }
      }
    }
  };

  const handleSubmit = async () => {
    if (!problem.trim() || isLoading) return;
    
    setIsLoading(true);
    setUsingFallback(false);
    setNetworkError(false);
    setAiServiceUnavailable(false);
    setErrorDetails("");
    setSolution(""); // Clear previous solution
    
    // Show loading toast
    const loadingToast = toast({
      title: "Processing your request",
      description: "Finding wisdom to guide you..."
    });
    
    console.log('Submitting problem:', { problem, language });
    
    try {
      await handleSubmitInternal();
    } finally {
      loadingToast.dismiss();
      setIsLoading(false);
    }
  };

  return {
    problem,
    setProblem,
    solution,
    isLoading,
    usingFallback,
    networkError,
    directApiUsed,
    aiServiceUnavailable,
    errorDetails,
    handleReset,
    handleSubmit,
    handleRetry,
    retryCount
  };
}
