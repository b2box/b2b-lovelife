import React, { useState } from "react";
import { cn } from "@/lib/utils";

// Simple floating product bubbles with hover price atoms around the circle
// Images use existing project assets

type WatchItem = { id: string; image: string; name: string };

const sources = [
  "/lovable-uploads/83d31804-342f-45bb-ad07-50bdf9aeb177.png",
  "/lovable-uploads/cdd78d7c-43ee-4104-874e-f082ed22a06b.png",
  "/lovable-uploads/bbb14bbf-ee98-4929-92c9-da9fc59c2611.png",
  "/lovable-uploads/544136ae-c430-471c-accb-449e3e6cafac.png",
];

const items: WatchItem[] = Array.from({ length: 24 }, (_, i) => ({
  id: `w-${i}`,
  name: "Producto destacado",
  image: sources[i % sources.length],
}));

const COLS = 7;

const itemBase =
  "group relative rounded-full border border-border bg-card/80 shadow-elevate overflow-hidden will-change-transform";

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
  const [hover, setHover] = useState<{ r: number; c: number } | null>(null);

  const styleFor = (r: number, c: number) => {
    if (!hover) {
      return { transform: "scale(1)", zIndex: 1 } as React.CSSProperties;
    }
    const p = getCellPos(r, c);
    const ph = getCellPos(hover.r, hover.c);
    const d = distance(p, ph);

    const isCenter = hover.r === r && hover.c === c;
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
      transition: "transform 220ms cubic-bezier(0.4,0,0.2,1)",
    } as React.CSSProperties;
  };

  return (
    <div className="relative h-80 md:h-96" aria-label="Grid interactivo estilo Apple Watch">
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-3"
        onMouseLeave={() => setHover(null)}
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
                  onMouseEnter={() => setHover({ r, c: idx })}
                  style={styleFor(r, idx)}
                >
                  <img
                    src={it.image}
                    alt={`${it.name} estilo Apple Watch`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-contain select-none"
                  />
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
