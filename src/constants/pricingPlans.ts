
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

// Feature availability by plan ID
export const PLAN_FEATURES = {
  basic: [
    "Basic wisdom responses"
  ],
  pro: [
    "Basic wisdom responses",
    "Personalized mantras",
    "Multiple languages",
    "Voice input and output",
    "Ad-free experience"
  ],
  enterprise: [
    "Basic wisdom responses",
    "Personalized mantras",
    "Multiple languages",
    "Voice input and output",
    "Ad-free experience",
    "Priority customer support",
    "Save wisdom history"
  ]
};

// Interaction limits by plan
export const PLAN_LIMITS = {
  basic: 5,
  pro: 250,
  enterprise: Infinity
};

// Pricing plan data
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 0,
    interactions: "5",
    popular: false,
    description: "Perfect for beginners starting their spiritual journey",
    icon: React.createElement(Zap, { className: "h-5 w-5 text-blue-500" }),
    features: PLAN_FEATURES.basic,
  },
  {
    id: "pro",
    name: "Pro",
    price: 10,
    interactions: "250",
    popular: true,
    description: "Enhanced wisdom for dedicated spiritual seekers",
    icon: React.createElement(Crown, { className: "h-5 w-5 text-gold" }),
    features: PLAN_FEATURES.pro,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 20,
    interactions: "Unlimited",
    popular: false,
    description: "Complete spiritual guidance for the most dedicated",
    icon: React.createElement(CircleDollarSign, { className: "h-5 w-5 text-green-500" }),
    features: PLAN_FEATURES.enterprise,
  },
];

// Helper function to check if a feature is available in a plan
export const hasFeature = (planId: string, feature: string): boolean => {
  // Default to enterprise plan in testing mode
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  const planFeatures = PLAN_FEATURES[planId as keyof typeof PLAN_FEATURES] || [];
  return planFeatures.includes(feature);
};

// Helper function to get user's remaining interactions
export const getRemainingInteractions = (planId: string, usedInteractions: number): number => {
  const limit = PLAN_LIMITS[planId as keyof typeof PLAN_LIMITS] || 0;
  return Math.max(0, limit - usedInteractions);
};

// Helper function to check if user exceeded their plan limit
export const hasExceededLimit = (planId: string, usedInteractions: number): boolean => {
  // Default to no limit in testing mode
  if (process.env.NODE_ENV === 'development') {
    return false;
  }
  
  const limit = PLAN_LIMITS[planId as keyof typeof PLAN_LIMITS] || 0;
  return usedInteractions >= limit;
};
