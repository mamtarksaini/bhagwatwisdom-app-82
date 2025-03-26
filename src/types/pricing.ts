
import { ReactNode } from 'react';

export interface PricingPlan {
  id: string;
  dbId?: string; // Optional database ID
  name: string;
  price: number;
  currency?: string;
  interactions: string;
  popular: boolean;
  description: string;
  icon: ReactNode;
  features: string[];
}
