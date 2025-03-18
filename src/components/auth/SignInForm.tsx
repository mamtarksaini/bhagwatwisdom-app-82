
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
      console.log("SignInForm: User is authenticated, calling onSuccess");
      setIsLoading(false);
      onSuccess();
    }
  }, [status, isLoading, onSuccess]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isLoading) {
      console.log("SignInForm: Submit prevented: Already processing a request");
      return;
    }
    
    setIsLoading(true);
    console.log("SignInForm: Starting sign in with:", values.email);
    
    try {
      const { error } = await signIn(values.email, values.password);
      
      if (error) {
        console.error("SignInForm: Error returned from signIn:", error);
        setIsLoading(false);
      } else {
        console.log("SignInForm: Sign in API call successful");
        // We'll let the useEffect handle success since it listens for auth state changes
      }
    } catch (error: any) {
      console.error("SignInForm: Exception during sign in:", error);
      toast({
        title: "Sign in failed",
        description: error?.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
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
