
import React, { useState, useEffect } from 'react';
import { PayPalButton } from './PayPalButton';
import { RazorpayButton } from './RazorpayButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';

interface PaymentMethodsProps {
  planId: string;
  planName: string;
  price: number;
  currency: string;
}

export function PaymentMethods({ planId, planName, price, currency }: PaymentMethodsProps) {
  const [paymentInitialized, setPaymentInitialized] = useState(false);
  const [processingTimeout, setProcessingTimeout] = useState(false);

  // Set a timeout for showing an error message if processing takes too long
  useEffect(() => {
    if (paymentInitialized) {
      const timer = setTimeout(() => {
        setProcessingTimeout(true);
      }, 15000); // 15 seconds timeout

      return () => clearTimeout(timer);
    }
  }, [paymentInitialized]);

  // Reset the processing state if the component re-renders
  useEffect(() => {
    return () => {
      setPaymentInitialized(false);
      setProcessingTimeout(false);
    };
  }, []);

  return (
    <Card className="border-2 border-muted">
      <CardHeader>
        <CardTitle>Complete Your Purchase</CardTitle>
        <CardDescription>
          {planName} Plan - {currency} {price}/month
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Select a payment method:</h3>
          
          <div className="space-y-3">
            {processingTimeout ? (
              <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md text-amber-600 dark:text-amber-400 text-sm">
                Payment processing is taking longer than expected. You may try again or choose another payment method.
              </div>
            ) : null}
            
            <PayPalButton 
              planId={planId} 
              className="w-full flex items-center justify-center"
              text="Pay with PayPal" 
              onProcessingStart={() => setPaymentInitialized(true)}
              onProcessingEnd={() => setPaymentInitialized(false)}
            />
            
            <Separator />
            
            <RazorpayButton 
              planId={planId} 
              className="w-full flex items-center justify-center"
              text="Pay with Razorpay"
              onProcessingStart={() => setPaymentInitialized(true)}
              onProcessingEnd={() => setPaymentInitialized(false)}
            />
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p>By proceeding with the payment, you agree to our terms and conditions.</p>
          <p className="mt-1">Your subscription will automatically renew each month. You can cancel anytime.</p>
        </div>
      </CardContent>
    </Card>
  );
}
