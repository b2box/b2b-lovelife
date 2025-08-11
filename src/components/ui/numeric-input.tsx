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
      const only = s.replace(/[^\d.,-]/g, "");
      const lastComma = only.lastIndexOf(",");
      const lastDot = only.lastIndexOf(".");
      let normalized = only;
      if (lastComma > lastDot) {
        normalized = only.replace(/\./g, "").replace(",", ".");
      } else {
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
          setText(format(n));
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
