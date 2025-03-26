
import React, { useState, useEffect, useRef } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

interface SignInFormProps {
  onSuccess: () => void;
}

export function SignInForm({ onSuccess }: SignInFormProps) {
  const { signIn, status } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const navigate = useNavigate();
  const timeoutRef = useRef<number | null>(null);
  const maxRetries = 3;
  const [retryCount, setRetryCount] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Cleanup function to clear timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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

  const resetState = () => {
    setIsLoading(false);
    setShowRetry(false);
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Function to retry authentication
  const retryAuthentication = async () => {
    const values = form.getValues();
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
    await performSignIn(values.email, values.password);
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
        }, 8000); // Shorter 8-second timeout for better UX
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isLoading) {
      console.log("SignInForm: Submit prevented: Already processing a request");
      return;
    }
    
    setRetryCount(0);
    await performSignIn(values.email, values.password);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {showRetry && (
          <Alert variant="destructive">
            <AlertTitle>Authentication taking longer than expected</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              <p>The sign-in process is taking longer than usual. This might be due to network issues.</p>
              <Button 
                variant="outline" 
                onClick={retryAuthentication}
                className="mt-2"
              >
                Retry Authentication
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full button-gradient" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
    </Form>
  );
}
