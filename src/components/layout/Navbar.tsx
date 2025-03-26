import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Menu, X, Book, User, Settings, LogOut, Volume2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ui/ThemeProvider';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

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
              <Link to="/voice-agent" className="font-medium flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                <Volume2 className="h-4 w-4" />
                Voice Agent
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
            <Link to="/voice-agent" className="font-medium flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <Volume2 className="h-4 w-4" />
              Voice Agent
            </Link>
            <Link to="/mood-mantra" className="font-medium flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              Mood Mantras
            </Link>
            <Link to="/affirmations" className="font-medium flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              Affirmations
            </Link>
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
