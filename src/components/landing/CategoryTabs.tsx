import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductGrid from "./ProductGrid";
import { useCategoriesWithProductCount } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import { useCountryPricing } from "@/hooks/useCountryPricing";

const tabIcons: Record<string, string> = {
  "Moda femenina": "/lovable-uploads/ca6fd2f2-92d9-43f6-955b-e4f140912e9e.png",
  "Moda masculina": "/lovable-uploads/32edb77f-ead7-4e0e-9638-b2049b7f5e31.png",
  "Salud y bienestar": "/lovable-uploads/af8639df-1761-4ec1-b905-8d948d403ae4.png",
};

const CategoryTabs = () => {
  const { categories, loading: categoriesLoading } = useCategoriesWithProductCount();
  const { products, loading: productsLoading } = useProducts();
  const { calculatePriceForCountry, country } = useCountryPricing();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  if (categoriesLoading || productsLoading) {
    return (
      <section className="container mx-auto">
        <div className="rounded-[32px] bg-brand-yellow px-6 py-8 md:px-10 md:py-10 shadow-elevate">
          <div className="animate-pulse">
            <div className="mx-auto max-w-3xl md:max-w-[900px] xl:max-w-[1240px] rounded-[60px] bg-card px-6 py-3 md:px-10 md:py-4 xl:py-5">
              <div className="h-8 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  const first = categories[0]?.name;
  
  // Get products for each category
  const getProductsForCategory = (categoryId: string, limit = 5) => {
    return products
      .filter(product => 
        product.categories?.some(c => c.id === categoryId)
      )
      .slice(0, limit)
      .map(product => {
        // Get the CNY base price (supplier price) to calculate from
        const cnyPriceTier = product.variant_price_tiers?.find(tier => tier.currency === "CNY");
        const basePrice = cnyPriceTier?.unit_price || 0;
        const countryPrice = calculatePriceForCountry(basePrice, country);
        
        return {
          id: product.id,
          name: product.name,
          price: countryPrice,
          image: product.images?.[0]?.url || "/placeholder.svg",
          badge: product.verified_product ? "B2BOX verified" : undefined,
          viral: false
        };
      });
  };
  return (
    <section className="container mx-auto">
      <div className="rounded-[32px] bg-brand-yellow px-6 py-8 md:px-10 md:py-10 shadow-elevate">
        <div className="mx-auto max-w-3xl md:max-w-[900px] xl:max-w-[1240px] rounded-[60px] bg-card px-6 py-3 md:px-10 md:py-4 xl:py-5">
          <h2 className="text-center whitespace-nowrap text-[22px] font-semibold md:text-[30px] xl:text-[38px] xl:leading-[48px]">Los productos más vendidos en las categorías más buscadas</h2>
        </div>
        <Tabs defaultValue={first} className="w-full mt-6 md:mt-8">
          <div className="mx-auto max-w-[1240px] flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-11 w-11 md:h-12 md:w-12 bg-card border border-foreground/20 text-foreground shadow-none"
              aria-label="Anterior"
              onClick={() => scrollRef.current?.scrollBy({ left: -220, behavior: "smooth" })}
            >
              <ChevronLeft size={22} />
            </Button>
            <div className="flex items-center gap-2 flex-1 overflow-hidden">
              <div className="relative flex-1 overflow-hidden">
                <div ref={scrollRef} className="flex items-center gap-2 overflow-x-auto scroll-smooth py-1">
                  <TabsList className="bg-transparent p-0 flex gap-2">
                    {categories.map((category) => (
                      <TabsTrigger
                        key={category.id}
                        value={category.name}
                        className="pill rounded-full h-10 px-5 text-sm md:text-base font-semibold leading-none bg-card border border-foreground/20 data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:border-transparent shrink-0 w-[180px] md:w-[200px] xl:w-[220px] justify-center"
                      >
                        {tabIcons[category.name] && (
                          <img src={tabIcons[category.name]} alt={`Icono ${category.name}`} className="mr-2 h-4 w-4 md:h-5 md:w-5 object-contain" loading="lazy" />
                        )}
                        {category.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                <div className="pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-[hsl(var(--brand-yellow))] to-transparent" />
                <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-[hsl(var(--brand-yellow))] to-transparent" />
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-11 w-11 md:h-12 md:w-12 bg-card border border-foreground/20 text-foreground shadow-none"
              aria-label="Siguiente"
              onClick={() => scrollRef.current?.scrollBy({ left: 220, behavior: "smooth" })}
            >
              <ChevronRight size={22} />
            </Button>
          </div>
          {categories.map((category) => (
            <TabsContent key={category.id} value={category.name}>
              <ProductGrid products={getProductsForCategory(category.id)} fiveCols />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default CategoryTabs;