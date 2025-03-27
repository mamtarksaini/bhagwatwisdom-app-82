
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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

export default function PricingPage() {
  const { user, isPremium } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [dbPlans, setDbPlans] = useState<any[]>([]);

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
  }, []);

  const mergedPlans = React.useMemo(() => {
    if (!dbPlans.length) {
      return PRICING_PLANS;
    }

    return PRICING_PLANS.map(plan => {
      const dbPlan = dbPlans.find(p => p.name.toLowerCase() === plan.id);
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
