import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { COUNTRIES, Country } from '@/lib/countryCodes';

interface Props {
  value: Country;
  onChange: (c: Country) => void;
}

export default function CountryCodeSelect({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[120px] justify-between px-2"
        >
          <span className="flex items-center gap-1 text-sm">
            <span>{value.flag}</span>
            <span className="font-medium">{value.dial}</span>
          </span>
          <ChevronsUpDown className="h-3 w-3 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command
          filter={(val, search) => {
            const s = search.toLowerCase();
            return val.toLowerCase().includes(s) ? 1 : 0;
          }}
        >
          <CommandInput placeholder="Search country or code..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {COUNTRIES.map((c) => (
                <CommandItem
                  key={c.code}
                  value={`${c.name} ${c.dial} ${c.code}`}
                  onSelect={() => {
                    onChange(c);
                    setOpen(false);
                  }}
                >
                  <Check className={cn('mr-2 h-4 w-4', value.code === c.code ? 'opacity-100' : 'opacity-0')} />
                  <span className="mr-2">{c.flag}</span>
                  <span className="flex-1">{c.name}</span>
                  <span className="text-muted-foreground text-sm">{c.dial}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
