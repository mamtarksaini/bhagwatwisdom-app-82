
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { Language } from "@/types";
import { useTheme } from "@/components/ui/ThemeProvider";
import { PREMIUM_PRICE } from "@/utils/constants";
import { Menu, Moon, Sun, X } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/problem-solver", label: "Problem Solver" },
  { href: "/dream-interpreter", label: "Dream Interpreter" },
  { href: "/mantras", label: "Mantras" },
  { href: "/affirmations", label: "Affirmations" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState<Language>("english");
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    // Would typically update a global state or context here
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-medium shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 font-heading text-xl sm:text-2xl font-bold text-gradient animate-pulse-gentle"
          >
            <img 
              src="/lovable-uploads/c3d9b365-6fc8-4cba-bd7b-ea9317db1356.png" 
              alt="Bhagwat Wisdom" 
              className="w-8 h-8 object-contain"
            />
            Bhagwat Wisdom
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-3 py-2 text-sm font-medium transition-all-200 rounded-md ${
                  location.pathname === link.href
                    ? "text-gold-dark"
                    : "text-foreground/80 hover:text-foreground hover:bg-secondary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side with language selector, theme toggle, login */}
          <div className="flex items-center space-x-2">
            <LanguageSelector
              value={language}
              onChange={handleLanguageChange}
              variant="minimal"
              className="hidden sm:flex"
            />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {isDark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>

            <div className="hidden sm:block">
              <Link to="/premium">
                <Button className="button-gradient">
                  Premium {PREMIUM_PRICE}
                </Button>
              </Link>
            </div>

            <div className="hidden sm:block ml-2">
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background dark:bg-gray-900 animate-slide-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === link.href
                    ? "bg-secondary text-foreground"
                    : "text-foreground/70 hover:bg-secondary hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 flex items-center justify-between">
              <LanguageSelector
                value={language}
                onChange={handleLanguageChange}
                className="w-full"
              />
            </div>
            <div className="pt-2 pb-3 flex flex-col space-y-2">
              <Link to="/premium" className="w-full">
                <Button className="w-full button-gradient">
                  Premium {PREMIUM_PRICE}
                </Button>
              </Link>
              <Link to="/login" className="w-full">
                <Button variant="outline" className="w-full">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
