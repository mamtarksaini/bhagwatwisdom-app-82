
import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { PricingPlan } from '@/types/pricing';

interface PricingTableProps {
  plans: PricingPlan[];
  allFeatures: string[];
  isCurrentPlan: (planId: string) => boolean;
  isUpgrading: boolean;
  onUpgradeClick: (planId: string) => void;
}

export function PricingTable({ 
  plans, 
  allFeatures, 
  isCurrentPlan,
  isUpgrading, 
  onUpgradeClick 
}: PricingTableProps) {
  return (
    <div className="hidden md:block overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Plan</TableHead>
            {plans.map((plan) => (
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
                    <span className="text-2xl font-bold">{plan.currency || '$'}{plan.price}</span>
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
            {plans.map((plan) => (
              <TableCell key={plan.id} className={`text-center ${plan.popular ? 'bg-gold/5' : ''}`}>
                {plan.description}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Monthly Interactions</TableCell>
            {plans.map((plan) => (
              <TableCell key={plan.id} className={`text-center font-semibold ${plan.popular ? 'bg-gold/5' : ''}`}>
                {plan.interactions}
              </TableCell>
            ))}
          </TableRow>
          {/* Features */}
          {allFeatures.map((feature, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{feature}</TableCell>
              {plans.map((plan) => (
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
            {plans.map((plan) => (
              <TableCell 
                key={plan.id} 
                className={`p-4 ${plan.popular ? 'bg-gold/5' : ''}`}
              >
                {isCurrentPlan(plan.id) ? (
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
                      plan.id === 'basic' ? 'Downgrade' : 'Upgrade Now'
                    )}
                  </Button>
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
