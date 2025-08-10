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
  return (
    <section className="container mx-auto">
      <div className="rounded-[32px] bg-brand-yellow p-6 md:p-10 shadow-elevate">
        <div className="mx-auto w-full rounded-[60px] bg-card px-6 py-5 md:px-12 md:py-6">
          <h2 className="text-center text-4xl font-semibold md:text-5xl xl:text-[65px] xl:leading-[85px]">Los productos más vendidos en las categorías más buscadas</h2>
        </div>
        <Tabs defaultValue={first} className="w-full mt-6 md:mt-8">
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="icon" className="rounded-full h-12 w-12 md:h-[86px] md:w-[86px] bg-[hsl(var(--brand-yellow)/0.6)] border border-foreground/20 text-foreground/80 shadow-elevate" aria-label="Anterior">
              <ChevronLeft size={28} />
            </Button>
            <TabsList className="max-w-full flex-wrap bg-transparent p-0">
              {Object.keys(categories).map((key) => (
                <TabsTrigger key={key} value={key} className="pill m-1 bg-card px-5 py-2 text-sm font-semibold shadow-elevate data-[state=active]:bg-foreground data-[state=active]:text-background">
                  {tabIcons[key] && (
                    <img src={tabIcons[key]} alt={`Icono ${key}`} className="mr-2 h-5 w-5 object-contain" loading="lazy" />
                  )}
                  {key}
                </TabsTrigger>
              ))}
            </TabsList>
            <Button variant="outline" size="icon" className="rounded-full h-12 w-12 md:h-[86px] md:w-[86px] bg-[hsl(var(--brand-yellow)/0.6)] border border-foreground/20 text-foreground/80 shadow-elevate" aria-label="Siguiente">
              <ChevronRight size={28} />
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