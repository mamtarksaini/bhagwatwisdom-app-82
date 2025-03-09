
import React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LANGUAGES } from "@/utils/constants";
import { Language } from "@/types";

interface LanguagePickerProps {
  value: Language;
  onValueChange: (value: Language) => void;
}

export function LanguagePicker({ value, onValueChange }: LanguagePickerProps) {
  const [open, setOpen] = React.useState(false);
  
  const selectedLanguage = LANGUAGES.find((language) => language.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedLanguage ? selectedLanguage.label : "Select language..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search language..." />
          <CommandEmpty>No language found.</CommandEmpty>
          <CommandGroup className="max-h-[200px] overflow-y-auto">
            {LANGUAGES.map((language) => (
              <CommandItem
                key={language.id}
                value={language.id}
                onSelect={(currentValue) => {
                  onValueChange(currentValue as Language);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === language.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {language.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
