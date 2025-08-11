import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export interface NumericInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  value?: number | null;
  onValueChange?: (val: number) => void;
  locale?: string;
  decimals?: number;
}

export const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  ({ value, onValueChange, locale = "en-US", decimals, className, ...rest }, ref) => {
    const [text, setText] = useState<string>("");
    const [isEditing, setIsEditing] = useState(false);

    const formatter = useMemo(() => {
      try {
        return new Intl.NumberFormat(
          locale,
          decimals != null
            ? { minimumFractionDigits: decimals, maximumFractionDigits: decimals }
            : undefined
        );
      } catch {
        return new Intl.NumberFormat("en-US");
      }
    }, [locale, decimals]);

    const format = (n: number) => {
      if (n == null || Number.isNaN(n)) return "";
      return formatter.format(n);
    };

    useEffect(() => {
      if (!isEditing) {
        const n = Number(value ?? 0);
        setText(format(n));
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, formatter, isEditing]);

    const parse = (s: string): number => {
      if (!s) return 0;
      // Remove all non-numeric characters except dots and commas
      const only = s.replace(/[^\d.,-]/g, "");
      
      // For US format: comma = thousands separator, dot = decimal separator
      // Remove commas (thousands) and keep dots (decimals)
      const normalized = only.replace(/,/g, "");
      
      const n = Number(normalized);
      return Number.isNaN(n) ? 0 : n;
    };

    return (
      <input
        ref={ref}
        inputMode="decimal"
        type="text"
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        value={text}
        onChange={(e) => {
          const raw = e.target.value;
          setText(raw);
          const n = parse(raw);
          onValueChange?.(n);
        }}
        onBlur={(e) => {
          setIsEditing(false);
          const n = parse(e.target.value);
          // Always format on blur to ensure consistent display
          const formatted = format(n);
          setText(formatted);
          // Trigger onValueChange with parsed value to ensure state consistency
          onValueChange?.(n);
          rest.onBlur?.(e);
        }}
        onFocus={(e) => {
          setIsEditing(true);
          rest.onFocus?.(e);
        }}
        {...rest}
      />
    );
  }
);
NumericInput.displayName = "NumericInput";
