
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import { createPaymentOrder } from '@/services/paymentService';
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
  const [processingStage, setProcessingStage] = useState<string | null>(null);
  
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

  const simulateProcessingStages = async () => {
    // Simulate different stages of payment processing with realistic delays
    setProcessingStage('initializing');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setProcessingStage('connecting');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setProcessingStage('processing');
    await new Promise(resolve => setTimeout(resolve, 3000));
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
        setProcessingStage(null);
        
        toast({
          title: "Payment timeout",
          description: "The payment process took too long. Please try again.",
          variant: "destructive"
        });
      }, 30000); // 30-second timeout for entire process
      
      setTimeoutId(newTimeoutId);
      
      console.log('PayPalButton: Creating PayPal payment for plan:', planId);
      
      // In test mode, simulate the initial stages of processing
      if (testModeActive) {
        console.log('PayPalButton: Using PayPal test mode');
        
        try {
          // Simulate early processing stages with delays
          await simulateProcessingStages();
          
          // Create the simulated PayPal URL with necessary parameters
          const paypalSimulatedUrl = `/pricing?simulatePayPal=true&planId=${planId}&userId=${user.id}`;
          
          // Navigate to the simulated PayPal page
          window.location.href = paypalSimulatedUrl;
          
          // Clear the timeout as we're redirecting
          if (timeoutId) {
            clearTimeout(timeoutId);
            setTimeoutId(null);
          }
          
          return;
        } catch (err) {
          console.error('Error in PayPal simulation:', err);
          if (onProcessingEnd) onProcessingEnd();
          setIsLoading(false);
          setProcessingStage(null);
          
          toast({
            title: "PayPal Error",
            description: "Could not process payment simulation. Please try again.",
            variant: "destructive"
          });
        }
      }
      
      // Actual API call if not in test mode - left as is
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
            setProcessingStage(null);
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
        setProcessingStage(null);
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
      setProcessingStage(null);
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

  const getProcessingStageText = () => {
    switch (processingStage) {
      case 'initializing':
        return 'Initializing payment...';
      case 'connecting':
        return 'Connecting to PayPal...';
      case 'processing':
        return 'Processing payment...';
      default:
        return 'Processing...';
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
          {getProcessingStageText()}
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
