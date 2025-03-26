
import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SignInButton } from "./SignInButton";
import { SignInRetryAlert } from "./SignInRetryAlert";
import { useSignIn, signInFormSchema, SignInFormValues } from "@/hooks/useSignIn";

interface SignInFormProps {
  onSuccess: () => void;
}

export function SignInForm({ onSuccess }: SignInFormProps) {
  const {
    isLoading,
    showRetry,
    retryCount,
    performSignIn,
    retryAuthentication,
    setRetryCount
  } = useSignIn({ onSuccess });

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: SignInFormValues) {
    if (isLoading) {
      console.log("SignInForm: Submit prevented: Already processing a request");
      return;
    }
    
    setRetryCount(0);
    await performSignIn(values.email, values.password);
  }

  const handleRetry = () => {
    const values = form.getValues();
    retryAuthentication(values.email, values.password);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {showRetry && <SignInRetryAlert onRetry={handleRetry} />}
        
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
        
        <SignInButton isLoading={isLoading} />
      </form>
    </Form>
  );
}
