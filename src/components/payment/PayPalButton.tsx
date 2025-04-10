
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import { createPaymentOrder, verifyPayment } from '@/services/paymentService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface PayPalButtonProps {
  planId: string;
  text?: string;
  className?: string;
  disabled?: boolean;
  onProcessingStart?: (provider: string) => void;
  onProcessingEnd?: () => void;
  onPaymentError?: (error: string) => void;
}

export function PayPalButton({ 
  planId, 
  text = "Pay with PayPal", 
  className,
  disabled = false,
  onProcessingStart,
  onProcessingEnd,
  onPaymentError
}: PayPalButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user, status, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const [timeoutId, setTimeoutId] = useState<number | null>(null);
  const [testModeActive, setTestModeActive] = useState(true); // Always use test mode for now
  
  // Clean up any ongoing processing and timeouts on component unmount
  useEffect(() => {
    return () => {
      cleanupProcessing();
    };
  }, []);

  const cleanupProcessing = () => {
    if (isLoading && onProcessingEnd) {
      onProcessingEnd();
      setIsLoading(false);
    }
    
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  };

  const handleClick = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to continue with your purchase.",
        variant: "destructive"
      });
      
      navigate('/auth');
      return;
    }
    
    if (isLoading || disabled) {
      console.log('PayPalButton: Already processing a payment or button is disabled. Please wait...');
      return;
    }
    
    try {
      setIsLoading(true);
      if (onProcessingStart) onProcessingStart('PayPal');
      
      // Set a timeout to cancel the operation if it takes too long
      const newTimeoutId = window.setTimeout(() => {
        console.log('PayPalButton: Payment initiation timeout reached');
        setIsLoading(false);
        if (onProcessingEnd) onProcessingEnd();
        setTimeoutId(null);
        
        toast({
          title: "Payment timeout",
          description: "The payment process took too long. Please try again.",
          variant: "destructive"
        });
      }, 7000); // 7-second timeout
      
      setTimeoutId(newTimeoutId);
      
      console.log('PayPalButton: Creating PayPal payment for plan:', planId);
      
      // In test mode, simulate a successful response
      if (testModeActive) {
        console.log('PayPalButton: Using PayPal test mode');
        
        // Clear the timeout
        if (timeoutId) {
          clearTimeout(timeoutId);
          setTimeoutId(null);
        }
        
        // Simulate a short delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Show test mode toast BEFORE ending the processing state
        toast({
          title: "Test Mode Active",
          description: "This is a demo of the PayPal payment flow. No actual payment is processed.",
          variant: "info",
          duration: 5000, // Increased duration for visibility
        });

        // Wait a moment for the toast to be visible
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // IMPORTANT: Make sure to end the processing state
        setIsLoading(false);
        if (onProcessingEnd) onProcessingEnd();
        
        // Use a direct window location change to ensure reliable redirect
        // We add a small delay to make sure the toast is visible
        setTimeout(() => {
          // Include user ID in redirect for premium activation
          const redirectUrl = `/pricing?status=success&provider=paypal&token=TEST_TOKEN&planId=${planId}&userId=${user.id}`;
          window.location.href = redirectUrl;
        }, 1000);
        
        return;
      }
      
      // Actual API call if not in test mode
      try {
        const orderData = await createPaymentOrder(planId, 'paypal');
        
        // Clear the timeout since we got a response
        if (timeoutId) {
          clearTimeout(timeoutId);
          setTimeoutId(null);
        }
        
        if (!orderData || !orderData.id) {
          // Check if the error indicates missing PayPal credentials
          if (orderData && typeof orderData.error === 'string' && orderData.error.includes("PayPal")) {
            // Activate test mode and try again
            setTestModeActive(true);
            
            toast({
              title: "Test Mode Activated",
              description: "Using PayPal sandbox environment for testing.",
              variant: "default"
            });
            
            setIsLoading(false);
            if (onProcessingEnd) onProcessingEnd();
            // Try again immediately with test mode
            setTimeout(() => handleClick(), 500);
            return;
          }
          throw new Error('Failed to create PayPal order');
        }
        
        // Find the approval URL in the links array
        const approvalUrl = orderData.links?.find((link: any) => link.rel === 'approve')?.href;
        
        if (!approvalUrl) {
          throw new Error('PayPal approval URL not found in the response');
        }
        
        // Add userId to the approval URL for premium activation
        const separator = approvalUrl.includes('?') ? '&' : '?';
        const modifiedUrl = `${approvalUrl}${separator}userId=${user.id}`;
        
        // Redirect to PayPal for payment approval
        window.location.href = modifiedUrl;
      } catch (apiError: any) {
        // Clear timeout
        if (timeoutId) {
          clearTimeout(timeoutId);
          setTimeoutId(null);
        }
        
        console.error('PayPalButton: API error:', apiError);
        
        // Activate test mode if it's a configuration issue
        setTestModeActive(true);
        
        toast({
          title: "Demo Mode Activated",
          description: "Using PayPal sandbox environment for demonstration.",
          variant: "default"
        });
        
        setIsLoading(false);
        if (onProcessingEnd) onProcessingEnd();
        // Try again immediately with test mode
        setTimeout(() => handleClick(), 500);
      }
    } catch (error: any) {
      console.error('PayPalButton: Error initiating PayPal payment:', error);
      
      // Clear any pending timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
      
      // Ensure we clear loading state
      setIsLoading(false);
      if (onProcessingEnd) onProcessingEnd();
      
      toast({
        title: "Payment error",
        description: "An error occurred during payment processing. Please try again.",
        variant: "destructive"
      });
      
      if (onPaymentError) {
        onPaymentError(error.message || "Unknown payment error");
      }
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading || disabled || status === 'loading'}
      className={className}
      variant="outline"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          {testModeActive && <AlertCircle className="mr-2 h-4 w-4" />}
          {testModeActive ? "Demo " + text : text}
        </>
      )}
    </Button>
  );
}
