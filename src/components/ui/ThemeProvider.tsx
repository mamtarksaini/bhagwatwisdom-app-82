
import { createContext, useContext, useEffect, useState } from "react";
import { ThemeState } from "@/types";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: "light" | "dark"; // Make this prop optional with allowed values
};

const ThemeContext = createContext<{
  isDark: boolean;
  toggleTheme: () => void;
}>({
  isDark: false,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ 
  children, 
  defaultTheme = "light" // Set a default value and use destructuring
}: ThemeProviderProps) => {
  const [theme, setTheme] = useState<ThemeState>({ 
    isDark: defaultTheme === "dark" // Use the prop to set initial state
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme({ isDark: savedTheme === "dark" });
    } else {
      // Check user's system preference only if no saved theme
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme({ isDark: prefersDark });
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme.isDark);
    localStorage.setItem("theme", theme.isDark ? "dark" : "light");
  }, [theme.isDark]);

  const toggleTheme = () => {
    setTheme(prev => ({ isDark: !prev.isDark }));
  };

  return (
    <ThemeContext.Provider value={{ isDark: theme.isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
