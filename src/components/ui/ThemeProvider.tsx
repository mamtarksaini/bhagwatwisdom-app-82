
import { createContext, useContext, useEffect, useState } from "react";
import { ThemeState } from "@/types";

const ThemeContext = createContext<{
  isDark: boolean;
  toggleTheme: () => void;
}>({
  isDark: false,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<ThemeState>({ isDark: false });

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme({ isDark: savedTheme === "dark" });
    } else {
      // Check user's system preference
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
