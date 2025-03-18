
import React from 'react';

export function PremiumBanner() {
  return (
    <div className="mt-4 bg-gold/10 dark:bg-gold/20 rounded-lg p-4 text-sm">
      <p className="font-medium mb-1">Upgrade to Premium for enhanced guidance:</p>
      <ul className="list-disc pl-5 space-y-1 text-foreground/80">
        <li>Detailed solutions with specific verse references</li>
        <li>Personalized mantras for your situation</li>
        <li>Access to all available languages</li>
        <li>Voice input and output in all languages</li>
      </ul>
    </div>
  );
}
