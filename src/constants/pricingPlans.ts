
import { Zap, Crown, CircleDollarSign } from 'lucide-react';
import React from 'react';
import { PricingPlan } from '@/types/pricing';

// All possible features across all plans
export const ALL_FEATURES = [
  "Basic wisdom responses",
  "Personalized mantras",
  "Multiple languages",
  "Voice input and output",
  "Ad-free experience",
  "Priority customer support",
  "Save wisdom history"
];

// Pricing plan data
export const PRICING_PLANS: PricingPlan[] = [
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
