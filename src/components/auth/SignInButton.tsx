
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SignInButtonProps {
  isLoading: boolean;
  text?: string;
  loadingText?: string;
}

export function SignInButton({ 
  isLoading, 
  text = "Sign In", 
  loadingText = "Signing in..." 
}: SignInButtonProps) {
  return (
    <Button 
      type="submit" 
      className="w-full button-gradient" 
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        text
      )}
    </Button>
  );
}
