
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

interface SignUpFormProps {
  onSuccess: () => void;
}

export function SignUpForm({ onSuccess }: SignUpFormProps) {
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // Function to resend verification email
  const handleResendVerification = async () => {
    if (!userEmail) return;
    
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
      });
      
      if (error) {
        toast({
          title: "Error sending verification email",
          description: error.message || "Please try again later.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Verification email sent",
          description: "Please check your inbox or spam folder.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error sending verification email",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("SignUpForm: Starting sign up with:", values.email);
    setIsLoading(true);
    setUserEmail(values.email);
    
    try {
      console.log("SignUpForm: About to call signUp with email:", values.email, "and name:", values.name);
      
      // Call the signUp function from AuthContext
      const { error } = await signUp(values.email, values.password, values.name);
      
      if (error) {
        console.error("SignUpForm: Error during sign up:", error);
        
        // Special handling for common errors
        if (error.message?.includes('already registered')) {
          toast({
            title: "Email already registered",
            description: "Please sign in instead, or use a different email address.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign up failed",
            description: error.message || "An unexpected error occurred. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        console.log("SignUpForm: Sign up successful, triggering onSuccess");
        
        // Double-check session to confirm signup was successful
        const { data: sessionData } = await supabase.auth.getSession();
        console.log("SignUpForm: Current session after signup:", sessionData?.session ? "exists" : "null");
        
        if (sessionData?.session) {
          console.log("SignUpForm: User ID from session:", sessionData.session.user.id);
          console.log("SignUpForm: User email from session:", sessionData.session.user.email);
        }
        
        // Show the verification alert and success toast
        setShowVerificationAlert(true);
        
        toast({
          title: "Account created",
          description: "You need to check your email for a verification link before you can log in. If you don't see it, check your spam folder.",
        });
        
        // In development environment, you might need to disable email verification in Supabase
        onSuccess();
      }
    } catch (error: any) {
      console.error("SignUpForm: Exception during sign up:", error);
      toast({
        title: "Sign up failed",
        description: error?.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {showVerificationAlert && (
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Email Verification Required</AlertTitle>
          <AlertDescription>
            Please check your email for a verification link. If you don't see it in your inbox, please check your spam folder.
            <Button 
              variant="link" 
              className="p-0 h-auto font-normal" 
              onClick={handleResendVerification}
              disabled={isLoading}
            >
              Resend verification email
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
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
                Creating account...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
