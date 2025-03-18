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

  const handleReset = () => {
    setProblem("");
    setSolution("");
    setUsingFallback(false);
    setRetryCount(0);
    setNetworkError(false);
    setDirectApiUsed(false);
  };

  const handleRetry = async () => {
    if (problem && !isLoading) {
      setRetryCount(prev => prev + 1);
      setIsLoading(true);
      setUsingFallback(false);
      setNetworkError(false);
      setDirectApiUsed(false);
      
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
      
      if (response) {
        setSolution(response);
        
        // Check if we're using fallback by comparing with fallback responses
        const fallbackResponses = fallbackWisdomResponses[language] || fallbackWisdomResponses.english;
        const fallbackResponse = fallbackResponses[category] || fallbackResponses.default;
        
        if (response === fallbackResponse) {
          setUsingFallback(true);
          if (isPremium) {
            // Only show toast for premium users
            toast({
              title: "Using offline guidance",
              description: "Please ensure the Edge Function is deployed and API keys are properly configured.",
            });
          }
        } else {
          setUsingFallback(false);
          
          // If we were previously using directApi and still are, keep the flag
          // otherwise, we must have successfully used the edge function, so reset the flag
          setDirectApiUsed(directApiUsed && wasDirectApiUsed);
          
          setNetworkError(false);
          
          if (!isRetry) {
            toast({
              title: "AI wisdom found",
              description: "AI-powered guidance is now available for your reflection.",
            });
          }
        }
      } else {
        console.error('No response received from getWisdomResponse');
        const responses = fallbackWisdomResponses[language] || fallbackWisdomResponses.english;
        const fallbackResponse = responses[category] || responses.default;
        setSolution(fallbackResponse);
        setUsingFallback(true);
        
        toast({
          title: "API Configuration Issue",
          description: "Unable to get a response from wisdom services.",
        });
      }
    } catch (error: any) {
      console.error("Error getting wisdom:", error);
      
      // Check for network error specifically
      const isNetworkError = 
        error.message?.includes('Failed to fetch') || 
        error.message?.includes('Network Error') ||
        error.message?.includes('Failed to connect to wisdom service') ||
        error.message?.includes('Failed to send a request');
      
      setNetworkError(isNetworkError);
      
      const responses = fallbackWisdomResponses[language] || fallbackWisdomResponses.english;
      const category = determineResponseCategory(problem);
      const fallbackResponse = responses[category] || responses.default;
      
      setSolution(fallbackResponse);
      setUsingFallback(true);
      
      // Don't show redundant toasts during retries
      if (!isRetry) {
        toast({
          title: isNetworkError ? "Connection Error" : "AI Service Unavailable",
          description: isNetworkError 
            ? "Unable to connect to wisdom services. Showing offline wisdom."
            : "Please try again later. Showing offline wisdom.",
          variant: "destructive"
        });
      }
    }
  };

  const handleSubmit = async () => {
    if (!problem.trim() || isLoading) return;
    
    setIsLoading(true);
    setUsingFallback(false);
    setNetworkError(false);
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
    handleReset,
    handleSubmit,
    handleRetry,
    retryCount
  };
}
