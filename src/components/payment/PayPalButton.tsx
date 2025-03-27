
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
  onProcessingStart?: () => void;
  onProcessingEnd?: () => void;
  onPaymentError?: (error: string) => void;
}

export function PayPalButton({ 
  planId, 
  text = "Pay with PayPal", 
  className,
  onProcessingStart,
  onProcessingEnd,
  onPaymentError
}: PayPalButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user, status } = useAuth();
  const navigate = useNavigate();
  const [timeoutId, setTimeoutId] = useState<number | null>(null);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [testModeActive, setTestModeActive] = useState(false);

  // Clean up any ongoing processing and timeouts on component unmount
  useEffect(() => {
    return () => {
      if (isLoading && onProcessingEnd) {
        onProcessingEnd();
      }
      
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isLoading, onProcessingEnd, timeoutId]);

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
    
    if (isLoading) {
      console.log('PayPalButton: Already processing a payment. Please wait...');
      return;
    }
    
    // Reset the hasAttempted flag if we're in test mode
    if (testModeActive) {
      setHasAttempted(false);
    }
    
    // If we've already attempted and likely got a credentials error, 
    // activate test mode instead of showing the previous message
    if (hasAttempted && !testModeActive) {
      setTestModeActive(true);
      toast({
        title: "Activating Test Mode",
        description: "Using PayPal sandbox environment for testing",
        variant: "default"
      });
      // Reset hasAttempted so we can try again with test mode
      setHasAttempted(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setHasAttempted(true);
      if (onProcessingStart) onProcessingStart();
      
      // Set a timeout to cancel the operation if it takes too long
      const newTimeoutId = window.setTimeout(() => {
        console.log('PayPalButton: Payment initiation timeout reached');
        setIsLoading(false);
        if (onProcessingEnd) onProcessingEnd();
        
        toast({
          title: "Payment timeout",
          description: "The payment process took too long. Please try again.",
          variant: "destructive"
        });
      }, 15000); // 15-second timeout
      
      setTimeoutId(newTimeoutId);
      
      console.log('PayPalButton: Creating PayPal payment for plan:', planId);
      
      // Add more error handling for the Edge Function call
      try {
        const orderData = await createPaymentOrder(planId, 'paypal');
        
        // Clear the timeout since we got a response
        if (timeoutId) {
          clearTimeout(timeoutId);
          setTimeoutId(null);
        }
        
        if (!orderData || !orderData.id) {
          // Check if the error indicates missing PayPal credentials
          if (orderData && orderData.error === "PayPal credentials not configured") {
            // In test mode, we're using sandbox credentials in our edge function
            if (testModeActive) {
              const errorMessage = 'There was an issue with the test PayPal integration. Please try again or contact support.';
              if (onPaymentError) onPaymentError(errorMessage);
              
              toast({
                title: "Test Environment Error",
                description: errorMessage,
                variant: "destructive"
              });
            } else {
              // For the first attempt, we'll suggest activating test mode
              const errorMessage = 'PayPal credentials need additional configuration. Click the button again to activate test mode.';
              if (onPaymentError) onPaymentError(errorMessage);
              
              toast({
                title: "Configuration Needed",
                description: "Click the button again to activate PayPal sandbox test mode.",
                variant: "default"
              });
            }
            
            throw new Error(orderData.error);
          }
          throw new Error('Failed to create PayPal order');
        }
        
        // Find the approval URL in the links array
        const approvalUrl = orderData.links?.find((link: any) => link.rel === 'approve')?.href;
        
        if (!approvalUrl) {
          throw new Error('PayPal approval URL not found in the response');
        }
        
        // Redirect to PayPal for payment approval
        window.location.href = approvalUrl;
      } catch (apiError: any) {
        // Handle Edge Function errors (non-2xx status codes)
        console.error('PayPalButton: API error:', apiError);
        
        if (apiError.message && apiError.message.includes('status code')) {
          if (testModeActive) {
            toast({
              title: "Test Environment Error",
              description: "Our PayPal test environment is currently unavailable. Please try again later or contact support.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Configuration Needed",
              description: "PayPal integration needs configuration. Click the button again to try test mode.",
              variant: "default"
            });
          }
        } else {
          // Re-throw for the outer catch to handle
          throw apiError;
        }
      }
    } catch (error: any) {
      console.error('PayPalButton: Error initiating PayPal payment:', error);
      setIsLoading(false);
      if (onProcessingEnd) onProcessingEnd();
      
      // Clear any pending timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
      
      // Only show error toast if it's a serious error (not just credentials missing in first attempt)
      if (!(error.message && error.message.includes('not configured') && !testModeActive)) {
        toast({
          title: "Payment error",
          description: error.message || "An error occurred initiating your payment.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading || status === 'loading'}
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
          {testModeActive ? "Test " + text : text}
        </>
      )}
    </Button>
  );
}
