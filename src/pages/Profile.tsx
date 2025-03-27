
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Home, LogOut, User, Info, Crown } from "lucide-react";
import { useAuth } from '@/contexts/auth';
import { toast } from '@/hooks/use-toast';
import { PageLayout } from '@/components/layout/PageLayout';
import { PRICING_PLANS, ALL_FEATURES } from '@/constants/pricingPlans';
import { PricingCard } from '@/components/pricing/PricingCard';
import { Link } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const { user, status, signOut, isPremium } = useAuth();

  useEffect(() => {
    // If user is not authenticated and not in loading state, redirect to auth page
    if (status === 'unauthenticated') {
      navigate('/auth');
    }
  }, [status, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message || "An error occurred during sign out.",
        variant: "destructive",
      });
    }
  };

  const handleUpgradeClick = (planId: string) => {
    navigate('/pricing');
  };

  const isCurrentPlan = (planId: string) => {
    if (!user) return false;
    
    if (isPremium && (planId === 'pro' || planId === 'enterprise')) {
      return true;
    }

    if (!isPremium && planId === 'basic') {
      return true;
    }

    return false;
  };

  if (status === 'loading') {
    return (
      <PageLayout title="Loading Profile">
        <div className="container px-4 md:px-6 py-8">
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="animate-pulse text-center">
              <p className="text-lg">Loading profile...</p>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <PageLayout title="Authentication Required">
        <div className="container px-4 md:px-6 py-8">
          <div className="flex flex-col items-center space-y-8">
            <Alert variant="info" className="max-w-lg">
              <Info className="h-4 w-4" />
              <AlertTitle>Authentication Required</AlertTitle>
              <AlertDescription>
                Please sign in to view your profile.
              </AlertDescription>
            </Alert>
            
            <Button onClick={() => navigate('/auth')} className="button-gradient">
              Sign In
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Your Profile">
      <div className="container px-4 md:px-6 py-8">
        <div className="flex flex-col items-center space-y-8">
          <h1 className="text-3xl font-heading font-bold tracking-tighter sm:text-4xl md:text-5xl text-gradient">
            Your Spiritual Journey
          </h1>
          
          <Card className="glass-card max-w-lg w-full">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Name</h3>
                <p className="text-lg">{user?.name || 'Not provided'}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Email</h3>
                <p className="text-lg">{user?.email || 'Not provided'}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Account Type</h3>
                <p className="text-lg flex items-center gap-2">
                  {isPremium ? (
                    <>
                      <Crown className="h-4 w-4 text-gold" /> Premium
                    </>
                  ) : 'Free'}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigate('/')} className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Home
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </CardFooter>
          </Card>

          <div className="max-w-3xl mx-auto mt-8 text-center">
            <h2 className="text-2xl font-heading font-bold mb-4">Your Subscription Plan</h2>
            <p className="text-muted-foreground mb-8">
              Enhance your spiritual journey with our premium features
            </p>

            <div className="grid gap-6 md:grid-cols-3">
              {PRICING_PLANS.map((plan) => (
                <PricingCard
                  key={plan.id}
                  plan={plan}
                  isCurrentPlan={isCurrentPlan(plan.id)}
                  isUpgrading={false}
                  onUpgradeClick={handleUpgradeClick}
                />
              ))}
            </div>

            <div className="mt-8">
              <Link to="/pricing">
                <Button className="button-gradient">
                  View Detailed Pricing Plans
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default Profile;
