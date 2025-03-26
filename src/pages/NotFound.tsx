
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, AlertTriangle, HelpCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <AlertTriangle className="h-20 w-20 text-gold" />
        </div>
        <h1 className="text-6xl font-bold mb-4 text-gradient">404</h1>
        <h2 className="text-2xl font-medium mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The page you're looking for at <span className="font-mono text-sm bg-secondary/50 px-2 py-1 rounded">{location.pathname}</span> doesn't exist or has been moved. Let's help you find your way back to wisdom.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button asChild className="flex items-center gap-2 w-full">
            <Link to="/">
              <Home className="h-4 w-4" />
              Return Home
            </Link>
          </Button>
          <Button variant="outline" asChild className="flex items-center gap-2 w-full">
            <Link to="/support">
              <HelpCircle className="h-4 w-4" />
              Contact Support
            </Link>
          </Button>
        </div>
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Looking for something specific? Visit our <Link to="/sitemap" className="text-primary hover:underline">sitemap</Link> or <Link to="/blog" className="text-primary hover:underline">blog</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
