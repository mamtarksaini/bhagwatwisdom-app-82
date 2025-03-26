
import { useEffect, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LANGUAGES } from "@/utils/constants";
import { Language } from "@/types";
import { cn } from "@/lib/utils";

interface LanguageSelectorProps {
  value: Language;
  onChange: (language: Language) => void;
  className?: string;
  variant?: "default" | "minimal";
}

export function LanguageSelector({
  value,
  onChange,
  className,
  variant = "default",
}: LanguageSelectorProps) {
  const [selected, setSelected] = useState<Language>(value || "english");

  useEffect(() => {
    if (value) {
      setSelected(value);
    }
  }, [value]);

  const handleSelectLanguage = (language: Language) => {
    setSelected(language);
    onChange(language);
  };

  const selectedLanguage = LANGUAGES.find(lang => lang.id === selected);

  if (variant === "minimal") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className={cn("rounded-full", className)}>
            <Globe className="h-5 w-5" />
            <span className="sr-only">Select language</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 animate-slide-in bg-popover">
          {LANGUAGES.map((language) => (
            <DropdownMenuItem
              key={language.id}
              className={cn(
                "flex items-center justify-between cursor-pointer",
                selected === language.id && "font-medium bg-accent"
              )}
              onClick={() => handleSelectLanguage(language.id)}
            >
              {language.label}
              {selected === language.id && <Check className="h-4 w-4 ml-2" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "flex items-center gap-2 transition-all-200 hover:border-gold", 
            className
          )}
        >
          <Globe className="h-4 w-4" /> 
          <span>{selectedLanguage?.label || "English"}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 animate-slide-in bg-popover">
        {LANGUAGES.map((language) => (
          <DropdownMenuItem
            key={language.id}
            className={cn(
              "flex items-center justify-between cursor-pointer",
              selected === language.id && "font-medium bg-accent"
            )}
            onClick={() => handleSelectLanguage(language.id)}
          >
            {language.label}
            {selected === language.id && <Check className="h-4 w-4 ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
