
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { verifyPayment } from '@/services/paymentService';

export function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | 'processing' | null>(null);
  const { user, upgradeToPremium } = useAuth();

  useEffect(() => {
    const status = searchParams.get('status');
    const paypalToken = searchParams.get('token');
    const provider = searchParams.get('provider');
    const planId = searchParams.get('planId');

    const processPayment = async () => {
      if (status === 'success' && provider === 'paypal' && paypalToken && planId && user) {
        setIsProcessing(true);
        setStatusType('processing');
        setStatusMessage('Verifying your payment...');

        try {
          const result = await verifyPayment('paypal', planId, { orderId: paypalToken });

          if (result.success) {
            setStatusType('success');
            setStatusMessage('Payment successful! Your subscription has been activated.');
            toast({
              title: "Payment successful!",
              description: "Your subscription has been activated.",
              variant: "success"
            });
            
            // Give the database a moment to update
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          } else {
            setStatusType('error');
            setStatusMessage('Payment verification failed. Please try again or contact support.');
            toast({
              title: "Payment verification failed",
              description: "Please try again or contact support.",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error('Error verifying payment:', error);
          setStatusType('error');
          setStatusMessage('An error occurred while verifying your payment. Please try again.');
          toast({
            title: "Payment verification error",
            description: "An error occurred while verifying your payment.",
            variant: "destructive"
          });
        } finally {
          setIsProcessing(false);
        }
      } else if (status === 'cancelled') {
        setStatusType('error');
        setStatusMessage('Payment was cancelled. You can try again whenever you\'re ready.');
      } else if (status === 'error') {
        const errorMessage = searchParams.get('message');
        setStatusType('error');
        setStatusMessage(errorMessage || 'An error occurred during payment processing.');
      }
    };

    processPayment();
  }, [searchParams, user, upgradeToPremium]);

  if (!statusType || !statusMessage) {
    return null;
  }

  return (
    <Alert
      variant={statusType === 'success' ? 'default' : statusType === 'error' ? 'destructive' : 'default'}
      className="mb-6"
    >
      {statusType === 'success' && <CheckCircle className="h-5 w-5" />}
      {statusType === 'error' && <XCircle className="h-5 w-5" />}
      {statusType === 'processing' && <Loader2 className="h-5 w-5 animate-spin" />}
      
      <AlertTitle>
        {statusType === 'success' && 'Payment Successful'}
        {statusType === 'error' && 'Payment Failed'}
        {statusType === 'processing' && 'Processing Payment'}
      </AlertTitle>
      
      <AlertDescription>{statusMessage}</AlertDescription>
    </Alert>
  );
}
