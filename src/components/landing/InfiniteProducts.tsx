import { useEffect, useMemo, useRef, useState } from "react";
import ProductCard, { type Product } from "./ProductCard";

import { Button } from "@/components/ui/button";
import { categories } from "./data";
import { ArrowUp, ArrowDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AD_EYE = "/lovable-uploads/fa842b26-b9f1-4176-9073-6128c3c08fbc.png";
const AD_VIRAL = "/lovable-uploads/025482cb-8da6-4438-85e8-ec4fe0abf877.png";

const PAGE_SIZE = 20;

const InfiniteProducts = ({ publicMode = false }: { publicMode?: boolean }) => {
  const navigate = useNavigate();
  const base = categories[Object.keys(categories)[0]]; // usar "Principales productos"
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Product[]>(() =>
    publicMode ? [...makePage(base, 0), ...makePage(base, 1)] : makePage(base, 0)
  );
  const [stopped, setStopped] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const stoppedRef = useRef(false);
  const prevScrollYRef = useRef(0);

  useEffect(() => {
    if (publicMode) return; // sin scroll infinito en modo público
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (stoppedRef.current) return;
        if (e.isIntersecting) setPage((p) => p + 1);
      });
    }, { rootMargin: "600px" });
    io.observe(el);
    return () => io.disconnect();
  }, [publicMode]);

  useEffect(() => {
    stoppedRef.current = stopped;
  }, [stopped]);

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
    <section className="container mx-auto relative" aria-label="Productos infinitos">
      {(() => {
        const nodes = publicMode ? itemsWithAds.slice(0, 30) : itemsWithAds;
        return (
          <>
            <div className={"grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-6 " + (publicMode ? "opacity-60 select-none pointer-events-none" : "") }>
              {nodes.map((node, i) =>
                node.kind === "product" ? (
                  <ProductCard key={node.data.id + i} product={node.data} />
                ) : (
                  <AdCard key={(node as any).key} variant={(node as any).variant} />
                )
              )}
            </div>
            {!publicMode && <div ref={sentinelRef} className="h-10" />}

            {publicMode && (
              <>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-10 z-10">
                  <Button
                    onClick={() => navigate("/auth")}
                    className="rounded-full h-14 px-8 text-lg font-semibold bg-accent text-accent-foreground hover:bg-accent/90 shadow-elevate"
                  >
                    Desbloquear catálogo completo
                  </Button>
                </div>
              </>
            )}
          </>
        );
      })()}

      <Button
        onClick={() => {
          const footer = document.getElementById("site-footer");
          if (!stopped) {
            prevScrollYRef.current = window.scrollY;
            setStopped(true);
            footer?.scrollIntoView({ behavior: "smooth" });
            if (footer) {
              footer.classList.add("ring-2","ring-primary/50","ring-offset-2","ring-offset-background","animate-pulse");
              setTimeout(() => footer.classList.remove("animate-pulse"), 1200);
              setTimeout(() => footer.classList.remove("ring-2","ring-primary/50","ring-offset-2","ring-offset-background"), 1600);
            }
          } else {
            setStopped(false);
            window.scrollTo({ top: prevScrollYRef.current || 0, behavior: "smooth" });
          }
        }}
        aria-label={stopped ? "Ocultar footer y reanudar scroll" : "Mostrar footer"}
        className="fixed bottom-6 right-6 z-50 grid size-12 place-items-center rounded-full bg-background/90 shadow-elevate backdrop-blur"
        variant="secondary"
      >
        {stopped ? <ArrowDown size={20} /> : <ArrowUp size={20} />}
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
    : "block m-0 p-0 w-full h-auto object-contain origin-center scale-[1.10] md:scale-[1.10] -translate-x-[2%] z-10";

  return (
    <div className={containerClasses}>
      <img src={src} alt={alt} loading="lazy" className={imgClasses} />
    </div>
  );
}

export default InfiniteProducts;
