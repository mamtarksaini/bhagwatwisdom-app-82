
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { createPaymentOrder, verifyPayment } from '@/services/paymentService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface RazorpayButtonProps {
  planId: string;
  text?: string;
  className?: string;
}

// Define Razorpay global type
declare global {
  interface Window {
    Razorpay: any;
  }
}

export function RazorpayButton({ planId, text = 'Pay with Razorpay', className }: RazorpayButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const { user } = useAuth();

  // Load Razorpay script
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
      // No need to remove the script on unmount as it might be used elsewhere
    };
  }, []);

  const handleClick = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to continue with your purchase.",
        variant: "default"
      });
      return;
    }
    
    if (!isScriptLoaded) {
      toast({
        title: "Loading payment gateway",
        description: "Please wait while we initialize the payment gateway.",
        variant: "default"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Create a Razorpay order
      const orderData = await createPaymentOrder(planId, 'razorpay');
      
      if (!orderData || !orderData.id) {
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
            // Verify the payment
            const result = await verifyPayment('razorpay', planId, response);
            
            if (result.success) {
              toast({
                title: "Payment successful!",
                description: "Your subscription has been activated.",
                variant: "success"
              });
              
              // Reload the page to update user's premium status
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
          }
        },
        prefill: {
          email: user.email,
          name: user.user_metadata?.full_name || '',
        },
        theme: {
          color: '#3399cc',
        },
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error('Error initiating Razorpay payment:', error);
      toast({
        title: "Payment error",
        description: error.message || "An error occurred initiating your payment.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading || !isScriptLoaded}
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
