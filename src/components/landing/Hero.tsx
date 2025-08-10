import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="container mx-auto mt-6">
      <div className="rounded-[28px] p-[2px] bg-gradient-trends-animated shadow-elevate">
        <div className="rounded-[26px] bg-card px-6 md:px-10 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
                Productos Virales al por Mayor para Ecommerce
              </h1>
              <p className="mt-4 text-lg md:text-xl text-muted-foreground">
                Compra directamente desde <span className="font-semibold">China</span>, con precios mayoristas y
                optimizados para vender en Mercado Libre, Amazon y Shopify.
              </p>

              <div className="mt-6 flex items-stretch gap-3">
                <Button variant="pill" className="h-12 px-5 font-semibold" aria-label="Ver categorías">
                  <Menu size={20} /> Categorías
                </Button>
                <div className="flex w-full items-center overflow-hidden rounded-full border border-foreground/60">
                  <input
                    aria-label="Buscar productos"
                    placeholder="Buscar productos, categorías, marcas…"
                    className="h-12 w-full bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground"
                  />
                  <Button variant="brand" className="h-12 rounded-none rounded-r-full px-5" aria-label="Buscar">
                    <Search />
                  </Button>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              {/* Decorative side visuals - simple placeholder bubbles to avoid new assets */}
              <div className="relative h-64">
                <div className="absolute right-10 top-6 size-28 rounded-full bg-muted/60 blur-sm" />
                <div className="absolute right-24 top-24 size-12 rounded-full bg-muted/70" />
                <div className="absolute right-3 bottom-6 size-20 rounded-full bg-muted/60" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
