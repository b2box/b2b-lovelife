import React from "react";
import { cn } from "@/lib/utils";

// Simple floating product bubbles with hover price atoms around the circle
// Images use existing project assets

 type Price = { qty: string; price: string };
 type Product = {
  id: string;
  name: string;
  image: string;
  prices: Price[];
  className: string; // absolute positioning + size classes
  delay?: string; // animation delay
};

const products: Product[] = [
  {
    id: "m1",
    name: "Espejo LED de tocador",
    image: "/lovable-uploads/79463da2-0dc9-4c83-96c9-3677be1bf69c.png",
    prices: [
      { qty: "10u", price: "$9.90" },
      { qty: "50u", price: "$8.70" },
      { qty: "100u", price: "$7.95" },
    ],
    className: "right-8 top-2 size-36 md:size-44",
    delay: "0s",
  },
  {
    id: "b1",
    name: "Cama mullida para mascotas",
    image: "/lovable-uploads/7a8a643e-3ea5-4717-b5ca-f242ff62d732.png",
    prices: [
      { qty: "10u", price: "$14.50" },
      { qty: "50u", price: "$12.90" },
      { qty: "100u", price: "$11.80" },
    ],
    className: "right-36 top-10 size-48 md:size-60",
    delay: "0.6s",
  },
  {
    id: "c1",
    name: "Caja plegable organizadora",
    image: "/lovable-uploads/69675e75-c039-4caa-b986-0ca69f803697.png",
    prices: [
      { qty: "10u", price: "$4.20" },
      { qty: "50u", price: "$3.60" },
      { qty: "100u", price: "$3.20" },
    ],
    className: "right-[15rem] top-28 size-28 md:size-32",
    delay: "0.2s",
  },
  {
    id: "s1",
    name: "Mini selladora portátil",
    image: "/lovable-uploads/53cba60a-bd73-41ec-8674-dd70914769dc.png",
    prices: [
      { qty: "10u", price: "$3.40" },
      { qty: "50u", price: "$2.90" },
      { qty: "100u", price: "$2.60" },
    ],
    className: "right-6 top-24 size-24 md:size-28",
    delay: "1s",
  },
];

const bubbleBase =
  "group absolute flex items-center justify-center rounded-full border border-border bg-card/80 shadow-elevate backdrop-blur-sm overflow-visible will-change-transform";

const PriceAtom = ({ label }: { label: string }) => (
  <span className="pointer-events-none inline-flex items-center rounded-full border border-border bg-background text-foreground shadow-sm px-2 py-0.5 text-[10px] md:text-xs font-medium">
    {label}
  </span>
);

const FloatingProducts: React.FC = () => {
  return (
    <div className="relative h-80" aria-label="Productos destacados flotantes">
      {products.map((p) => (
        <div
          key={p.id}
          className={cn(bubbleBase, p.className)}
          style={{ animation: "float 7s ease-in-out infinite", animationDelay: p.delay }}
        >
<img
            src={p.image}
            alt={`${p.name} - producto mayorista para ecommerce`}
            loading="lazy"
            decoding="async"
            className="w-[72%] h-[72%] object-contain select-none animate-[spin_20s_linear_infinite]"
          />

{/* Electron-style orbiting prices */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative w-[85%] h-[85%] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-[spin_12s_linear_infinite]">
                {p.prices.map((pr, idx) => {
                  const angles = [0, 120, 240];
                  const angle = angles[idx % angles.length];
                  const radius = 56; // px
                  return (
                    <div
                      key={idx}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                      style={{ transform: `rotate(${angle}deg) translateX(${radius}px) rotate(-${angle}deg)` }}
                    >
                      <PriceAtom label={`${pr.qty} · ${pr.price}`} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Local keyframes, scoped to this component */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-12px); }
          }
        `}
      </style>
    </div>
  );
};

export default FloatingProducts;
