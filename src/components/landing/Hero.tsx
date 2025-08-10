import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";


const Hero = () => {
  return (
    <section className="container mx-auto mt-6">
      <div className="rounded-[28px] p-[4px] bg-gradient-trends-animated shadow-elevate">
        <div className="rounded-[24px] bg-card px-6 md:px-10 py-8 md:py-12">
          <div className="grid grid-cols-1 gap-8 items-center">
            <div>
              <h1 className="sr-only">Productos Virales al por Mayor para Ecommerce</h1>
              <div className="relative w-full max-w-[720px]">
                <img
                  src="/lovable-uploads/c1e692ce-7b88-4b5f-b994-7fc876f5c8d3.png"
                  alt="Productos virales al por mayor desde China para eCommerce - compatible con Mercado Libre, Amazon y Shopify"
                  loading="eager"
                  decoding="async"
                  className="w-full h-auto object-contain"
                  width={1440}
                  height={380}
                />
              </div>

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
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
