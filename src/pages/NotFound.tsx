
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, AlertTriangle, HelpCircle, FileSearch, ArrowRight } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // Define popular features to suggest to the user
  const featureSuggestions = [
    { name: "Problem Solver", path: "/problem-solver", description: "Find wisdom for life's challenges" },
    { name: "Dream Interpreter", path: "/dream-interpreter", description: "Understand your dreams" },
    { name: "Mood Mantra", path: "/mood-mantra", description: "Get a mantra for your mood" },
    { name: "Daily Affirmations", path: "/affirmations", description: "Practice positive affirmations" }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="text-center max-w-lg">
        <div className="mb-6 flex justify-center">
          <AlertTriangle className="h-20 w-20 text-gold" />
        </div>
        <h1 className="text-6xl font-bold mb-4 text-gradient">404</h1>
        <h2 className="text-2xl font-medium mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The page you're looking for at <span className="font-mono text-sm bg-secondary/50 px-2 py-1 rounded">{location.pathname}</span> doesn't exist or has been moved. Let's help you find your way back to wisdom.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
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
          <h3 className="text-lg font-medium mb-4">Popular Features</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {featureSuggestions.map((feature) => (
              <Link 
                key={feature.path}
                to={feature.path}
                className="p-3 border border-border rounded-md hover:bg-secondary/30 transition-colors text-left flex justify-between items-center group"
              >
                <div>
                  <p className="font-medium">{feature.name}</p>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-border">
          <Link to="/sitemap" className="flex items-center justify-center gap-2 text-primary hover:underline">
            <FileSearch className="h-4 w-4" />
            View Complete Sitemap
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
