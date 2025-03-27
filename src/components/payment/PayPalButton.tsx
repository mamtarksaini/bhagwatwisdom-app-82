
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
    
    // If we've already attempted and likely got a credentials error, show a more helpful message
    if (hasAttempted) {
      toast({
        title: "Demo Environment",
        description: "PayPal payments are not configured in this demo. Please try Razorpay instead.",
        variant: "default"
      });
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
      
      const orderData = await createPaymentOrder(planId, 'paypal');
      
      // Clear the timeout since we got a response
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
      
      if (!orderData || !orderData.id) {
        // Check if the error indicates missing PayPal credentials
        if (orderData && orderData.error === "PayPal credentials not configured") {
          const errorMessage = 'PayPal payments are not configured in this demo environment. Please try Razorpay instead.';
          if (onPaymentError) onPaymentError(errorMessage);
          
          toast({
            title: "Demo Environment",
            description: "PayPal payments are not configured in this demo. Please try Razorpay instead.",
            variant: "default"
          });
          
          throw new Error(errorMessage);
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
    } catch (error: any) {
      console.error('PayPalButton: Error initiating PayPal payment:', error);
      setIsLoading(false);
      if (onProcessingEnd) onProcessingEnd();
      
      // Clear any pending timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
      
      // Only show error toast if it's not a credentials error (which is already handled)
      if (!(error.message && error.message.includes('not configured'))) {
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
        text
      )}
    </Button>
  );
}
