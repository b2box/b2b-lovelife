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
    id: "p1",
    name: "Espejo LED de tocador",
    image: "/lovable-uploads/984b614e-1f6b-484a-8b88-5c741374625b.png",
    prices: [
      { qty: "10u", price: "$9.90" },
      { qty: "50u", price: "$8.70" },
      { qty: "100u", price: "$7.95" },
    ],
    className: "right-8 top-2 size-32 md:size-40",
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
    className: "right-36 top-10 size-44 md:size-56",
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
    className: "right-[15rem] top-28 size-24 md:size-28",
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
    className: "right-40 bottom-0 size-20 md:size-24",
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
    className: "right-6 top-24 size-20 md:size-24",
    delay: "0.3s",
  },
];

const bubbleBase =
  "group absolute flex items-center justify-center rounded-full border border-border bg-card/80 shadow-elevate backdrop-blur-sm overflow-hidden will-change-transform";

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
            className="w-[72%] h-[72%] object-contain select-none"
          />

          {/* Price atoms around the bubble */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-3 -right-5 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200" style={{ animation: "float 6s ease-in-out infinite" }}>
              <PriceAtom label={`${p.prices[0].qty} · ${p.prices[0].price}`} />
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 delay-100" style={{ animation: "float 7s ease-in-out infinite", animationDelay: "0.2s" }}>
              <PriceAtom label={`${p.prices[1].qty} · ${p.prices[1].price}`} />
            </div>
            <div className="absolute -top-3 -left-5 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 delay-200" style={{ animation: "float 8s ease-in-out infinite", animationDelay: "0.4s" }}>
              <PriceAtom label={`${p.prices[2].qty} · ${p.prices[2].price}`} />
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
