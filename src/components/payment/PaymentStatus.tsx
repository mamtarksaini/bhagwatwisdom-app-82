
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Info, CheckCircle, Loader2 } from 'lucide-react';

export function PaymentStatus() {
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshUserData } = useAuth();
  const [processed, setProcessed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [activationSuccess, setActivationSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('status');
    const provider = params.get('provider');
    const activated = params.get('activated');
    
    console.log('PaymentStatus: Processing status:', status, 'provider:', provider, 'activated:', activated);
    
    if (!status || processed) return;
    
    // Process the payment status once
    const processStatus = async () => {
      setProcessed(true);
      
      // First show the processing state
      if (status === 'success') {
        setProcessing(true);
      }
      
      if (status === 'success') {
        // Add a delay before showing success message to simulate processing time
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Now turn off processing state
        setProcessing(false);
        
        // Check if premium was activated
        if (activated === 'true') {
          setActivationSuccess(true);
        }
        
        // Show toast notification
        toast({
          title: "Payment successful",
          description: "Thank you for your purchase! Your premium access has been activated.",
          variant: "default", // Changed from "success" to "default" to fix type error
          duration: 10000 // Increased duration for better visibility
        });
        
        // For demo purposes, show info about the demo payment flow
        if (provider === 'paypal') {
          setMessage("Your premium features are now active! This is a demo payment flow that simulates a real payment process.");
          
          // Refresh user data to update premium status
          if (refreshUserData) {
            try {
              await refreshUserData();
              console.log('PaymentStatus: User data refreshed after payment');
            } catch (error) {
              console.error('Error refreshing user data:', error);
            }
          }
        }
        
        // Clear the URL parameters after processing with a delay
        setTimeout(() => {
          navigate('/pricing', { replace: true });
        }, 15000); // Increased timeout for better visibility of the success message
      } else if (status === 'cancelled') {
        toast({
          title: "Payment cancelled",
          description: "Your payment process was cancelled. No charges were made.",
          variant: "default",
          duration: 5000
        });
        
        // Clear the URL parameters after processing
        setTimeout(() => {
          navigate('/pricing', { replace: true });
        }, 3000);
      } else if (status === 'error') {
        const errorMessage = params.get('message') || 'There was an error processing your payment.';
        
        toast({
          title: "Payment error",
          description: errorMessage,
          variant: "destructive",
          duration: 8000
        });
        
        // Clear the URL parameters after processing
        setTimeout(() => {
          navigate('/pricing', { replace: true });
        }, 3000);
      }
    };
    
    // Execute the processing with a slight delay to ensure UI is ready
    const timer = setTimeout(() => {
      processStatus();
    }, 500);
    
    return () => {
      clearTimeout(timer);
    };
  }, [location.search, navigate, refreshUserData, processed]);
  
  // If we are still processing, show a processing message
  if (processing) {
    return (
      <Alert className="mb-4 border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertTitle>Processing Your Payment</AlertTitle>
        <AlertDescription>Please wait while we finalize your payment and activate your premium features...</AlertDescription>
      </Alert>
    );
  }
  
  // If we have a message to display, show it in an alert
  if (message) {
    return (
      <Alert variant={activationSuccess ? "default" : "info"} className={`mb-4 ${activationSuccess ? "border-green-500 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-300 dark:border-green-800" : ""}`}>
        {activationSuccess ? 
          <CheckCircle className="h-4 w-4" /> : 
          <Info className="h-4 w-4" />
        }
        <AlertTitle>{activationSuccess ? "Premium Activated" : "Test Mode Active"}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    );
  }
  
  return null;
}
