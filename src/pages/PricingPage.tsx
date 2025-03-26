
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { PageLayout } from '@/components/layout/PageLayout';
import { PricingCard } from '@/components/pricing/PricingCard';
import { PricingTable } from '@/components/pricing/PricingTable';
import { PricingFAQ } from '@/components/pricing/PricingFAQ';
import { PRICING_PLANS, ALL_FEATURES } from '@/constants/pricingPlans';
import { toast } from '@/components/ui/use-toast';

export default function PricingPage() {
  const { user, isPremium, upgradeToPremium } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgradeClick = async (plan: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setIsUpgrading(true);
    
    try {
      if (plan === 'pro' || plan === 'enterprise') {
        // In a real app, you'd integrate with a payment processor here
        await upgradeToPremium();
        
        toast({
          title: "Upgrade successful!",
          description: `You now have access to all ${plan === 'pro' ? 'Pro' : 'Enterprise'} features.`,
          variant: "success"
        });
      } else if (plan === 'basic' && isPremium) {
        // Handle downgrade - would need to add this function to auth context
        toast({
          title: "Downgrade successful",
          description: "Your plan has been changed to Basic.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Error during plan change:", error);
      toast({
        title: "Upgrade failed",
        description: "There was an error processing your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpgrading(false);
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

  return (
    <PageLayout 
      title="Pricing Plans" 
      description="Choose the plan that best fits your spiritual journey"
    >
      <div className="container py-10 px-4 md:px-6">
        <div className="max-w-3xl mx-auto mb-10 text-center">
          <h1 className="text-3xl font-heading font-bold mb-4">Choose Your Spiritual Path</h1>
          <p className="text-muted-foreground">
            Select the plan that aligns with your spiritual journey and access features designed 
            to enhance your connection with ancient wisdom.
          </p>
        </div>
        
        {/* Mobile View - Cards */}
        <div className="grid gap-6 md:hidden">
          {PRICING_PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={isCurrentPlan(plan.id)}
              isUpgrading={isUpgrading}
              onUpgradeClick={handleUpgradeClick}
            />
          ))}
        </div>

        {/* Desktop View - Table */}
        <PricingTable
          plans={PRICING_PLANS}
          allFeatures={ALL_FEATURES}
          isCurrentPlan={isCurrentPlan}
          isUpgrading={isUpgrading}
          onUpgradeClick={handleUpgradeClick}
        />
        
        {/* Pricing FAQ */}
        <PricingFAQ />
      </div>
      
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </PageLayout>
  );
}
