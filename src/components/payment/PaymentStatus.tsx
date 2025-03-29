
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
    
    console.log('PaymentStatus: Processing status:', status, 'provider:', provider);
    
    if (!status) return;
    
    // Use a single execution flag to prevent multiple toast/redirect cycles
    const processOnce = () => {
      if (status === 'success') {
        toast({
          title: "Payment successful",
          description: "Thank you for your purchase! Your premium access has been activated.",
          variant: "success"
        });
        
        // For demo purposes, simulate premium access activation
        if (provider === 'paypal') {
          toast({
            title: "Demo Mode",
            description: "This is a demo payment flow. Premium features would normally be activated now.",
            variant: "default"
          });
          
          // Refresh user data to update premium status
          if (refreshUserData) {
            try {
              refreshUserData();
              console.log('PaymentStatus: User data refreshed after payment');
            } catch (error) {
              console.error('Error refreshing user data:', error);
            }
          }
        }
        
        // Clear the URL parameters after processing
        setTimeout(() => {
          navigate('/pricing', { replace: true });
        }, 1000);
      } else if (status === 'cancelled') {
        toast({
          title: "Payment cancelled",
          description: "Your payment process was cancelled. No charges were made.",
          variant: "default"
        });
        
        // Clear the URL parameters after processing
        setTimeout(() => {
          navigate('/pricing', { replace: true });
        }, 1000);
      } else if (status === 'error') {
        const message = params.get('message') || 'There was an error processing your payment.';
        
        toast({
          title: "Payment error",
          description: message,
          variant: "destructive"
        });
        
        // Clear the URL parameters after processing
        setTimeout(() => {
          navigate('/pricing', { replace: true });
        }, 1000);
      }
    };
    
    // Execute once when the component mounts with a status
    processOnce();
    
    // Cleanup function that does nothing - just to satisfy the useEffect dependency
    return () => {
      // No cleanup needed
    };
    
  // Run this effect ONLY once per status change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return null;
}
