import React from "react";
import { cn } from "@/lib/utils";

// Simple floating product bubbles with hover price card
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
    id: "p1",
    name: "Espejo LED de tocador",
    image: "/lovable-uploads/984b614e-1f6b-484a-8b88-5c741374625b.png",
    prices: [
      { qty: "10u", price: "$9.90" },
      { qty: "50u", price: "$8.70" },
      { qty: "100u", price: "$7.95" },
    ],
    className: "right-8 top-2 size-28 md:size-36",
    delay: "0s",
  },
  {
    id: "p2",
    name: "Cama para mascotas",
    image: "/lovable-uploads/21382621-126b-47f0-b6bd-c776ea5ff0aa.png",
    prices: [
      { qty: "10u", price: "$14.50" },
      { qty: "50u", price: "$12.90" },
      { qty: "100u", price: "$11.80" },
    ],
    className: "right-20 top-20 size-36 md:size-44",
    delay: "0.6s",
  },
  {
    id: "p3",
    name: "Organizador plegable",
    image: "/lovable-uploads/af8639df-1761-4ec1-b905-8d948d403ae4.png",
    prices: [
      { qty: "10u", price: "$4.20" },
      { qty: "50u", price: "$3.60" },
      { qty: "100u", price: "$3.20" },
    ],
    className: "right-40 top-24 size-20 md:size-24",
    delay: "0.2s",
  },
  {
    id: "p4",
    name: "Taza térmica",
    image: "/lovable-uploads/a463cd78-cb2e-4fe6-b892-0d5bf0faaba4.png",
    prices: [
      { qty: "10u", price: "$6.80" },
      { qty: "50u", price: "$5.90" },
      { qty: "100u", price: "$5.40" },
    ],
    className: "right-28 bottom-4 size-16 md:size-20",
    delay: "1s",
  },
  {
    id: "p5",
    name: "Dispensador portátil",
    image: "/lovable-uploads/605c29b4-eaf8-468d-8622-625ff4afafd8.png",
    prices: [
      { qty: "10u", price: "$3.40" },
      { qty: "50u", price: "$2.90" },
      { qty: "100u", price: "$2.60" },
    ],
    className: "right-4 top-16 size-16 md:size-20",
    delay: "0.3s",
  },
];

const bubbleBase =
  "group absolute flex items-center justify-center rounded-full border border-border bg-card/80 shadow-elevate backdrop-blur-sm overflow-hidden will-change-transform";

const FloatingProducts: React.FC = () => {
  return (
    <div className="relative h-64" aria-label="Productos destacados flotantes">
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
            className="w-[72%] h-[72%] object-contain select-none"
          />

          {/* Hover price card */}
          <div className="pointer-events-none absolute z-10 -top-2 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 group-hover:translate-y-[-0.25rem] transition-all duration-200">
            <div className="rounded-xl bg-popover text-popover-foreground border border-border shadow-elevate px-3 py-2 min-w-[160px] animate-fade-in">
              <p className="text-xs font-semibold line-clamp-1">{p.name}</p>
              <ul className="mt-1 text-[10px] md:text-xs space-y-1">
                {p.prices.map((pr, idx) => (
                  <li key={idx} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{pr.qty}</span>
                    <span className="font-medium">{pr.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}

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
