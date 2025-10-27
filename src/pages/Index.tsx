import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Footer from "@/components/landing/Footer";
import { ShopifyProductCard } from "@/components/shopify/ShopifyProductCard";
import { CartDrawer } from "@/components/shopify/CartDrawer";
import { useShopifyProducts } from "@/hooks/useShopifyProducts";
import { Loader2 } from "lucide-react";
import { useSEOByMarket } from "@/hooks/useSEOByMarket";

const jsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "B2BOX - Mayorista",
  url: typeof window !== "undefined" ? window.location.origin : "",
  potentialAction: {
    "@type": "SearchAction",
    target: `${typeof window !== "undefined" ? window.location.origin : ""}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
});

const Index = () => {
  useSEOByMarket("CN");
  const { data: products, isLoading, error } = useShopifyProducts();

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-4 right-4 z-50">
        <CartDrawer />
      </div>
      
      <Navbar />
      <main>
        <Hero />
        
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Products</h2>
          
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          
          {error && (
            <div className="text-center py-12 text-destructive">
              Error loading products. Please try again later.
            </div>
          )}
          
          {!isLoading && products && products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground mb-4">No products found</p>
              <p className="text-sm text-muted-foreground">
                Create your first product by telling me what you'd like to sell and the price!
              </p>
            </div>
          )}
          
          {products && products.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ShopifyProductCard key={product.node.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
