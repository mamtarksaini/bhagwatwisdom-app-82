
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

  const handleReset = () => {
    setProblem("");
    setSolution("");
    setUsingFallback(false);
    setRetryCount(0);
    setNetworkError(false);
  };

  const handleRetry = async () => {
    if (problem && !isLoading) {
      setRetryCount(prev => prev + 1);
      setIsLoading(true);
      setUsingFallback(false);
      setNetworkError(false);
      
      toast({
        title: "Retrying AI connection",
        description: "Attempting to connect to our wisdom servers again.",
      });
      
      try {
        await handleSubmitInternal(true);
      } catch (error) {
        console.error("Retry failed:", error);
        toast({
          title: "Retry failed",
          description: "Please ensure the Edge Function is deployed and the Gemini API key is properly configured.",
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
              description: "Please ensure the Edge Function is deployed and the GEMINI_API_KEY is properly configured.",
            });
          }
        } else {
          setUsingFallback(false);
          setNetworkError(false);
          toast({
            title: "AI wisdom found",
            description: "AI-powered guidance is now available for your reflection.",
          });
        }
      } else {
        console.error('No response received from getWisdomResponse');
        const responses = fallbackWisdomResponses[language] || fallbackWisdomResponses.english;
        const fallbackResponse = responses[category] || responses.default;
        setSolution(fallbackResponse);
        setUsingFallback(true);
        
        toast({
          title: "API Configuration Issue",
          description: "Please ensure the Edge Function is deployed and the GEMINI_API_KEY is properly configured.",
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
      
      toast({
        title: isNetworkError ? "Edge Function Connection Error" : "AI Service Unavailable",
        description: isNetworkError 
          ? "Unable to connect to the Edge Function. Please ensure it is deployed correctly."
          : "Please ensure the GEMINI_API_KEY is properly configured in Supabase Edge Function Secrets.",
        variant: "destructive"
      });
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
    handleReset,
    handleSubmit,
    handleRetry,
    retryCount
  };
}
