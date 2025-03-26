
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const [shouldShow, setShouldShow] = useState(false);
  
  const status = searchParams.get('status');
  const message = searchParams.get('message');
  
  useEffect(() => {
    // Only show the component if a status is present
    if (status) {
      setShouldShow(true);
      
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setShouldShow(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [status]);
  
  if (!shouldShow) {
    return null;
  }
  
  const renderContent = () => {
    switch (status) {
      case 'success':
        return (
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <p>Payment successful! Your subscription has been activated.</p>
          </div>
        );
      case 'processing':
        return (
          <div className="flex items-center space-x-2 text-blue-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <p>Processing your payment. Please wait...</p>
          </div>
        );
      case 'cancelled':
        return (
          <div className="flex items-center space-x-2 text-yellow-600">
            <AlertCircle className="h-5 w-5" />
            <p>Payment cancelled. Your subscription has not been activated.</p>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center space-x-2 text-red-600">
            <XCircle className="h-5 w-5" />
            <p>{message || 'An error occurred during payment. Please try again.'}</p>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <Card className="mb-8 border-2 border-muted shadow-md">
      <CardContent className="p-4">
        {renderContent()}
      </CardContent>
    </Card>
  );
}
