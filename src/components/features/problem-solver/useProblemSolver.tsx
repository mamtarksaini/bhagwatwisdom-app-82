
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

  const handleReset = () => {
    setProblem("");
    setSolution("");
    setUsingFallback(false);
    setRetryCount(0);
  };

  const handleRetry = async () => {
    if (problem && !isLoading) {
      setRetryCount(prev => prev + 1);
      setIsLoading(true);
      setUsingFallback(false);
      
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
          description: "Please ensure the Gemini API key is properly configured in Supabase Edge Function secrets.",
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
              description: "Please ensure the GEMINI_API_KEY is properly configured in Supabase Edge Function secrets.",
            });
          }
        } else {
          setUsingFallback(false);
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
          description: "Please ensure the GEMINI_API_KEY is properly configured in Supabase Edge Function secrets.",
        });
      }
    } catch (error) {
      console.error("Error getting wisdom:", error);
      
      const responses = fallbackWisdomResponses[language] || fallbackWisdomResponses.english;
      const category = determineResponseCategory(problem);
      const fallbackResponse = responses[category] || responses.default;
      
      setSolution(fallbackResponse);
      setUsingFallback(true);
      
      toast({
        title: "AI Service Unavailable",
        description: "Please ensure the GEMINI_API_KEY is properly configured in Supabase Edge Function secrets.",
      });
    }
  };

  const handleSubmit = async () => {
    if (!problem.trim() || isLoading) return;
    
    setIsLoading(true);
    setUsingFallback(false);
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
    handleReset,
    handleSubmit,
    handleRetry,
    retryCount
  };
}
