
import React from 'react';
import { Check } from 'lucide-react';

interface PricingFeaturesListProps {
  features: string[];
}

export function PricingFeaturesList({ features }: PricingFeaturesListProps) {
  return (
    <ul className="space-y-2 mb-6">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start gap-2">
          <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
}
