import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductGrid from "./ProductGrid";
import { categories } from "./data";

const tabIcons: Record<string, string> = {
  "Moda femenina": "/lovable-uploads/ca6fd2f2-92d9-43f6-955b-e4f140912e9e.png",
  "Moda masculina": "/lovable-uploads/32edb77f-ead7-4e0e-9638-b2049b7f5e31.png",
  "Salud y bienestar": "/lovable-uploads/af8639df-1761-4ec1-b905-8d948d403ae4.png",
};

const CategoryTabs = () => {
  const first = Object.keys(categories)[0] as keyof typeof categories;
  const allKeys = Object.keys(categories);
  const staticKeys = ["Principales productos", "Más vendidos"].filter((k) => allKeys.includes(k));
  const restKeys = allKeys.filter((k) => !staticKeys.includes(k));
  const scrollRef = React.useRef<HTMLDivElement>(null);
  return (
    <section className="container mx-auto">
      <div className="rounded-[32px] bg-brand-yellow px-6 py-8 md:px-10 md:py-10 shadow-elevate">
        <div className="mx-auto max-w-3xl md:max-w-[900px] xl:max-w-[1240px] rounded-[60px] bg-card px-6 py-5 md:px-10 md:py-6 xl:py-7">
          <h2 className="text-center whitespace-nowrap text-[28px] font-semibold md:text-[36px] xl:text-[48px] xl:leading-[60px]">Los productos más vendidos en las categorías más buscadas</h2>
        </div>
        <Tabs defaultValue={first} className="w-full mt-6 md:mt-8">
          <div className="mx-auto max-w-[1240px] flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-11 w-11 md:h-12 md:w-12 bg-card border border-foreground/20 text-foreground shadow-none"
              aria-label="Anterior"
              onClick={() => scrollRef.current?.scrollBy({ left: -260, behavior: "smooth" })}
            >
              <ChevronLeft size={22} />
            </Button>
            <div className="flex items-center gap-3 flex-1 overflow-hidden">
              <TabsList className="bg-transparent p-0 flex gap-3">
                {staticKeys.map((key) => (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="pill h-12 px-6 text-base font-semibold bg-card border border-foreground/20 data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:border-transparent shrink-0 w-[220px] md:w-[230px] xl:w-[240px] justify-center"
                  >
                    {tabIcons[key] && (
                      <img src={tabIcons[key]} alt={`Icono ${key}`} className="mr-2 h-4 w-4 md:h-5 md:w-5 object-contain" loading="lazy" />
                    )}
                    {key}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="relative flex-1 overflow-hidden">
                <div ref={scrollRef} className="flex gap-3 overflow-x-auto scroll-smooth">
                  <TabsList className="bg-transparent p-0 flex gap-3">
                    {restKeys.map((key) => (
                      <TabsTrigger
                        key={key}
                        value={key}
                        className="pill h-12 px-6 text-base font-semibold bg-card border border-foreground/20 data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:border-transparent shrink-0 w-[220px] md:w-[230px] xl:w-[240px] justify-center"
                      >
                        {tabIcons[key] && (
                          <img src={tabIcons[key]} alt={`Icono ${key}`} className="mr-2 h-4 w-4 md:h-5 md:w-5 object-contain" loading="lazy" />
                        )}
                        {key}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-11 w-11 md:h-12 md:w-12 bg-card border border-foreground/20 text-foreground shadow-none"
              aria-label="Siguiente"
              onClick={() => scrollRef.current?.scrollBy({ left: 260, behavior: "smooth" })}
            >
              <ChevronRight size={22} />
            </Button>
          </div>
          {Object.entries(categories).map(([key, value]) => (
            <TabsContent key={key} value={key}>
              <ProductGrid products={value.slice(0,5)} fiveCols />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default CategoryTabs;