
import React, { useState, useEffect } from 'react';
import { PayPalButton } from './PayPalButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, AlertTriangle, Info, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface PaymentMethodsProps {
  planId: string;
  planName: string;
  price: number;
  currency: string;
  onClose?: () => void;
}

export function PaymentMethods({ planId, planName, price, currency, onClose }: PaymentMethodsProps) {
  const [paymentInitialized, setPaymentInitialized] = useState(false);
  const [processingTimeout, setProcessingTimeout] = useState(false);
  const [paymentProvider, setPaymentProvider] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showDemoAlert, setShowDemoAlert] = useState(true);
  const [processingStartTime, setProcessingStartTime] = useState<number | null>(null);

  // Set a timeout for showing an error message if processing takes too long
  useEffect(() => {
    let timer: number;
    
    if (paymentInitialized) {
      setProcessingStartTime(Date.now());
      
      timer = window.setTimeout(() => {
        console.log('PaymentMethods: Payment processing timeout reached');
        setProcessingTimeout(true);
      }, 3000); // Reduced to 3 seconds for testing - faster feedback
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
      setProcessingStartTime(null);
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
    setProcessingStartTime(null);
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
    setPaymentInitialized(false);
    setProcessingTimeout(false);
    setProcessingStartTime(null);
  };

  const handleRetry = () => {
    console.log('PaymentMethods: Retrying payment');
    setPaymentInitialized(false);
    setProcessingTimeout(false);
    setPaymentProvider(null);
    setPaymentError(null);
    setProcessingStartTime(null);
  };

  const handleCancel = () => {
    console.log('PaymentMethods: Cancelling payment');
    handleRetry(); // Reuse the retry logic to reset the state
    if (onClose) {
      onClose();
    }
  };

  const getProcessingTime = () => {
    if (!processingStartTime) return 0;
    return Math.floor((Date.now() - processingStartTime) / 1000);
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
        {showDemoAlert && (
          <Alert variant="info" className="mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Test Environment</AlertTitle>
            <AlertDescription>
              This is a test/demo environment. No actual payments will be processed.
            </AlertDescription>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2" 
              onClick={() => setShowDemoAlert(false)}
            >
              Dismiss
            </Button>
          </Alert>
        )}

        {paymentError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Payment Error</AlertTitle>
            <AlertDescription>
              {paymentError}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <h3 className="text-sm font-medium">Select a payment method:</h3>
          
          <div className="space-y-3">
            {paymentInitialized && !processingTimeout ? (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span className="font-medium text-primary">Processing with {paymentProvider}...</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleCancel}
                    className="h-8 w-8 p-0"
                  >
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="sr-only">Cancel</span>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Please wait while we process your payment. This may take a moment.
                  {getProcessingTime() > 0 && ` (${getProcessingTime()}s)`}
                </p>
              </div>
            ) : null}
            
            {processingTimeout ? (
              <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md text-amber-600 dark:text-amber-400 text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Payment processing timeout</span>
                </div>
                <p>
                  Payment processing with {paymentProvider} is taking longer than expected. 
                  You may continue waiting or try again.
                </p>
                <div className="flex space-x-2 mt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRetry}
                  >
                    Try Again
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : null}
            
            <PayPalButton 
              planId={planId} 
              className="w-full flex items-center justify-center"
              text="Pay with PayPal" 
              onProcessingStart={handleProcessingStart}
              onProcessingEnd={handleProcessingEnd}
              onPaymentError={handlePaymentError}
              disabled={paymentInitialized}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-6 pt-0">
        <div className="text-xs text-muted-foreground w-full">
          <p>By proceeding with the payment, you agree to our terms and conditions.</p>
          <p className="mt-1">Your subscription will automatically renew each month. You can cancel anytime.</p>
          <p className="mt-1 italic">Note: This is a test environment. No actual payments will be processed.</p>
        </div>
      </CardFooter>
    </Card>
  );
}
