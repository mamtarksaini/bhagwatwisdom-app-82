
import React, { useState, useEffect } from 'react';
import { PayPalButton } from './PayPalButton';
import { RazorpayButton } from './RazorpayButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface PaymentMethodsProps {
  planId: string;
  planName: string;
  price: number;
  currency: string;
}

export function PaymentMethods({ planId, planName, price, currency }: PaymentMethodsProps) {
  const [paymentInitialized, setPaymentInitialized] = useState(false);
  const [processingTimeout, setProcessingTimeout] = useState(false);
  const [paymentProvider, setPaymentProvider] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Set a timeout for showing an error message if processing takes too long
  useEffect(() => {
    let timer: number;
    
    if (paymentInitialized) {
      timer = window.setTimeout(() => {
        console.log('PaymentMethods: Payment processing timeout reached');
        setProcessingTimeout(true);
      }, 12000); // 12-second timeout
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [paymentInitialized]);

  // Reset the processing state if the component re-renders
  useEffect(() => {
    return () => {
      setPaymentInitialized(false);
      setProcessingTimeout(false);
      setPaymentProvider(null);
      setPaymentError(null);
    };
  }, []);

  const handleProcessingStart = (provider: string) => {
    console.log(`PaymentMethods: ${provider} payment processing started`);
    setPaymentProvider(provider);
    setPaymentInitialized(true);
    setProcessingTimeout(false); // Reset timeout state
    setPaymentError(null); // Clear any previous errors
  };

  const handleProcessingEnd = () => {
    console.log('PaymentMethods: Payment processing ended');
    setPaymentInitialized(false);
    setProcessingTimeout(false);
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
    setPaymentInitialized(false);
    setProcessingTimeout(false);
  };

  const handleRetry = () => {
    console.log('PaymentMethods: Retrying payment');
    setPaymentInitialized(false);
    setProcessingTimeout(false);
    setPaymentProvider(null);
    setPaymentError(null);
  };

  return (
    <Card className="border-2 border-muted">
      <CardHeader>
        <CardTitle>Complete Your Purchase</CardTitle>
        <CardDescription>
          {planName} Plan - {currency} {price}/month
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {paymentError && paymentError.includes("not configured") && (
          <Alert variant="info" className="mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Payment System Notice</AlertTitle>
            <AlertDescription>
              The payment system is currently in demo mode. In a production environment, 
              this would connect to actual payment gateways. Please try Razorpay or contact support.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <h3 className="text-sm font-medium">Select a payment method:</h3>
          
          <div className="space-y-3">
            {processingTimeout ? (
              <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md text-amber-600 dark:text-amber-400 text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Payment processing timeout</span>
                </div>
                <p>
                  Payment processing with {paymentProvider} is taking longer than expected. 
                  You may continue waiting or try again with the same or another payment method.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2" 
                  onClick={handleRetry}
                >
                  Try Again
                </Button>
              </div>
            ) : null}
            
            <PayPalButton 
              planId={planId} 
              className="w-full flex items-center justify-center"
              text="Pay with PayPal" 
              onProcessingStart={() => handleProcessingStart('PayPal')}
              onProcessingEnd={handleProcessingEnd}
            />
            
            <Separator />
            
            <RazorpayButton 
              planId={planId} 
              className="w-full flex items-center justify-center"
              text="Pay with Razorpay"
              onProcessingStart={() => handleProcessingStart('Razorpay')}
              onProcessingEnd={handleProcessingEnd}
            />
          </div>
        </div>

        <CardFooter className="px-0 pt-4">
          <div className="text-xs text-muted-foreground">
            <p>By proceeding with the payment, you agree to our terms and conditions.</p>
            <p className="mt-1">Your subscription will automatically renew each month. You can cancel anytime.</p>
            <p className="mt-1 italic">Note: This is a demonstration environment. No actual payments will be processed.</p>
          </div>
        </CardFooter>
      </CardContent>
    </Card>
  );
}
