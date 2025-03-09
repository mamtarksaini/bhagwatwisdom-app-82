
import React from "react";
import { Check, ChevronsUpDown, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LANGUAGES } from "@/utils/constants";
import { Language } from "@/types";
import { Badge } from "@/components/ui/badge";

interface LanguagePickerProps {
  value: Language;
  onValueChange: (value: Language) => void;
}

export function LanguagePicker({ value, onValueChange }: LanguagePickerProps) {
  const [open, setOpen] = React.useState(false);
  
  const selectedLanguage = LANGUAGES.find((language) => language.id === value);

  // Group languages by region
  const groupedLanguages = LANGUAGES.reduce((acc, language) => {
    if (!acc[language.region]) {
      acc[language.region] = [];
    }
    acc[language.region].push(language);
    return acc;
  }, {} as Record<string, typeof LANGUAGES>);

  // Order of regions to display
  const regionOrder = ["Global", "Indo-Aryan", "Dravidian", "Other Indian"];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2 truncate">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{selectedLanguage ? selectedLanguage.label : "Select language..."}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search language..." />
          <CommandEmpty>No language found.</CommandEmpty>
          <CommandList>
            {regionOrder.map((region, index) => {
              const languagesInRegion = groupedLanguages[region] || [];
              
              if (languagesInRegion.length === 0) return null;
              
              return (
                <React.Fragment key={region}>
                  {index > 0 && <CommandSeparator />}
                  <CommandGroup heading={region}>
                    {languagesInRegion.map((language) => (
                      <CommandItem
                        key={language.id}
                        value={language.id}
                        onSelect={(currentValue) => {
                          onValueChange(currentValue as Language);
                          setOpen(false);
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center">
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                value === language.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <span>{language.label}</span>
                          </div>
                          {language.id === "english" && (
                            <Badge variant="outline" className="ml-2 text-xs">Default</Badge>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </React.Fragment>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
