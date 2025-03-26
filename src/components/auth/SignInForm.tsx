
import React, { useState, useEffect } from 'react';
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
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Monitor auth status changes
  useEffect(() => {
    if (status === 'authenticated' && isLoading) {
      console.log("SignInForm: User authenticated, redirecting to home page");
      setIsLoading(false);
      onSuccess();
      navigate('/');
    }
  }, [status, isLoading, onSuccess, navigate]);

  // Add a timeout to prevent infinite loading state
  useEffect(() => {
    let timeoutId: number;
    
    if (isLoading) {
      timeoutId = window.setTimeout(() => {
        if (isLoading) {
          console.log("SignInForm: Sign-in timeout reached, resetting state");
          setIsLoading(false);
          toast({
            title: "Sign in timeout",
            description: "The sign-in process took too long. Please try again.",
            variant: "destructive",
          });
        }
      }, 10000); // 10-second timeout
    }
    
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [isLoading]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isLoading) {
      console.log("SignInForm: Submit prevented: Already processing a request");
      return;
    }
    
    console.log("SignInForm: Starting sign in with:", values.email);
    setIsLoading(true);
    
    try {
      const { error } = await signIn(values.email, values.password);
      
      if (error) {
        console.error("SignInForm: Error returned from signIn:", error);
        setIsLoading(false);
        
        toast({
          title: "Sign in failed",
          description: error.message || "Invalid credentials. Please try again.",
          variant: "destructive",
        });
      } else {
        console.log("SignInForm: Sign in API call successful, waiting for auth state to update");
        // We'll let the useEffect handle success since it listens for auth state changes
        
        // Add a safety check in case the auth state doesn't update
        setTimeout(() => {
          if (isLoading && status !== 'authenticated') {
            console.log("SignInForm: Auth state did not update after successful API call");
            setIsLoading(false);
            
            // Attempt to refresh the page to reset state
            window.location.reload();
          }
        }, 5000); // 5-second safety check
      }
    } catch (error: any) {
      console.error("SignInForm: Exception during sign in:", error);
      setIsLoading(false);
      
      toast({
        title: "Sign in failed",
        description: error?.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          onClick={() => {
            if (isLoading) {
              // Allow force-click if stuck in loading state for over 5 seconds
              const forceReset = window.confirm("Sign-in seems to be taking a while. Do you want to reset and try again?");
              if (forceReset) {
                setIsLoading(false);
              }
            }
          }}
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
