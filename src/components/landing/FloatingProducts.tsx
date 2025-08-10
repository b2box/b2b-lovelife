import React from "react";
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

const FloatingProducts: React.FC = () => {
  return (
<div className="relative h-80 md:h-96" aria-label="Grid interactivo estilo Apple Watch">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        {Array.from({ length: Math.ceil(items.length / COLS) }, (_, r) => {
          const rowItems = items.slice(r * COLS, (r + 1) * COLS);
          const isOdd = r % 2 === 1;
          return (
            <div
              key={`row-${r}`}
              className={cn("flex gap-3", isOdd ? "translate-x-4 md:translate-x-6" : "")}
            >
              {rowItems.map((it, idx) => {
                const delay = `${((r * COLS + idx) % 6) * 0.12}s`;
                return (
                  <div
                    key={it.id}
                    className={cn(
                      itemBase,
                      "size-12 md:size-16 lg:size-20 transition-transform duration-300 hover:scale-[1.6] hover:z-10"
                    )}
                    style={{ animation: "float 7s ease-in-out infinite", animationDelay: delay }}
                  >
                    <img
                      src={it.image}
                      alt={`${it.name} estilo Apple Watch`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-contain select-none"
                    />
                  </div>
                );
              })}
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
