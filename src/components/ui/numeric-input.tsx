import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export interface NumericInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  value?: number | null;
  onValueChange?: (val: number) => void;
  locale?: string;
  decimals?: number;
}

export const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  ({ value, onValueChange, locale = "es-AR", decimals, className, ...rest }, ref) => {
    const [text, setText] = useState<string>("");

    const formatter = useMemo(() => {
      try {
        return new Intl.NumberFormat(
          locale,
          decimals != null
            ? { minimumFractionDigits: decimals, maximumFractionDigits: decimals }
            : undefined
        );
      } catch {
        return new Intl.NumberFormat("es-AR");
      }
    }, [locale, decimals]);

    const format = (n: number) => {
      if (n == null || Number.isNaN(n)) return "";
      return formatter.format(n);
    };

    useEffect(() => {
      const n = Number(value ?? 0);
      setText(format(n));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, formatter]);

    const parse = (s: string): number => {
      if (!s) return 0;
      // Remove all non-numeric characters except dots, commas
      const only = s.replace(/[^\d.,-]/g, "");
      const lastComma = only.lastIndexOf(",");
      const lastDot = only.lastIndexOf(".");
      
      let normalized = only;
      // If comma comes after dot, treat comma as decimal separator
      if (lastComma > lastDot) {
        // Remove all dots (thousands) and replace comma with dot (decimal)
        normalized = only.replace(/\./g, "").replace(",", ".");
      } else {
        // Remove all commas (thousands separators)
        normalized = only.replace(/,/g, "");
      }
      
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
          const n = parse(e.target.value);
          // Always format on blur to ensure consistent display
          const formatted = format(n);
          setText(formatted);
          // Trigger onValueChange with parsed value to ensure state consistency
          onValueChange?.(n);
          rest.onBlur?.(e);
        }}
        onFocus={(e) => {
          rest.onFocus?.(e);
        }}
        {...rest}
      />
    );
  }
);
NumericInput.displayName = "NumericInput";
