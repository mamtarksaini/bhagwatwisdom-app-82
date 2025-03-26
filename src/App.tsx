
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import AboutPage from '@/pages/AboutPage';
import FAQPage from '@/pages/FAQPage';
import { ProblemSolverPage } from '@/pages/ProblemSolverPage';
import { DreamInterpreterPage } from '@/pages/DreamInterpreterPage';
import { ChatAgentPage } from '@/pages/ChatAgentPage';
import { MoodMantraPage } from '@/pages/MoodMantraPage';
import { AffirmationsPage } from '@/pages/AffirmationsPage';
import Profile from '@/pages/Profile';
import ContactPage from '@/pages/ContactPage';
import TermsPage from '@/pages/TermsPage';
import PrivacyPage from '@/pages/PrivacyPage';
import RefundPage from '@/pages/RefundPage';
import SupportPage from '@/pages/SupportPage';
import { SitemapPage } from '@/pages/SitemapPage';
import BlogPage from '@/pages/BlogPage';
import DocumentationPage from '@/pages/DocumentationPage';
import IntroToGitaPage from '@/pages/documentation/IntroToGitaPage';
import CorePrinciplesPage from '@/pages/documentation/CorePrinciplesPage';
import StressManagementPage from '@/pages/documentation/StressManagementPage';
import PricingPage from '@/pages/PricingPage';
import NotFound from '@/pages/NotFound';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import './App.css';

// Initialize QueryClient for React Query
const queryClient = new QueryClient();

function App() {
  return (
    <div className="App">
      <ThemeProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <Router>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/problem-solver" element={<ProblemSolverPage />} />
                <Route path="/dream-interpreter" element={<DreamInterpreterPage />} />
                <Route path="/chat-agent" element={<ChatAgentPage />} />
                <Route path="/mood-mantra" element={<MoodMantraPage />} />
                <Route path="/mantras" element={<MoodMantraPage />} />
                <Route path="/affirmations" element={<AffirmationsPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/refund" element={<RefundPage />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/sitemap" element={<SitemapPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/documentation" element={<DocumentationPage />} />
                
                {/* Documentation Guide Pages */}
                <Route path="/documentation/intro-to-gita" element={<IntroToGitaPage />} />
                <Route path="/documentation/core-principles" element={<CorePrinciplesPage />} />
                <Route path="/documentation/stress-management" element={<StressManagementPage />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </Router>
          </QueryClientProvider>
        </AuthProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;
