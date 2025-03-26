
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { createPaymentOrder, verifyPayment } from '@/services/paymentService';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface PayPalButtonProps {
  planId: string;
  text?: string;
  className?: string;
}

export function PayPalButton({ planId, text = 'Pay with PayPal', className }: PayPalButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user, status } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle the PayPal redirection callback
  React.useEffect(() => {
    const status = searchParams.get('status');
    const provider = searchParams.get('provider');
    const token = searchParams.get('token');
    const planIdParam = searchParams.get('planId');
    
    if (status === 'success' && provider === 'paypal' && token && planIdParam) {
      completePurchase(token, planIdParam);
    }
  }, [searchParams]);

  // Complete the purchase after PayPal redirect
  const completePurchase = async (token: string, planId: string) => {
    try {
      setIsLoading(true);
      
      // We have the token from PayPal redirect, verify the payment
      const result = await verifyPayment('paypal', planId, { orderId: token });
      
      if (result.success) {
        toast({
          title: "Payment successful!",
          description: "Your subscription has been activated.",
          variant: "success"
        });
        
        // Clean up URL parameters
        navigate('/pricing', { replace: true });
        
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
      console.error('Error completing PayPal purchase:', error);
      toast({
        title: "Payment error",
        description: error.message || "An error occurred processing your payment.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = async () => {
    // Check user authentication status more explicitly
    if (!user || status !== 'authenticated') {
      toast({
        title: "Authentication required",
        description: "Please sign in to continue with your purchase.",
        variant: "default"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Create a PayPal order
      const order = await createPaymentOrder(planId, 'paypal');
      
      // Find the approval URL in the links array
      const approvalLink = order.links.find((link: any) => link.rel === 'approve');
      
      if (approvalLink && approvalLink.href) {
        // Redirect the user to PayPal for payment approval
        window.location.href = approvalLink.href;
      } else {
        throw new Error('PayPal approval link not found');
      }
      
    } catch (error) {
      console.error('Error initiating PayPal payment:', error);
      setIsLoading(false);
      
      toast({
        title: "Payment error",
        description: error.message || "An error occurred initiating your payment.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
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
