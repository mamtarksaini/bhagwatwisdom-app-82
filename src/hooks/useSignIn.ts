
import { useState, useRef, useEffect } from 'react';
import { useAuth } from "@/contexts/auth";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { z } from "zod";

export const signInFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export type SignInFormValues = z.infer<typeof signInFormSchema>;

interface UseSignInProps {
  onSuccess: () => void;
}

export function useSignIn({ onSuccess }: UseSignInProps) {
  const { signIn, status } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const navigate = useNavigate();
  const timeoutRef = useRef<number | null>(null);
  const maxRetries = 3;
  const [retryCount, setRetryCount] = useState(0);

  // Monitor auth status changes
  useEffect(() => {
    if (status === 'authenticated' && isLoading) {
      console.log("SignInForm: User authenticated, redirecting to home page");
      
      // Clear any pending timeouts
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      setIsLoading(false);
      setShowRetry(false);
      onSuccess();
      navigate('/');
    }
  }, [status, isLoading, onSuccess, navigate]);

  // Cleanup function to clear timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const resetState = () => {
    setIsLoading(false);
    setShowRetry(false);
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const performSignIn = async (email: string, password: string) => {
    console.log("SignInForm: Starting sign in with:", email);
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error("SignInForm: Error returned from signIn:", error);
        resetState();
        
        toast({
          title: "Sign in failed",
          description: error.message || "Invalid credentials. Please try again.",
          variant: "destructive",
        });
      } else {
        console.log("SignInForm: Sign in API call successful, waiting for auth state to update");
        
        // Set a timeout for checking authentication state
        timeoutRef.current = window.setTimeout(() => {
          if (status !== 'authenticated') {
            console.log("SignInForm: Auth state update timeout reached");
            setShowRetry(true);
            setIsLoading(false);
          }
        }, 5000); // Shorter 5-second timeout for better UX
      }
    } catch (error: any) {
      console.error("SignInForm: Exception during sign in:", error);
      resetState();
      
      toast({
        title: "Sign in failed",
        description: error?.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const retryAuthentication = async (email: string, password: string) => {
    setRetryCount(prevCount => prevCount + 1);
    
    if (retryCount >= maxRetries) {
      toast({
        title: "Too many retry attempts",
        description: "Please check your credentials and try again later.",
        variant: "destructive",
      });
      resetState();
      return;
    }
    
    setShowRetry(false);
    await performSignIn(email, password);
  };

  return {
    isLoading,
    showRetry,
    retryCount,
    performSignIn,
    retryAuthentication,
    setRetryCount
  };
}
