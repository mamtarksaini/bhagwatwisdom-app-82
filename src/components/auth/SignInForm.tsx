
import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

interface SignInFormProps {
  onSuccess: () => void;
}

export function SignInForm({ onSuccess }: SignInFormProps) {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isLoading) return; // Prevent multiple submissions
    setIsLoading(true);
    
    // Show immediate feedback that sign-in has started
    const pendingToastId = toast({
      title: "Signing in...",
      description: "Authenticating your credentials",
    });
    
    // Create a timeout for automatic fallback if the process takes too long
    let timeoutId: NodeJS.Timeout;
    
    // Create a promise that will resolve after a max timeout
    const timeoutPromise = new Promise((resolve) => {
      timeoutId = setTimeout(() => {
        toast({
          title: "Still working...",
          description: "Sign in is taking longer than expected. Please wait.",
        });
      }, 1500); // Show feedback sooner (1.5 seconds)
    });
    
    try {
      // Race the sign-in process with the timeout
      const { error } = await signIn(values.email, values.password);

      // Clear the timeout as we got a response
      clearTimeout(timeoutId);
      
      // Dismiss the pending toast
      if (pendingToastId) {
        pendingToastId.dismiss();
      }
      
      if (!error) {
        toast({
          title: "Sign in successful",
          description: "Welcome back!",
        });
        onSuccess();
      }
      // Error toast is already shown by the AuthContext's signIn function
      
    } catch (error) {
      console.error("Sign in error:", error);
      
      // Dismiss the pending toast
      if (pendingToastId) {
        pendingToastId.dismiss();
      }
      
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
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
        
        <Button type="submit" className="w-full button-gradient" disabled={isLoading}>
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
