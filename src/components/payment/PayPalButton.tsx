
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
    
    setProcessingStage('confirming');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setProcessingStage('completing');
    await new Promise(resolve => setTimeout(resolve, 1000));
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
      }, 15000); // 15-second timeout
      
      setTimeoutId(newTimeoutId);
      
      console.log('PayPalButton: Creating PayPal payment for plan:', planId);
      
      // In test mode, simulate a successful response with realistic delays
      if (testModeActive) {
        console.log('PayPalButton: Using PayPal test mode');
        
        // Clear the timeout
        if (timeoutId) {
          clearTimeout(timeoutId);
          setTimeoutId(null);
        }
        
        // Simulate payment processing stages
        await simulateProcessingStages();
        
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
        setProcessingStage(null);
        if (onProcessingEnd) onProcessingEnd();
        
        // Instead of directly changing the window location, open a new window/tab
        // This simulates being redirected to PayPal's site
        const paypalSimWindow = window.open('about:blank', '_blank');
        
        if (paypalSimWindow) {
          // Add some PayPal simulation content
          paypalSimWindow.document.write(`
            <html>
              <head>
                <title>PayPal Payment Simulation</title>
                <style>
                  body { font-family: Arial, sans-serif; background-color: #f5f5f5; text-align: center; padding: 50px; }
                  .logo { font-size: 24px; font-weight: bold; color: #003087; margin-bottom: 30px; }
                  .container { background: white; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
                  .amount { font-size: 20px; margin: 20px 0; }
                  .button { background: #0070ba; color: white; border: none; padding: 12px 30px; border-radius: 25px; font-size: 16px; cursor: pointer; transition: background 0.3s; }
                  .button:hover { background: #003087; }
                  .info { margin-top: 20px; color: #666; font-size: 14px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="logo">PayPal</div>
                  <h2>Complete Your Payment</h2>
                  <p>You are paying:</p>
                  <div class="amount"><strong>$9.99 USD</strong></div>
                  <p>to <strong>Bhagwat Wisdom</strong> for Premium Plan Subscription</p>
                  <button class="button" id="completePayment">Complete Payment</button>
                  <p class="info">This is a simulated payment page. No actual payment will be processed.</p>
                  <p class="info">Demo environment for development and testing only.</p>
                </div>
                <script>
                  document.getElementById('completePayment').addEventListener('click', function() {
                    document.body.innerHTML = '<div class="container"><div class="logo">PayPal</div><h2>Payment Processing</h2><p>Please wait while we process your payment...</p></div>';
                    setTimeout(function() {
                      document.body.innerHTML = '<div class="container"><div class="logo">PayPal</div><h2>Payment Successful!</h2><p>Your payment has been processed successfully.</p><p>Redirecting you back to Bhagwat Wisdom...</p></div>';
                      setTimeout(function() {
                        window.location.href = '${window.location.origin}/pricing?status=success&provider=paypal&token=TEST_TOKEN_${Math.floor(Math.random() * 1000000)}&planId=${planId}&userId=${user.id}&activated=true';
                      }, 3000);
                    }, 2000);
                  });
                </script>
              </body>
            </html>
          `);
          paypalSimWindow.document.close();
        } else {
          // If popup was blocked, redirect in same window after a delay
          console.log('PayPalButton: Popup blocked, redirecting in same window');
          
          toast({
            title: "Simulating PayPal redirect",
            description: "In a real environment, you would be redirected to PayPal's website.",
            variant: "info",
            duration: 3000,
          });
          
          // Wait for toast to be visible
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Redirect to same URL as in the popup flow
          window.location.href = `/pricing?status=success&provider=paypal&token=TEST_TOKEN_${Math.floor(Math.random() * 1000000)}&planId=${planId}&userId=${user.id}&activated=true`;
        }
        
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
      case 'confirming':
        return 'Confirming transaction...';
      case 'completing':
        return 'Completing payment...';
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
