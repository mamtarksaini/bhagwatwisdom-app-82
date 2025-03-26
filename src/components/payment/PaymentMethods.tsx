
import React from 'react';
import { PayPalButton } from './PayPalButton';
import { RazorpayButton } from './RazorpayButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface PaymentMethodsProps {
  planId: string;
  planName: string;
  price: number;
  currency: string;
}

export function PaymentMethods({ planId, planName, price, currency }: PaymentMethodsProps) {
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
            <PayPalButton 
              planId={planId} 
              className="w-full flex items-center justify-center"
              text={
                <div className="flex items-center">
                  <span className="mr-2">Pay with</span>
                  <span className="font-bold text-blue-600">Pay</span>
                  <span className="font-bold text-blue-800">Pal</span>
                </div>
              }
            />
            
            <Separator />
            
            <RazorpayButton 
              planId={planId} 
              className="w-full flex items-center justify-center"
              text={
                <div className="flex items-center">
                  <span className="mr-2">Pay with</span>
                  <span className="font-bold text-blue-600">Razorpay</span>
                </div>
              }
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
