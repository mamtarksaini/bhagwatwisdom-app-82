
import React from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PremiumUpgrade } from "@/components/premium/PremiumUpgrade";
import { Loader2, LogOut, User, Home } from "lucide-react";
import { useNavigate, Link } from 'react-router-dom';
import { AuthModal } from "@/components/auth/AuthModal";

const Profile = () => {
  const { user, status, signOut } = useAuth();
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <h1 className="text-3xl font-heading font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Your Spiritual Journey
            </h1>
            <p className="max-w-[700px] text-muted-foreground">
              Sign in to save your readings, access premium features, and continue your spiritual growth.
            </p>
            <Button onClick={() => setAuthModalOpen(true)} className="button-gradient">
              Sign In / Sign Up
            </Button>
            <Button variant="outline" onClick={() => navigate('/')}>
              Return Home
            </Button>
            
            <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-8">
          <h1 className="text-3xl font-heading font-bold tracking-tighter sm:text-4xl md:text-5xl text-gradient">
            Your Spiritual Journey
          </h1>
          
          <div className="flex space-x-4">
            <Button variant="outline" onClick={() => navigate('/')} className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Return to Home
            </Button>
          </div>

          <div className="grid w-full max-w-4xl gap-8 md:grid-cols-2">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Manage your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <div className="size-24 rounded-full bg-muted flex items-center justify-center">
                    <User className="size-12 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                    <p className="text-lg">{user?.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                    <p className="text-lg">{user?.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Member Since</h3>
                    <p className="text-lg">
                      {user?.created_at 
                        ? new Date(user.created_at).toLocaleDateString()
                        : 'Recently'}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => signOut()} 
                  variant="outline" 
                  className="w-full"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </CardFooter>
            </Card>
            
            <PremiumUpgrade />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
