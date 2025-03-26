
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { PageLayout } from '@/components/layout/PageLayout';
import { PricingCard } from '@/components/pricing/PricingCard';
import { PricingTable } from '@/components/pricing/PricingTable';
import { PricingFAQ } from '@/components/pricing/PricingFAQ';
import { PRICING_PLANS, ALL_FEATURES } from '@/constants/pricingPlans';

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
    if (plan === 'pro' || plan === 'enterprise') {
      await upgradeToPremium();
    }
    setIsUpgrading(false);
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
