
import { useState } from 'react';
import { determineResponseCategory, fallbackWisdomResponses, getWisdomResponse } from "@/lib/wisdom";
import { Language } from "@/types";
import { toast } from "@/components/ui/use-toast";

export function useProblemSolver(language: Language, isPremium: boolean = false) {
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  const handleReset = () => {
    setProblem("");
    setSolution("");
    setUsingFallback(false);
  };

  const handleSubmit = async () => {
    if (!problem.trim()) return;
    
    setIsLoading(true);
    setUsingFallback(false);
    setSolution(""); // Clear previous solution
    console.log('Submitting problem:', { problem, language });
    
    try {
      // Determine the category of the problem
      const category = determineResponseCategory(problem);
      console.log('Determined category:', category);
      
      // Get wisdom response with a timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out')), 15000)
      );
      
      const responsePromise = getWisdomResponse(category, language, problem);
      
      // Race between the response and timeout
      const response = await Promise.race([responsePromise, timeoutPromise]) as string;
      
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
              description: "We're currently providing wisdom from our local database. AI-generated responses will be available soon.",
              variant: "default",
            });
          }
        }
      } else {
        console.error('No response received from getWisdomResponse');
        const responses = fallbackWisdomResponses[language] || fallbackWisdomResponses.english;
        const fallbackResponse = responses[category] || responses.default;
        setSolution(fallbackResponse);
        setUsingFallback(true);
      }
    } catch (error) {
      console.error("Error getting wisdom:", error);
      
      const responses = fallbackWisdomResponses[language] || fallbackWisdomResponses.english;
      const category = determineResponseCategory(problem);
      const fallbackResponse = responses[category] || responses.default;
      
      setSolution(fallbackResponse);
      setUsingFallback(true);
    } finally {
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
    handleSubmit
  };
}
