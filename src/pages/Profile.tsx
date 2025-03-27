import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Home, LogOut, User, Info } from "lucide-react";
import { useAuth } from '@/contexts/auth';
import { toast } from '@/hooks/use-toast';
import { PageLayout } from '@/components/layout/PageLayout';

const Profile = () => {
  const navigate = useNavigate();
  const { user, status, signOut } = useAuth();

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

  if (status === 'loading') {
    return (
      <PageLayout>
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
      <PageLayout>
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
    <PageLayout>
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
                <p className="text-lg">{user?.is_premium ? 'Premium' : 'Free'}</p>
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
        </div>
      </div>
    </PageLayout>
  );
}

export default Profile;
