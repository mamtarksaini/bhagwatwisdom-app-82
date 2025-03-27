
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignInForm } from '@/components/auth/SignInForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AuthPage = () => {
  const navigate = useNavigate();
  const { status } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('signin');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if we're on a password reset flow
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      setResetToken('recovery');
      setActiveTab('reset');
    }

    // If user is already authenticated, redirect to home
    if (status === 'authenticated') {
      navigate('/');
    }
  }, [status, navigate]);

  const handleSignInSuccess = () => {
    navigate('/');
  };

  const handleSignUpSuccess = () => {
    // After signup, show a message and switch to sign in tab
    setActiveTab('signin');
  };

  const handleForgotPasswordSuccess = () => {
    // After sending reset email, go back to sign in
    setShowForgotPassword(false);
    setActiveTab('signin');
  };

  const handleResetPasswordSuccess = () => {
    // After password reset, go to sign in
    setResetToken(null);
    setActiveTab('signin');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <p className="text-lg">Loading authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tighter text-gradient">
            Bhagavad Wisdom
          </h1>
          <p className="text-muted-foreground mt-2">
            Sign in to your account to access personalized spiritual guidance
          </p>
        </div>

        <Card className="glass-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              {resetToken ? 'Reset Password' : 
                showForgotPassword ? 'Forgot Password' : 'Welcome Back'}
            </CardTitle>
            <CardDescription>
              {resetToken ? 'Create a new password for your account' : 
                showForgotPassword ? 'Enter your email to reset your password' : 
                'Sign in to your account or create a new one'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resetToken ? (
              <ResetPasswordForm onSuccess={handleResetPasswordSuccess} />
            ) : showForgotPassword ? (
              <>
                <ForgotPasswordForm onSuccess={handleForgotPasswordSuccess} />
                <Button 
                  variant="link" 
                  className="mt-4 px-0" 
                  onClick={() => setShowForgotPassword(false)}
                >
                  Back to Sign In
                </Button>
              </>
            ) : (
              <>
                <Tabs defaultValue="signin" value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="signin" className="mt-0">
                    <SignInForm onSuccess={handleSignInSuccess} />
                    <div className="mt-4 text-center">
                      <Button 
                        variant="link" 
                        className="text-sm" 
                        onClick={() => setShowForgotPassword(true)}
                      >
                        Forgot Password?
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="signup" className="mt-0">
                    <SignUpForm onSuccess={handleSignUpSuccess} />
                  </TabsContent>
                </Tabs>
              </>
            )}
          </CardContent>
        </Card>

        <Alert variant="info" className="mt-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            For development purposes, you may need to disable email verification in your Supabase project settings.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default AuthPage;
