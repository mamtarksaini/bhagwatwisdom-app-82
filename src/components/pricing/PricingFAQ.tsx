
import React from 'react';

export function PricingFAQ() {
  return (
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
  );
}
