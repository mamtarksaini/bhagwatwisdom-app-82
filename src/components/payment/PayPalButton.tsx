
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { createPaymentOrder, verifyPayment } from '@/services/paymentService';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface PayPalButtonProps {
  planId: string;
  text?: string;
  className?: string;
}

export function PayPalButton({ planId, text = 'Pay with PayPal', className }: PayPalButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const { user, status } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check authentication status on mount and when status changes
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Double-check session state with Supabase directly
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('PayPalButton: Session check error:', error);
        }
        
        setIsAuthChecking(false);
      } catch (error) {
        console.error('PayPalButton: Error checking authentication:', error);
        setIsAuthChecking(false);
      }
    };
    
    checkAuth();
  }, [status]);

  // Handle the PayPal redirection callback
  useEffect(() => {
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
    // Comprehensive auth check
    if (isAuthChecking) {
      toast({
        title: "Please wait",
        description: "Checking authentication status...",
        variant: "default"
      });
      return;
    }
    
    // Ensure user is authenticated before proceeding
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to continue with your purchase.",
        variant: "destructive"
      });
      
      // Redirect to auth page
      navigate('/auth');
      return;
    }
    
    try {
      setIsLoading(true);
      
      console.log('PayPalButton: Creating payment order for plan:', planId);
      
      // Create a PayPal order with the current session token
      const order = await createPaymentOrder(planId, 'paypal');
      
      // Check if the order and links property exist
      if (!order || !order.links || !Array.isArray(order.links)) {
        console.error('Invalid PayPal order response:', order);
        
        if (order && order.error === 'invalid_token') {
          // Handle token issues by refreshing the session
          await supabase.auth.refreshSession();
          toast({
            title: "Session refreshed",
            description: "Please try again.",
            variant: "default"
          });
        } else {
          throw new Error('Invalid payment response from server');
        }
        return;
      }
      
      // Find the approval URL in the links array
      const approvalLink = order.links.find((link: any) => link.rel === 'approve');
      
      if (approvalLink && approvalLink.href) {
        // Redirect the user to PayPal for payment approval
        window.location.href = approvalLink.href;
      } else {
        console.error('PayPal approval link not found in response:', order);
        throw new Error('PayPal approval link not found');
      }
      
    } catch (error) {
      console.error('Error initiating PayPal payment:', error);
      
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
      disabled={isLoading || isAuthChecking}
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
