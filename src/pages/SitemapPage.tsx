
import React from 'react';
import { PageLayout } from "@/components/layout/PageLayout";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export function SitemapPage() {
  const siteLinks = [
    {
      category: "Core Pages",
      links: [
        { name: "Home", path: "/" },
        { name: "About", path: "/about" },
        { name: "Blog", path: "/blog" },
        { name: "FAQ", path: "/faq" },
        { name: "Support", path: "/support" },
      ]
    },
    {
      category: "Wisdom Features",
      links: [
        { name: "Problem Solver", path: "/problem-solver" },
        { name: "Dream Interpreter", path: "/dream-interpreter" },
        { name: "Mood Mantra", path: "/mood-mantra" },
        { name: "Affirmations", path: "/affirmations" },
      ]
    },
    {
      category: "User Account",
      links: [
        { name: "Profile", path: "/profile" },
        { name: "Documentation", path: "/documentation" },
      ]
    },
    {
      category: "Legal & Information",
      links: [
        { name: "Terms of Service", path: "/terms" },
        { name: "Privacy Policy", path: "/privacy" },
        { name: "Refund Policy", path: "/refund" },
        { name: "Contact Us", path: "/contact" },
      ]
    }
  ];

  return (
    <PageLayout
      title="Sitemap"
      description="Find all pages and resources available on Bhagwat Wisdom"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {siteLinks.map((category) => (
          <Card key={category.category} className="overflow-hidden">
            <CardHeader className="bg-secondary/30">
              <CardTitle>{category.category}</CardTitle>
              <CardDescription>
                Navigate to {category.category.toLowerCase()} resources
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-border">
                {category.links.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
                    >
                      <span>{link.name}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageLayout>
  );
}
