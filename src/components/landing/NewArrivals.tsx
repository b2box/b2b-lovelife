
import ProductCard from "./ProductCard";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCountryPricing } from "@/hooks/useCountryPricing";

const NewArrivals = () => {
  const navigate = useNavigate();
  const { products: dbProducts } = useProducts();
  const { calculatePriceForCountry, country } = useCountryPricing();
  
  const products = dbProducts.slice(0, 3).map(product => {
    const basePrice = product.variant_price_tiers?.[0]?.unit_price || 0;
    const countryPrice = calculatePriceForCountry(basePrice, country);
    
    return {
      id: product.id,
      name: product.name,
      price: countryPrice,
      image: product.variants?.[0]?.product_variant_images?.sort((a, b) => a.sort_order - b.sort_order)?.[0]?.url || 
             "/placeholder.svg",
      badge: product.verified_product ? "B2BOX verified" : undefined,
      viral: false
    };
  });

  return (
    <section aria-label="Lo más nuevo en B2BOX" className="container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-stretch">
        <button
          onClick={() => navigate("/auth")}
          className="relative overflow-hidden rounded-[28px] bg-brand-violet-soft animate-fade-in flex items-end justify-center h-full md:col-span-2"
          aria-label="Explorar lo más nuevo en B2BOX"
        >
          <img
            src="/lovable-uploads/675a800a-12eb-4949-a34c-e4dbc08e2680.png"
            alt="Lo más nuevo en B2BOX - ilustración"
            className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[84%] w-auto pointer-events-none select-none"
            loading="lazy"
          />
          <span className="absolute bottom-3 right-3 grid size-10 md:size-12 place-items-center rounded-full border border-white/70 text-white/90 hover:bg-white/10" aria-hidden="true">
            <ArrowUpRight />
          </span>
        </button>

        {products.map((p, idx) => (
          <div key={p.id + idx} className="h-full">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default NewArrivals;
