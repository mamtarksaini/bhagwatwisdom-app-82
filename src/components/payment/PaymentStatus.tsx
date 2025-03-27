
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export function PaymentStatus() {
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshUserData } = useAuth();
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('status');
    const provider = params.get('provider');
    
    if (!status) return;
    
    if (status === 'success') {
      toast({
        title: "Payment successful",
        description: "Thank you for your purchase! Your premium access has been activated.",
        variant: "default"
      });
      
      // For demo purposes, simulate premium access activation
      if (provider === 'paypal') {
        toast({
          title: "Demo Mode",
          description: "This is a demo payment flow. Premium features would normally be activated now.",
          variant: "default"
        });
        
        // Refresh user data to update premium status
        refreshUserData?.();
      }
      
      // Clear the URL parameters after processing
      navigate('/pricing', { replace: true });
    } else if (status === 'cancelled') {
      toast({
        title: "Payment cancelled",
        description: "Your payment process was cancelled. No charges were made.",
        variant: "default"
      });
      
      // Clear the URL parameters after processing
      navigate('/pricing', { replace: true });
    } else if (status === 'error') {
      const message = params.get('message') || 'There was an error processing your payment.';
      
      toast({
        title: "Payment error",
        description: message,
        variant: "destructive"
      });
      
      // Clear the URL parameters after processing
      navigate('/pricing', { replace: true });
    }
  }, [location.search, navigate, refreshUserData]);
  
  return null;
}
