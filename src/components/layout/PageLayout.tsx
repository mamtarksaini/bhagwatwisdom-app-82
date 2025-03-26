
import React from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export function PageLayout({ children, title, description }: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 w-full pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <header className="mb-10 text-center">
              <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-gradient">
                {title}
              </h1>
              {description && (
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  {description}
                </p>
              )}
            </header>
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
