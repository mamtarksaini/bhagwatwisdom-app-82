
import { ReactNode } from 'react';

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interactions: string;
  popular: boolean;
  description: string;
  icon: ReactNode;
  features: string[];
}
