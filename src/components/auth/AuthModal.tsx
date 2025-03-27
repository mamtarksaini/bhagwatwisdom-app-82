
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-gradient">Authentication Disabled</DialogTitle>
          <DialogDescription>
            Sign-in and sign-up features have been temporarily disabled.
          </DialogDescription>
        </DialogHeader>
        
        <Alert variant="info" className="mt-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Authentication features have been removed to resolve system issues. 
            Please continue as a guest user.
          </AlertDescription>
        </Alert>
      </DialogContent>
    </Dialog>
  );
}
