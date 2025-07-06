"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DebouncedSearchProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
  showClearButton?: boolean;
  isLoading?: boolean;
}

export function DebouncedSearch({
  value = "",
  onChange,
  placeholder = "Search...",
  debounceMs = 300,
  className,
  showClearButton = true,
  isLoading = false,
}: DebouncedSearchProps) {
  const [inputValue, setInputValue] = useState(value);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Update input value when external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const debouncedOnChange = useCallback(
    (newValue: string) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const newTimeoutId = setTimeout(() => {
        onChange(newValue);
      }, debounceMs);

      setTimeoutId(newTimeoutId);
    },
    [onChange, debounceMs, timeoutId]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      debouncedOnChange(newValue);
    },
    [debouncedOnChange]
  );

  const handleClear = useCallback(() => {
    setInputValue("");
    onChange("");
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }, [onChange, timeoutId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const showSpinner = useMemo(() => isLoading && inputValue.length > 0, [isLoading, inputValue]);

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          className="pl-9 pr-9"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {showSpinner && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-foreground" />
          )}
          {showClearButton && inputValue && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-muted"
              onClick={handleClear}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default DebouncedSearch;
