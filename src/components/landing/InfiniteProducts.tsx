import { useEffect, useMemo, useRef, useState } from "react";
import ProductCard, { type Product } from "./ProductCard";
import { Card } from "@/components/ui/card";
import { categories } from "./data";

const AD_EYE = "/lovable-uploads/5a3a8096-def0-4f8a-a36d-905bdd36f321.png";
const AD_VIRAL = "/lovable-uploads/afc4e94f-2af3-46e7-9495-9d0699b28aaa.png";

const PAGE_SIZE = 20;

const InfiniteProducts = () => {
  const base = categories[Object.keys(categories)[0]]; // usar "Principales productos"
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Product[]>(() => makePage(base, 0));
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
        out.push({ kind: "ad", variant: "eye", key: `ad-eye-${idx}` });
      } else if (idx % 24 === 0) {
        out.push({ kind: "ad", variant: "viral", key: `ad-viral-${idx}` });
      }
    }
    return out;
  }, [items]);

  return (
    <section className="container mx-auto" aria-label="Productos infinitos">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {itemsWithAds.map((node, i) =>
          node.kind === "product" ? (
            <ProductCard key={node.data.id + i} product={node.data} />
          ) : (
            <AdCard key={node.key} variant={node.variant} />
          )
        )}
      </div>
      <div ref={sentinelRef} className="h-10" />
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
  return (
    <Card className="card-elevated relative col-span-2 overflow-hidden rounded-[28px] md:col-span-2">
      <img src={src} alt={alt} loading="lazy" className="w-full object-cover" />
    </Card>
  );
}

export default InfiniteProducts;
