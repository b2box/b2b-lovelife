import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// Simple floating product bubbles with hover price atoms around the circle
// Images use existing project assets

type WatchItem = { id: string; image: string; name: string; price: number };

const sources = [
  "/lovable-uploads/83d31804-342f-45bb-ad07-50bdf9aeb177.png",
  "/lovable-uploads/cdd78d7c-43ee-4104-874e-f082ed22a06b.png",
  "/lovable-uploads/bbb14bbf-ee98-4929-92c9-da9fc59c2611.png",
  "/lovable-uploads/544136ae-c430-471c-accb-449e3e6cafac.png",
];

const COLS = 7;
const ROWS = 4;
const BASE_PRICES = [12.99, 18.99, 24.99, 29.99];

const items: WatchItem[] = Array.from({ length: ROWS * COLS }, (_, i) => ({
  id: `w-${i}`,
  name: "Producto destacado",
  image: sources[i % sources.length],
  price: Math.round((BASE_PRICES[i % BASE_PRICES.length] + (i % 3) * 2) * 100) / 100,
}));

const itemBase =
  "group relative rounded-full overflow-hidden will-change-transform";

// Hex-grid helpers for Apple Watch effect
const getCellPos = (r: number, c: number) => {
  const x = c + (r % 2 === 1 ? 0.5 : 0);
  const y = r * 0.866; // vertical spacing for hex layout
  return { x, y };
};

const distance = (a: { x: number; y: number }, b: { x: number; y: number }) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const FloatingProducts: React.FC = () => {
  const [hoverManual, setHoverManual] = useState<{ r: number; c: number } | null>(null);
  const [autoIndex, setAutoIndex] = useState(0);

  // Recorrido automático (serpentina) cuando no hay hover
  const path: { r: number; c: number }[] = Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => ({ r, c }))
      .sort((a, b) => (r % 2 ? b.c - a.c : a.c - b.c))
  ).flat();

  useEffect(() => {
    if (hoverManual) return;
    const id = setInterval(() => setAutoIndex((i) => (i + 1) % path.length), 480);
    return () => clearInterval(id);
  }, [hoverManual, path.length]);

  const active = hoverManual ?? path[autoIndex];

  const styleFor = (r: number, c: number) => {
    const current = active;
    if (!current) {
      return { transform: "scale(1)", zIndex: 1 } as React.CSSProperties;
    }
    const p = getCellPos(r, c);
    const ph = getCellPos(current.r, current.c);
    const d = distance(p, ph);

    const isCenter = current.r === r && current.c === c;
    const scale = isCenter ? 1.65 : 1 + 0.55 * Math.exp(-Math.pow(d, 2) / 1.2);

    const dx = p.x - ph.x;
    const dy = p.y - ph.y;
    const mag = Math.sqrt(dx * dx + dy * dy) || 1;
    const push = Math.exp(-Math.pow(d, 2) / 1.8) * 12; // px
    const tx = (dx / mag) * push;
    const ty = (dy / mag) * push * 0.85;

    return {
      transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
      zIndex: Math.round(scale * 10),
      transition: "transform 360ms cubic-bezier(0.4,0,0.2,1)",
    } as React.CSSProperties;
  };

  return (
    <div className="relative h-80 md:h-96" aria-label="Grid interactivo estilo Apple Watch">
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-3"
        onMouseLeave={() => setHoverManual(null)}
      >
        {Array.from({ length: Math.ceil(items.length / COLS) }, (_, r) => {
          const rowItems = items.slice(r * COLS, (r + 1) * COLS);
          const isOdd = r % 2 === 1;
          return (
            <div
              key={`row-${r}`}
              className={cn("flex gap-3", isOdd ? "translate-x-4 md:translate-x-6" : "")}
            >
              {rowItems.map((it, idx) => (
                <div
                  key={it.id}
                  className={cn(
                    itemBase,
                    "size-12 md:size-16 lg:size-20 transition-transform duration-300"
                  )}
                  onMouseEnter={() => setHoverManual({ r, c: idx })}
                  style={styleFor(r, idx)}
                >
                  <img
                    src={it.image}
                    alt={`${it.name} estilo Apple Watch`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover select-none"
                  />
                  {active.r === r && active.c === idx && (
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-brand-green text-foreground text-[10px] md:text-xs font-semibold px-2 py-1 rounded-full shadow-elevate-green border border-border animate-fade-in">
                      {`$${it.price.toFixed(2)}`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Local keyframes, scoped to this component */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
        `}
      </style>
    </div>
  );
};

export default FloatingProducts;
