
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Moon, Sun, Menu, X, Book, Globe, MessageSquare, LogIn, User, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ui/ThemeProvider';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { Language } from '@/types';
import { useAuth } from '@/contexts/auth';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [language, setLanguage] = useState<Language>("english");
  const { user, status, signOut } = useAuth();
  
  // Check if we're on the home page
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    // You could also save this to localStorage or context for persistence
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-background sticky top-0 z-50 border-b">
      <div className="container flex items-center justify-between py-4">
        <nav className="flex items-center justify-between w-full">
          <div className="flex">
            <Link to="/" className="font-bold text-2xl flex items-center gap-2">
              <Book className="h-6 w-6" />
              Bhagavad Wisdom
            </Link>

            {isHomePage && (
              <div className="hidden md:flex items-center space-x-6 ml-8">
                <Link to="/problem-solver" className="font-medium flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                  Problem Solver
                </Link>
                <Link to="/dream-interpreter" className="font-medium flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                  Dream Interpreter
                </Link>
                <Link to="/chat-agent" className="font-medium flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                  <MessageSquare className="h-4 w-4" />
                  Chat Agent
                </Link>
                <Link to="/mood-mantra" className="font-medium flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                  Mood Mantras
                </Link>
                <Link to="/affirmations" className="font-medium flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                  Affirmations
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <LanguageSelector 
              value={language} 
              onChange={handleLanguageChange} 
              variant={isMobile ? "minimal" : "default"} 
              className="mr-1"
            />
            
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {status === 'authenticated' ? (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {isMobile ? null : "Profile"}
                  </Link>
                </Button>
                {!isMobile && (
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/auth" className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    {isMobile ? null : "Sign In"}
                  </Link>
                </Button>
                <Button variant="default" size="sm" asChild className="hidden md:flex">
                  <Link to="/auth?tab=signup" className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4" />
                    Sign Up
                  </Link>
                </Button>
              </div>
            )}

            {isMobile && isHomePage && (
              <Button variant="ghost" size="icon" onClick={toggleMenu}>
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            )}
          </div>
        </nav>
      </div>

      {isMobile && isMenuOpen && isHomePage && (
        <div className="py-4 bg-background border-t">
          <div className="container flex flex-col space-y-4">
            <Link to="/problem-solver" className="font-medium flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              Problem Solver
            </Link>
            <Link to="/dream-interpreter" className="font-medium flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              Dream Interpreter
            </Link>
            <Link to="/chat-agent" className="font-medium flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <MessageSquare className="h-4 w-4" />
              Chat Agent
            </Link>
            <Link to="/mood-mantra" className="font-medium flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              Mood Mantras
            </Link>
            <Link to="/affirmations" className="font-medium flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              Affirmations
            </Link>
            <Link to="/about" className="font-medium flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            
            {status === 'authenticated' ? (
              <>
                <Link to="/profile" className="font-medium flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <Button variant="outline" size="sm" onClick={handleSignOut} className="justify-start">
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth" className="font-medium flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
                <Link to="/auth?tab=signup" className="font-medium flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                  <KeyRound className="h-4 w-4" />
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
