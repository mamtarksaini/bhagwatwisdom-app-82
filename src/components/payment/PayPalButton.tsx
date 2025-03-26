
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
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
}

export function PayPalButton({ 
  planId, 
  text = "Pay with PayPal", 
  className,
  onProcessingStart,
  onProcessingEnd
}: PayPalButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user, status } = useAuth();
  const navigate = useNavigate();

  // Clean up any ongoing processing on component unmount
  useEffect(() => {
    return () => {
      if (isLoading && onProcessingEnd) {
        onProcessingEnd();
      }
    };
  }, [isLoading, onProcessingEnd]);

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
    
    try {
      setIsLoading(true);
      if (onProcessingStart) onProcessingStart();
      
      console.log('PayPalButton: Creating PayPal payment for plan:', planId);
      
      const orderData = await createPaymentOrder(planId, 'paypal');
      
      if (!orderData || !orderData.id) {
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
