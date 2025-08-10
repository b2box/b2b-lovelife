import { useEffect, useMemo, useRef, useState } from "react";
import ProductCard, { type Product } from "./ProductCard";

import { Button } from "@/components/ui/button";
import { categories } from "./data";
import { ArrowUp } from "lucide-react";

const AD_EYE = "/lovable-uploads/fa842b26-b9f1-4176-9073-6128c3c08fbc.png";
const AD_VIRAL = "/lovable-uploads/025482cb-8da6-4438-85e8-ec4fe0abf877.png";

const PAGE_SIZE = 20;

const InfiniteProducts = () => {
  const base = categories[Object.keys(categories)[0]]; // usar "Principales productos"
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Product[]>(() => makePage(base, 0));
  const [stopped, setStopped] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) setPage((p) => p + 1);
      });
    }, { rootMargin: "600px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (page <= 1) return;
    setItems((prev) => [...prev, ...makePage(base, page - 1)]);
  }, [page]);

  const itemsWithAds = useMemo(() => {
    const out: Array<{ kind: "product"; data: Product } | { kind: "ad"; variant: "eye" | "viral"; key: string }> = [];
    for (let i = 0; i < items.length; i++) {
      out.push({ kind: "product", data: items[i] });
      const idx = i + 1;
      if (idx % 12 === 0) {
        const block = Math.floor(idx / 12);
        const variant: "eye" | "viral" = block % 2 === 1 ? "eye" : "viral";
        out.push({ kind: "ad", variant, key: `ad-${variant}-${idx}` });
      }
    }
    return out;
  }, [items]);

  return (
    <section className="container mx-auto" aria-label="Productos infinitos">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-6">
        {itemsWithAds.map((node, i) =>
          node.kind === "product" ? (
            <ProductCard key={node.data.id + i} product={node.data} />
          ) : (
            <AdCard key={node.key} variant={node.variant} />
          )
        )}
      </div>
      <div ref={sentinelRef} className="h-10" />
      <Button
        onClick={() => document.getElementById("site-footer")?.scrollIntoView({ behavior: "smooth" })}
        className="fixed bottom-6 right-6 z-50 pill bg-background/90 px-4 py-2 shadow-elevate backdrop-blur"
        variant="secondary"
      >
        <ArrowUp className="mr-2" size={18} /> Mostrar footer
      </Button>
    </section>
  );
};

function makePage(base: Product[], pageIndex: number): Product[] {
  return Array.from({ length: PAGE_SIZE }, (_, i) => {
    const b = base[i % base.length];
    return { ...b, id: `inf-${pageIndex}-${i}` };
  });
}

function AdCard({ variant }: { variant: "eye" | "viral" }) {
  const src = variant === "eye" ? AD_EYE : AD_VIRAL;
  const alt = variant === "eye" ? "¿No encuentras el producto que buscas?" : "¡Descubrí los productos más virales de Argentina!";

  const isEye = variant === "eye";
  const containerClasses = isEye
    ? "col-span-2 md:col-span-2 rounded-[28px] bg-foreground overflow-hidden flex items-stretch justify-center h-full px-3 md:px-6"
    : "col-span-2 md:col-span-2 rounded-[28px] bg-ad-viral flex items-center justify-start h-full relative overflow-visible z-0";
  const imgClasses = isEye
    ? "block m-0 p-0 w-full h-full object-contain"
    : "block m-0 p-0 w-full h-auto object-contain origin-left scale-[1.45] md:scale-[1.7] translate-x-1 md:translate-x-2 z-10";

  return (
    <div className={containerClasses}>
      <img src={src} alt={alt} loading="lazy" className={imgClasses} />
    </div>
  );
}

export default InfiniteProducts;
