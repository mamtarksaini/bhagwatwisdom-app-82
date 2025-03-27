
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Home, Info } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-8">
          <h1 className="text-3xl font-heading font-bold tracking-tighter sm:text-4xl md:text-5xl text-gradient">
            Your Spiritual Journey
          </h1>
          
          <Alert variant="info" className="max-w-2xl">
            <Info className="h-4 w-4" />
            <AlertTitle>Authentication Disabled</AlertTitle>
            <AlertDescription>
              Sign-in and sign-up features have been temporarily disabled to resolve system issues.
              You can continue to use the application as a guest user.
            </AlertDescription>
          </Alert>
          
          <Button variant="outline" onClick={() => navigate('/')} className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Return to Home
          </Button>
          
          <Card className="glass-card max-w-2xl w-full">
            <CardHeader>
              <CardTitle>Guest Mode</CardTitle>
              <CardDescription>You are currently using the application as a guest</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                While authentication is disabled, you can still access all the public features of Bhagavad Wisdom.
                Explore the spiritual guidance tools and resources available to all users.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Profile;
