
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthModal } from '@/components/auth/AuthModal';
import { PageLayout } from '@/components/layout/PageLayout';
import { PricingCard } from '@/components/pricing/PricingCard';
import { PricingTable } from '@/components/pricing/PricingTable';
import { PricingFAQ } from '@/components/pricing/PricingFAQ';
import { PRICING_PLANS, ALL_FEATURES } from '@/constants/pricingPlans';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PaymentMethods } from '@/components/payment/PaymentMethods';
import { PaymentStatus } from '@/components/payment/PaymentStatus';
import { getSubscriptionPlans } from '@/services/paymentService';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle } from 'lucide-react';

export default function PricingPage() {
  const { user, isPremium, refreshUserData } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [dbPlans, setDbPlans] = useState<any[]>([]);
  const [showPayPalSimulation, setShowPayPalSimulation] = useState(false);
  const [simulationProcessing, setSimulationProcessing] = useState(false);
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [simulationParams, setSimulationParams] = useState<any>(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const plans = await getSubscriptionPlans();
        setDbPlans(plans);
      } catch (error) {
        console.error('Error fetching subscription plans:', error);
      }
    };

    fetchPlans();
    
    // Check for simulated PayPal parameters in URL
    const params = new URLSearchParams(location.search);
    const simulatePayPal = params.get('simulatePayPal');
    
    if (simulatePayPal === 'true') {
      const planId = params.get('planId');
      const userId = params.get('userId');
      
      if (planId && userId) {
        setSimulationParams({ planId, userId });
        setShowPayPalSimulation(true);
        
        // Clear the URL parameters but without triggering a refresh
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, [location.search]);

  // Handle the simulated PayPal flow
  const processPayPalSimulation = async () => {
    if (!simulationParams) return;
    
    try {
      setSimulationProcessing(true);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 3000));
      setSimulationComplete(true);
      
      // Wait a moment to show success
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to success page
      const redirectUrl = `/pricing?status=success&provider=paypal&token=TEST_TOKEN_${Math.floor(Math.random() * 1000000)}&planId=${simulationParams.planId}&userId=${simulationParams.userId}&activated=true`;
      window.location.href = redirectUrl;
      
    } catch (error) {
      console.error('Error in PayPal simulation:', error);
      toast({
        title: "PayPal Error",
        description: "Could not process payment simulation. Please try again.",
        variant: "destructive"
      });
      setShowPayPalSimulation(false);
    }
  };

  const mergedPlans = React.useMemo(() => {
    if (!dbPlans.length) {
      return PRICING_PLANS;
    }

    return PRICING_PLANS.map(plan => {
      const dbPlan = dbPlans.find(p => p.name?.toLowerCase() === plan.id);
      if (dbPlan) {
        return {
          ...plan,
          dbId: dbPlan.id,
          price: dbPlan.price,
          currency: dbPlan.currency,
        };
      }
      return plan;
    });
  }, [dbPlans]);

  const handleUpgradeClick = async (plan: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (isCurrentPlan(plan)) {
      toast({
        title: "Already subscribed",
        description: `You are already subscribed to the ${plan === 'basic' ? 'Basic' : plan === 'pro' ? 'Pro' : 'Enterprise'} plan.`,
        variant: "default"
      });
      return;
    }

    if (plan === 'basic') {
      setIsUpgrading(true);
      
      try {
        toast({
          title: "Downgrade successful",
          description: "Your plan has been changed to Basic.",
          variant: "default"
        });
      } catch (error) {
        console.error("Error during plan change:", error);
        toast({
          title: "Downgrade failed",
          description: "There was an error processing your request. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsUpgrading(false);
      }
      return;
    }

    const planObj = mergedPlans.find(p => p.id === plan);
    if (planObj) {
      setSelectedPlan(planObj);
      setPaymentDialogOpen(true);
    }
  };

  const isCurrentPlan = (planId: string) => {
    if (!user) return false;
    
    if (isPremium && (planId === 'pro' || planId === 'enterprise')) {
      return true;
    }

    if (!isPremium && planId === 'basic') {
      return true;
    }

    return false;
  };

  const closePaymentDialog = () => {
    setPaymentDialogOpen(false);
    setSelectedPlan(null);
  };

  // If showing PayPal simulation
  if (showPayPalSimulation) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
          <div className="flex justify-center mb-4">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">PayPal</div>
          </div>
          
          <h2 className="text-xl font-semibold text-center mb-6">Complete Your Purchase</h2>
          
          <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-md mb-6">
            <p className="text-center text-2xl font-bold mb-2">$9.99 USD</p>
            <p className="text-center text-gray-600 dark:text-gray-400">Payment to: Bhagwat Wisdom</p>
            <p className="text-center text-sm text-gray-500 dark:text-gray-500">Premium Plan - Monthly Subscription</p>
          </div>
          
          {simulationComplete ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-medium mb-2">Payment Successful!</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Redirecting you back to Bhagwat Wisdom...</p>
            </div>
          ) : (
            <>
              {simulationProcessing ? (
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600 dark:text-blue-400" />
                  <p className="text-gray-600 dark:text-gray-400">Processing your payment...</p>
                </div>
              ) : (
                <>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full mb-4"
                    onClick={processPayPalSimulation}
                  >
                    Pay Now
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="w-full" 
                    onClick={() => {
                      setShowPayPalSimulation(false);
                      navigate('/pricing');
                    }}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </>
          )}
          
          <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
            <p>This is a simulated payment page for demonstration purposes.</p>
            <p>No actual payment will be processed.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageLayout 
      title="Pricing Plans" 
      description="Choose the plan that best fits your spiritual journey"
    >
      <div className="container py-10 px-4 md:px-6">
        <PaymentStatus />

        <div className="max-w-3xl mx-auto mb-10 text-center">
          <h1 className="text-3xl font-heading font-bold mb-4">Choose Your Spiritual Path</h1>
          <p className="text-muted-foreground">
            Select the plan that aligns with your spiritual journey and access features designed 
            to enhance your connection with ancient wisdom.
          </p>
        </div>
        
        <div className="grid gap-6 md:hidden">
          {mergedPlans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={isCurrentPlan(plan.id)}
              isUpgrading={isUpgrading}
              onUpgradeClick={handleUpgradeClick}
            />
          ))}
        </div>

        <PricingTable
          plans={mergedPlans}
          allFeatures={ALL_FEATURES}
          isCurrentPlan={isCurrentPlan}
          isUpgrading={isUpgrading}
          onUpgradeClick={handleUpgradeClick}
        />
        
        <PricingFAQ />
      </div>
      
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      
      <Dialog open={paymentDialogOpen} onOpenChange={closePaymentDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogTitle>Subscribe to {selectedPlan?.name} Plan</DialogTitle>
          <DialogDescription>
            Complete your payment to activate your subscription.
          </DialogDescription>
          
          {selectedPlan && (
            <PaymentMethods 
              planId={selectedPlan.dbId || selectedPlan.id}
              planName={selectedPlan.name}
              price={selectedPlan.price}
              currency={selectedPlan.currency || 'USD'}
              onClose={closePaymentDialog}
            />
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
