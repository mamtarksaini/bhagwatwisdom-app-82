
import React from 'react';
import { Check, CircleDollarSign, Crown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { useNavigate } from 'react-router-dom';
import { PREMIUM_PRICE } from '@/utils/constants';
import PageLayout from '@/components/layout/PageLayout';

export default function PricingPage() {
  const { user, isPremium, upgradeToPremium } = useAuth();
  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  const [isUpgrading, setIsUpgrading] = React.useState(false);
  const navigate = useNavigate();

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

  const getCurrentPlanButton = (planId: string) => {
    if (!user) {
      return (
        <Button 
          onClick={() => handleUpgradeClick(planId)} 
          className={planId === 'basic' ? 'w-full' : 'w-full button-gradient'}
          variant={planId === 'basic' ? 'outline' : 'default'}
        >
          {planId === 'basic' ? 'Sign Up Free' : 'Subscribe Now'}
        </Button>
      );
    }

    if (isPremium && (planId === 'pro' || planId === 'enterprise')) {
      return (
        <Button disabled className="w-full bg-green-600 hover:bg-green-700">
          <Check className="mr-2 h-4 w-4" />
          Current Plan
        </Button>
      );
    }

    if (!isPremium && planId === 'basic') {
      return (
        <Button disabled className="w-full bg-green-600 hover:bg-green-700">
          <Check className="mr-2 h-4 w-4" />
          Current Plan
        </Button>
      );
    }

    return (
      <Button 
        onClick={() => handleUpgradeClick(planId)} 
        className={planId === 'basic' ? 'w-full' : 'w-full button-gradient'}
        variant={planId === 'basic' ? 'outline' : 'default'}
        disabled={isUpgrading}
      >
        {isUpgrading ? "Processing..." : (planId === 'basic' ? 'Downgrade' : 'Upgrade Now')}
      </Button>
    );
  };

  return (
    <PageLayout>
      <div className="container py-10 px-4 md:px-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gradient mb-4">
            Choose Your Spiritual Journey
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Select the plan that best fits your needs and begin your path to inner wisdom and peace.
          </p>
        </div>

        {/* Mobile View - Cards */}
        <div className="grid gap-6 md:hidden">
          {pricingPlans.map((plan) => (
            <div 
              key={plan.id}
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
              
              {getCurrentPlanButton(plan.id)}
            </div>
          ))}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden md:block overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Plan</TableHead>
                {pricingPlans.map((plan) => (
                  <TableHead 
                    key={plan.id} 
                    className={`text-center ${plan.popular ? 'bg-gold/10' : ''}`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2">
                        {plan.icon}
                        <span className="font-bold">{plan.name}</span>
                      </div>
                      <div>
                        <span className="text-2xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      {plan.popular && (
                        <span className="bg-gold text-white px-2 py-0.5 rounded-full text-xs">
                          Most Popular
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Description</TableCell>
                {pricingPlans.map((plan) => (
                  <TableCell key={plan.id} className={`text-center ${plan.popular ? 'bg-gold/5' : ''}`}>
                    {plan.description}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Monthly Interactions</TableCell>
                {pricingPlans.map((plan) => (
                  <TableCell key={plan.id} className={`text-center font-semibold ${plan.popular ? 'bg-gold/5' : ''}`}>
                    {plan.interactions}
                  </TableCell>
                ))}
              </TableRow>
              {/* Features */}
              {allFeatures.map((feature, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{feature}</TableCell>
                  {pricingPlans.map((plan) => (
                    <TableCell 
                      key={plan.id} 
                      className={`text-center ${plan.popular ? 'bg-gold/5' : ''}`}
                    >
                      {plan.features.includes(feature) ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {/* Action Row */}
              <TableRow>
                <TableCell />
                {pricingPlans.map((plan) => (
                  <TableCell 
                    key={plan.id} 
                    className={`p-4 ${plan.popular ? 'bg-gold/5' : ''}`}
                  >
                    {getCurrentPlanButton(plan.id)}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
        
        {/* Pricing FAQ */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Can I change plans later?</h3>
              <p className="text-muted-foreground">Yes, you can upgrade, downgrade, or cancel your subscription at any time.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">What counts as an "interaction"?</h3>
              <p className="text-muted-foreground">An interaction is counted each time you submit a question or request to our wisdom agents, including the Problem Solver, Dream Interpreter, and Chat Agent.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Do you offer refunds?</h3>
              <p className="text-muted-foreground">Yes, we offer a 7-day money-back guarantee if you're not satisfied with our service.</p>
            </div>
          </div>
        </div>
      </div>
      
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </PageLayout>
  );
}

// All possible features across all plans
const allFeatures = [
  "Basic wisdom responses",
  "Personalized mantras",
  "Multiple languages",
  "Voice input and output",
  "Ad-free experience",
  "Priority customer support",
  "Save wisdom history"
];

// Pricing plan data
const pricingPlans = [
  {
    id: "basic",
    name: "Basic",
    price: 0,
    interactions: "5",
    popular: false,
    description: "Perfect for beginners starting their spiritual journey",
    icon: <Zap className="h-5 w-5 text-blue-500" />,
    features: [
      "Basic wisdom responses",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 10,
    interactions: "250",
    popular: true,
    description: "Enhanced wisdom for dedicated spiritual seekers",
    icon: <Crown className="h-5 w-5 text-gold" />,
    features: [
      "Basic wisdom responses",
      "Personalized mantras",
      "Multiple languages",
      "Voice input and output",
      "Ad-free experience",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 20,
    interactions: "Unlimited",
    popular: false,
    description: "Complete spiritual guidance for the most dedicated",
    icon: <CircleDollarSign className="h-5 w-5 text-green-500" />,
    features: [
      "Basic wisdom responses",
      "Personalized mantras",
      "Multiple languages",
      "Voice input and output",
      "Ad-free experience",
      "Priority customer support",
      "Save wisdom history",
    ],
  },
];
