
import { useState } from 'react';
import { determineResponseCategory, fallbackWisdomResponses, getWisdomResponse } from "@/lib/wisdom";
import { Language } from "@/types";
import { toast } from "@/hooks/use-toast";
import { PLAN_FEATURES, hasFeature, hasExceededLimit } from "@/constants/pricingPlans";

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
  const [usedInteractions, setUsedInteractions] = useState(0);

  // Get the user's plan - in a real app, this would come from the auth context
  const userPlanId = isPremium ? "pro" : "basic";

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
    // Check if user has access to advanced features
    if (!isPremium && !hasFeature(userPlanId, "Personalized mantras")) {
      toast({
        title: "Premium feature",
        description: "Upgrade to premium to retry with advanced AI processing.",
        variant: "destructive"
      });
      return;
    }

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
        variant: "default"
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
      
      // Get wisdom response - try edge function first, then direct API
      console.log('Calling getWisdomResponse with problem:', problem.substring(0, 30) + '...');
      const response = await getWisdomResponse(category, language, problem);
      console.log('Response from getWisdomResponse:', response);
      
      if (response.answer) {
        setSolution(response.answer);
        setErrorDetails(response.errorDetails || "");
        
        // Check if we're using fallback by comparing with fallback responses
        if (response.isFallback) {
          setUsingFallback(true);
          
          if (response.isApiKeyIssue) {
            setAiServiceUnavailable(true);
            toast({
              title: "API Key Configuration Issue",
              description: "Please check the GEMINI_API_KEY in Supabase Edge Function secrets.",
              variant: "destructive"
            });
          } else if (response.isNetworkIssue) {
            setNetworkError(true);
            toast({
              title: "Network Connection Issue",
              description: "Unable to connect to wisdom services. Check Edge Function deployment.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Using offline guidance",
              description: "Unable to connect to AI services. Showing offline wisdom.",
              variant: "default"
            });
          }
        } else {
          setUsingFallback(false);
          setDirectApiUsed(response.isDirectApiUsed || false);
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
      const isNetworkIssue = 
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
      
      setNetworkError(isNetworkIssue);
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
        } else if (isNetworkIssue) {
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
    
    // Check if user has exceeded their plan's interaction limit
    if (hasExceededLimit(userPlanId, usedInteractions)) {
      toast({
        title: "Interaction limit reached",
        description: "You've reached your plan's monthly limit. Please upgrade to continue.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setUsingFallback(false);
    setNetworkError(false);
    setAiServiceUnavailable(false);
    setErrorDetails("");
    setSolution(""); // Clear previous solution
    
    // Show loading toast
    const loadingToast = toast({
      title: "Processing your request",
      description: "Finding wisdom to guide you...",
      variant: "default"
    });
    
    console.log('Submitting problem:', { problem, language });
    
    try {
      await handleSubmitInternal();
      
      // Increment the used interactions count
      setUsedInteractions(prev => prev + 1);
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
    retryCount,
    usedInteractions,
    userPlanId
  };
}
