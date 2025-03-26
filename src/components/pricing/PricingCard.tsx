
import React from 'react';
import { Check, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PricingPlan } from '@/types/pricing';

interface PricingCardProps {
  plan: PricingPlan;
  isCurrentPlan: boolean;
  isUpgrading: boolean;
  onUpgradeClick: (planId: string) => void;
}

export function PricingCard({ plan, isCurrentPlan, isUpgrading, onUpgradeClick }: PricingCardProps) {
  return (
    <div 
      className={`rounded-lg border p-6 ${
        plan.popular ? 'border-gold bg-gold/5 relative' : ''
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gold px-3 py-1 rounded-full text-xs font-semibold text-white">
          Most Popular
        </div>
      )}
      
      <div className="flex items-center gap-2 mb-4">
        {plan.icon}
        <h3 className="text-xl font-bold">{plan.name}</h3>
      </div>
      
      <div className="mb-4">
        <span className="text-3xl font-bold">${plan.price}</span>
        <span className="text-muted-foreground">/month</span>
      </div>
      
      <p className="text-muted-foreground mb-6">{plan.description}</p>
      
      <ul className="space-y-2 mb-6">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      
      {isCurrentPlan ? (
        <Button disabled className="w-full bg-green-600 hover:bg-green-700">
          <Check className="mr-2 h-4 w-4" />
          Current Plan
        </Button>
      ) : (
        <Button 
          onClick={() => onUpgradeClick(plan.id)} 
          className={plan.id === 'basic' ? 'w-full' : 'w-full button-gradient'}
          variant={plan.id === 'basic' ? 'outline' : 'default'}
          disabled={isUpgrading}
        >
          {isUpgrading ? "Processing..." : (
            plan.id === 'basic' ? 
              'Sign Up Free' : 
              'Subscribe Now'
          )}
        </Button>
      )}
    </div>
  );
}
