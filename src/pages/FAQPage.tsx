
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

const FAQPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const faqs: FAQ[] = [
    {
      question: "What is Bhagwat Wisdom?",
      answer: "Bhagwat Wisdom is a digital platform that applies teachings from the Bhagavad Gita to modern life challenges. Our app offers tools like the Problem Solver, Dream Interpreter, Mood-Based Mantras, and Daily Verses to help users navigate life with spiritual guidance.",
      category: "general"
    },
    {
      question: "Do I need to be Hindu to use Bhagwat Wisdom?",
      answer: "Not at all. While the wisdom comes from Hindu scripture, the principles and teachings are universal. We've designed our platform to be accessible to people of all backgrounds, beliefs, and spiritual journeys.",
      category: "general"
    },
    {
      question: "How does the Problem Solver work?",
      answer: "Our Problem Solver takes your specific life challenge and provides guidance based on relevant teachings from the Bhagavad Gita. It analyzes your situation and offers spiritual perspectives, practical advice, and suggested actions to help you navigate your challenges.",
      category: "features"
    },
    {
      question: "Is my personal information secure?",
      answer: "Yes. We take data privacy seriously. The personal issues and dreams you share are encrypted and used only to provide you with relevant guidance. We do not share your data with third parties. You can learn more in our Privacy Policy.",
      category: "privacy"
    },
    {
      question: "What's included in the premium subscription?",
      answer: "Premium members get unlimited access to all features including the Problem Solver, Dream Interpreter, and Mantras. You'll also receive personalized recommendations, ad-free experience, offline access to saved wisdom, and priority customer support.",
      category: "subscription"
    },
    {
      question: "How do I cancel my subscription?",
      answer: "You can cancel your subscription anytime through your account settings. Your premium access will continue until the end of your current billing period. No partial refunds are provided, but you won't be charged again after cancellation.",
      category: "subscription"
    },
    {
      question: "Are the dream interpretations accurate?",
      answer: "Our Dream Interpreter provides insights based on spiritual symbolism found in Vedic literature. While no interpretation can be 100% accurate, our system offers thoughtful perspectives that many users find valuable for self-reflection.",
      category: "features"
    },
    {
      question: "How often are new mantras and affirmations added?",
      answer: "We regularly update our database of mantras and affirmations. New content is typically added monthly, with special additions during important spiritual occasions and festivals.",
      category: "content"
    },
    {
      question: "Can I use Bhagwat Wisdom offline?",
      answer: "Premium users can save wisdom, mantras, and verses for offline access. The basic app requires an internet connection to generate new content, but previously viewed content may be available offline depending on your device's cache.",
      category: "features"
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 7-day refund policy for new subscribers if you're not satisfied with the premium features. Please see our Refund Policy page for complete details on eligibility and the refund process.",
      category: "subscription"
    }
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group FAQs by category
  const groupedFaqs: Record<string, FAQ[]> = {};
  
  filteredFaqs.forEach((faq) => {
    if (!groupedFaqs[faq.category]) {
      groupedFaqs[faq.category] = [];
    }
    groupedFaqs[faq.category].push(faq);
  });

  // Category display names
  const categoryNames: Record<string, string> = {
    general: "General Questions",
    features: "App Features",
    subscription: "Subscriptions & Billing",
    privacy: "Privacy & Security",
    content: "Content & Updates"
  };

  return (
    <PageLayout
      title="Frequently Asked Questions"
      description="Find answers to common questions about Bhagwat Wisdom."
    >
      <div className="space-y-8">
        {/* Search Bar */}
        <div className="relative max-w-md mx-auto mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 px-2"
              onClick={() => setSearchQuery("")}
            >
              Clear
            </Button>
          )}
        </div>

        {/* Display results count when searching */}
        {searchQuery && (
          <div className="text-center text-sm text-muted-foreground mb-6">
            {filteredFaqs.length} {filteredFaqs.length === 1 ? "result" : "results"} found for "{searchQuery}"
          </div>
        )}

        {/* FAQs by Category */}
        {Object.keys(groupedFaqs).length > 0 ? (
          Object.entries(groupedFaqs).map(([category, faqs]) => (
            <div key={category} className="mb-8">
              <h2 className="text-xl font-heading font-bold mb-4">
                {categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1)}
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`${category}-${index}`}>
                    <AccordionTrigger className="text-left font-medium">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="prose dark:prose-invert">
                      <p>{faq.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No questions found matching your search. Try a different query.</p>
          </div>
        )}

        {/* Contact Section */}
        <div className="bg-secondary/50 p-6 rounded-lg text-center mt-8">
          <h2 className="text-xl font-heading font-bold mb-2">Still have questions?</h2>
          <p className="mb-4">We're here to help with any questions you have about Bhagwat Wisdom.</p>
          <Button asChild className="button-gradient">
            <a href="/contact">Contact Our Support Team</a>
          </Button>
        </div>
      </div>
    </PageLayout>
  );
};

export default FAQPage;
