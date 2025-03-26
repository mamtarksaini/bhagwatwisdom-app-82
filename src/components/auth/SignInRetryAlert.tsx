
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface SignInRetryAlertProps {
  onRetry: () => void;
}

export function SignInRetryAlert({ onRetry }: SignInRetryAlertProps) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Authentication taking longer than expected</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>The sign-in process is taking longer than usual. This might be due to network issues.</p>
        <Button 
          variant="outline" 
          onClick={onRetry}
          className="mt-2"
        >
          Retry Authentication
        </Button>
      </AlertDescription>
    </Alert>
  );
}
