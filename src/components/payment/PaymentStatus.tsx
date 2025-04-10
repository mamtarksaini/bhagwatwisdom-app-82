
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Info, CheckCircle } from 'lucide-react';

export function PaymentStatus() {
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshUserData } = useAuth();
  const [processed, setProcessed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [activationSuccess, setActivationSuccess] = useState(false);
  
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
      
      if (status === 'success') {
        // Check if premium was activated
        if (activated === 'true') {
          setActivationSuccess(true);
        }
        
        // Show toast notification
        toast({
          title: "Payment successful",
          description: "Thank you for your purchase! Your premium access has been activated.",
          variant: "success",
          duration: 8000 // Increased duration for better visibility
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
        }, 5000); // Increased timeout for better visibility
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
  
  // If we have a message to display, show it in an alert
  if (message) {
    return (
      <Alert variant={activationSuccess ? "success" : "info"} className="mb-4">
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
