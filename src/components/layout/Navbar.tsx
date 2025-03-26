
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Menu, X, Book, User, Settings, LogOut, Volume2, MessageSquare, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ui/ThemeProvider';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { LanguagePicker } from '@/components/features/LanguagePicker';
import { Language } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [language, setLanguage] = useState<Language>("english");

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

  return (
    <header className="bg-background sticky top-0 z-50 border-b">
      <div className="container flex items-center justify-between py-4">
        <nav className="flex items-center justify-between w-full">
          <div className="flex">
            <Link to="/" className="font-bold text-2xl flex items-center gap-2">
              <Book className="h-6 w-6" />
              Bhagavad Wisdom
            </Link>

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
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 bg-background border-border"
                onClick={() => {
                  // For the dropdown to be shown in a more controlled way, you could implement a custom dropdown here
                }}
              >
                <Globe className="h-5 w-5" />
                <span>{language === "english" ? "English" : "हिंदी"}</span>
                <svg 
                  width="12" 
                  height="12" 
                  viewBox="0 0 12 12" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="opacity-70"
                >
                  <path d="M6 8.5L10 4.5H2L6 8.5Z" fill="currentColor" />
                </svg>
              </Button>
              
              <LanguagePicker 
                value={language} 
                onValueChange={handleLanguageChange}
              />
            </div>
            
            <LanguageSelector 
              value={language} 
              onChange={handleLanguageChange} 
              variant="minimal" 
              className="mr-1 md:hidden"
            />
            
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => { window.location.href = '/profile'; }}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { window.location.href = '/settings'; }}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="default" onClick={() => { window.location.href = '/profile'; }}>
                Sign In
              </Button>
            )}

            {isMobile && (
              <Button variant="ghost" size="icon" onClick={toggleMenu}>
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            )}
          </div>
        </nav>
      </div>

      {isMobile && isMenuOpen && (
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
            <Separator />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Language</span>
              <LanguagePicker 
                value={language} 
                onValueChange={handleLanguageChange}
              />
            </div>
            
            <Separator />
            
            {user ? (
              <>
                <Link to="/profile" className="font-medium flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                  Profile
                </Link>
                <Button variant="destructive" onClick={signOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Button variant="default" onClick={() => { window.location.href = '/profile'; }}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
