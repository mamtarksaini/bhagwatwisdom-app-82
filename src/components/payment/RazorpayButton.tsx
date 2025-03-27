
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { createPaymentOrder, verifyPayment } from '@/services/paymentService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

interface RazorpayButtonProps {
  planId: string;
  text?: string;
  className?: string;
  onProcessingStart?: () => void;
  onProcessingEnd?: () => void;
  onPaymentError?: (error: string) => void;
}

// Define Razorpay global type
declare global {
  interface Window {
    Razorpay: any;
  }
}

export function RazorpayButton({ 
  planId, 
  text = 'Pay with Razorpay', 
  className,
  onProcessingStart,
  onProcessingEnd,
  onPaymentError
}: RazorpayButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [hasAttempted, setHasAttempted] = useState(false);
  const { user, status } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('RazorpayButton: Session check error:', error);
        }
        
        setIsAuthChecking(false);
      } catch (error) {
        console.error('RazorpayButton: Error checking authentication:', error);
        setIsAuthChecking(false);
      }
    };
    
    checkAuth();
  }, [status]);

  useEffect(() => {
    const loadRazorpayScript = () => {
      if (document.getElementById('razorpay-script')) {
        setIsScriptLoaded(true);
        return;
      }
      
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        setIsScriptLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        setIsScriptLoaded(false);
      };
      
      document.body.appendChild(script);
    };
    
    loadRazorpayScript();
    
    return () => {
      if (isLoading && onProcessingEnd) {
        onProcessingEnd();
      }
    };
  }, [isLoading, onProcessingEnd]);

  const handleClick = async () => {
    if (isAuthChecking) {
      toast({
        title: "Please wait",
        description: "Checking authentication status...",
        variant: "default"
      });
      return;
    }
    
    if (!user || status !== 'authenticated') {
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to continue with your purchase.",
          variant: "destructive"
        });
        
        navigate('/auth');
        return;
      }
    }
    
    if (!isScriptLoaded) {
      toast({
        title: "Loading payment gateway",
        description: "Please wait while we initialize the payment gateway.",
        variant: "default"
      });
      return;
    }
    
    // If we've already attempted and likely got a credentials error, show a more helpful message
    if (hasAttempted) {
      toast({
        title: "Demo Environment",
        description: "This payment method is not configured in the demo environment.",
        variant: "default"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      setHasAttempted(true);
      if (onProcessingStart) onProcessingStart();
      
      console.log('RazorpayButton: Creating payment order for plan:', planId);
      
      const orderData = await createPaymentOrder(planId, 'razorpay');
      
      if (!orderData || !orderData.id) {
        if (orderData && orderData.error === "Razorpay credentials not configured") {
          const errorMessage = 'Razorpay payments are not configured in this demo environment. Please contact support.';
          if (onPaymentError) onPaymentError(errorMessage);
          
          toast({
            title: "Demo Environment",
            description: "Razorpay payments are not configured in this demo environment.",
            variant: "default"
          });
          
          throw new Error(errorMessage);
        }
        throw new Error('Failed to create payment order');
      }
      
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Bhagwat Wisdom',
        description: `${orderData.plan_details.name} Plan Subscription`,
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            const result = await verifyPayment('razorpay', planId, response);
            
            if (result.success) {
              toast({
                title: "Payment successful!",
                description: "Your subscription has been activated.",
                variant: "success"
              });
              
              setTimeout(() => {
                window.location.reload();
              }, 1500);
            } else {
              toast({
                title: "Payment verification failed",
                description: result.message || "Please try again or contact support.",
                variant: "destructive"
              });
            }
          } catch (error) {
            console.error('Error verifying Razorpay payment:', error);
            toast({
              title: "Payment error",
              description: error.message || "An error occurred processing your payment.",
              variant: "destructive"
            });
          } finally {
            setIsLoading(false);
            if (onProcessingEnd) onProcessingEnd();
          }
        },
        prefill: {
          email: user?.email,
          name: user?.name || '',
        },
        theme: {
          color: '#3399cc',
        },
        modal: {
          ondismiss: function() {
            setIsLoading(false);
            if (onProcessingEnd) onProcessingEnd();
          }
        }
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error('Error initiating Razorpay payment:', error);
      setIsLoading(false);
      if (onProcessingEnd) onProcessingEnd();
      
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
      disabled={isLoading || !isScriptLoaded || isAuthChecking}
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
