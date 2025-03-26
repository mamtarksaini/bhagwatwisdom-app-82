
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ContactPage from "./pages/ContactPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import RefundPage from "./pages/RefundPage";
import AboutPage from "./pages/AboutPage";
import FAQPage from "./pages/FAQPage";
import BlogPage from "./pages/BlogPage";
import SupportPage from "./pages/SupportPage";
import DocumentationPage from "./pages/DocumentationPage";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { ProblemSolverPage } from "./pages/ProblemSolverPage";
import { DreamInterpreterPage } from "./pages/DreamInterpreterPage";
import { MoodMantraPage } from "./pages/MoodMantraPage";
import { AffirmationsPage } from "./pages/AffirmationsPage";
import { SitemapPage } from "./pages/SitemapPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/refund" element={<RefundPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/documentation" element={<DocumentationPage />} />
              <Route path="/problem-solver" element={<ProblemSolverPage />} />
              <Route path="/dream-interpreter" element={<DreamInterpreterPage />} />
              <Route path="/mood-mantra" element={<MoodMantraPage />} />
              <Route path="/affirmations" element={<AffirmationsPage />} />
              <Route path="/sitemap" element={<SitemapPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THIS LINE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
