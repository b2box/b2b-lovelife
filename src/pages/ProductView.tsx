import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Product } from "@/components/landing/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useProductMarketContent } from "@/hooks/useProductMarketContent";
import { MarketSpecificBanners } from "@/components/product/MarketSpecificBanners";
import { useProductVariants, type ProductVariant } from "@/hooks/useProductVariants";
import ProductHeader from "@/components/product/ProductHeader";
import ProductGallery from "@/components/product/ProductGallery";
import ProductDescription from "@/components/product/ProductDescription";
import OrderSidebar, { type VariantRow } from "@/components/product/OrderSidebar";

const ProductView = () => {
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const { products } = useProducts();
  
  // Determine the actual product ID (could be from slug or direct ID)
  const productId = useMemo(() => {
    if (id) {
      return id; // Direct ID access from fallback routes
    }
    
    if (slug && products.length > 0) {
      // Find product by slug first, then fallback to ID if slug looks like a UUID
      const productBySlug = products.find(p => p.slug === slug);
      if (productBySlug) {
        return productBySlug.id;
      }
      
      // If slug looks like a UUID, treat it as an ID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(slug)) {
        return slug;
      }
    }
    
    return undefined;
  }, [slug, id, products]);

  const { variants, loading: variantsLoading } = useProductVariants(productId);
  const { market, content } = useProductMarketContent();

  const product = useMemo(() => {
    if (!productId) return undefined;
    const dbProduct = products.find(p => p.id === productId);
    if (!dbProduct) return undefined;
    
    // Get the CNY base price (supplier price) to calculate from  
    const cnyPriceTier = dbProduct.variant_price_tiers?.find(tier => tier.currency === "CNY");
    const basePrice = cnyPriceTier?.unit_price || 0;
    
    return {
      id: dbProduct.id,
      name: dbProduct.name,
      slug: dbProduct.slug,
      price: basePrice, // We'll format this properly in the component
      image: dbProduct.images?.[0]?.url || "/placeholder.svg",
      badge: dbProduct.verified_product ? "B2BOX verified" : undefined,
      viral: false
    } as Product & { slug: string };
  }, [productId, products]);

  const [selectedTier, setSelectedTier] = useState<"inicial" | "mayorista" | "distribuidor">("mayorista");
  const [rows, setRows] = useState<VariantRow[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Handler for variant selection - changes prices, quantities and image
  const handleVariantSelection = useCallback((variantId: string) => {
    try {
      setSelectedVariantId(variantId);
      
      // Update quantities for all rows based on selected variant
      setRows(prev => prev.map(row => {
        if (row.id === variantId) {
          // Find the price tier for current tier with safe fallbacks
          const targetCurrency = market === "CO" ? "COP" : "USD";
          const priceTiers = (row.variant as any)?.variant_price_tiers || [];
          
          const priceTier = priceTiers.find((tier: any) => 
            tier?.tier === selectedTier && tier?.currency === targetCurrency
          );
          
          const minQty = priceTier?.min_qty || 1;
          return { ...row, qty: minQty };
        }
        return row;
      }));
      
      // Update image selection safely
      if (variants && Array.isArray(variants) && variants.length > 0) {
        const allImages: any[] = [];
        
        variants.forEach(variant => {
          const variantImages = (variant as any)?.product_variant_images;
          if (Array.isArray(variantImages)) {
            variantImages.forEach(img => {
              if (img) {
                allImages.push({
                  ...img,
                  variantId: variant.id,
                  sort_order: img.sort_order || 0
                });
              }
            });
          }
        });
        
        allImages.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        
        const variantImageIndex = allImages.findIndex(img => img?.variantId === variantId);
        if (variantImageIndex >= 0) {
          setSelectedImageIndex(variantImageIndex);
        }
      }
    } catch (error) {
      console.error('Error in handleVariantSelection:', error);
      // Don't throw, just log and continue
    }
  }, [selectedTier, variants, market]);

  // Initialize rows when variants change - stabilized with better dependencies
  useEffect(() => {
    if (!Array.isArray(variants) || variants.length === 0 || rows.length > 0) return;
    
    const newRows = variants.map(variant => {
      // Find the price tier for selected tier with CNY currency for min_qty
      const priceTiers = (variant as any)?.variant_price_tiers || [];
      const priceTier = priceTiers.find((tier: any) => 
        tier?.tier === selectedTier && tier?.currency === "CNY"
      );
      const fallbackTier = priceTiers[0];
      const tierData = priceTier || fallbackTier;
      const minQty = tierData?.min_qty || 1;
     
      return {
        id: variant.id,
        variant,
        qty: minQty,
        comps: { labeling: false, barcode: false, photos: false, packaging: false }
      };
    });

    setRows(newRows);
    
    // Set first variant as selected if none selected
    if (!selectedVariantId && newRows.length > 0) {
      setSelectedVariantId(newRows[0].id);
    }
  }, [variants, selectedTier, rows.length, selectedVariantId]); // Stable dependencies

  // Update quantities when tier changes - stabilized
  useEffect(() => {
    if (!Array.isArray(rows) || rows.length === 0) return;
    
    setRows(prev => prev.map(row => {
      const priceTiers = (row.variant as any)?.variant_price_tiers || [];
      const priceTier = priceTiers.find((tier: any) => 
        tier?.tier === selectedTier && tier?.currency === "CNY"
      );
      const fallbackTier = priceTiers[0];
      const tierData = priceTier || fallbackTier;
      const minQty = tierData?.min_qty || 1;
     
      return { ...row, qty: minQty };
    }));
  }, [selectedTier]); // Only depend on selectedTier

  // Use pre-calculated prices directly from variant pricing editor
  const getVariantPrice = (variant: ProductVariant, tier: "inicial" | "mayorista" | "distribuidor") => {
    // Get the currency based on current market
    const targetCurrency = market === "CO" ? "COP" : "USD";
    
    // Find the price tier for this variant, tier, and currency
    const priceTier = (variant as any).variant_price_tiers?.find(
      (priceTier: any) => 
        priceTier.tier === tier && 
        priceTier.currency === targetCurrency
    );

    if (!priceTier) {
      return variant.price || 0;
    }

    // Return the pre-calculated price directly from the database
    return Number(priceTier.unit_price) || 0;
  };

  const totals = rows.reduce(
    (acc, r) => {
      const variantPrice = getVariantPrice(r.variant, selectedTier);
      const base = r.qty * variantPrice;
      
      // Calculate complements costs (simplified for totals)
      const comps = 0; // Will be calculated in OrderSidebar
      acc.items += r.qty;
      acc.products += base;
      acc.complements += comps;
      acc.total += base + comps;
      return acc;
    },
    { items: 0, products: 0, complements: 0, total: 0 }
  );

  // Basic SEO meta tags and JSON-LD
  useEffect(() => {
    const title = product ? `${product.name} | B2BOX` : "Producto | B2BOX";
    document.title = title;

    const metaDescId = "meta-product-description";
    let meta = document.querySelector(`meta[name='description']#${metaDescId}`) as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      meta.id = metaDescId;
      document.head.appendChild(meta);
    }
    meta.content = product ? `Compra ${product.name} al por mayor en B2BOX con precios por volumen.` : "Vista de producto en B2BOX.";

    // canonical
    const canonicalId = "canonical-product";
    let link = document.querySelector(`link[rel='canonical']#${canonicalId}`) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      link.id = canonicalId;
      document.head.appendChild(link);
    }
    link.href = window.location.href;

    // JSON-LD Product
    const scriptId = "jsonld-product";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = scriptId;
      document.body.appendChild(script);
    }
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product?.name ?? "Producto",
      image: product?.image ? [product.image] : [],
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "USD",
        lowPrice: 0,
        highPrice: 0,
        offerCount: 3,
      },
    };
    script.text = JSON.stringify(jsonLd);
  }, [product]);

  // Redirect to slug-based URL if we're using ID-based URL - stabilized with strict dependencies
  useEffect(() => {
    if (product?.slug && id && !slug && typeof navigate === 'function') {
      const newPath = `/product/${product.slug}`;
      navigate(newPath, { replace: true });
    }
  }, [product?.slug, id, slug, navigate]);

  if (!product || variantsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto py-8">
          <p className="text-muted-foreground">
            {variantsLoading ? "Cargando producto..." : "Producto no encontrado."}
          </p>
          <button className="mt-4 underline" onClick={() => navigate(-1)} aria-label="Volver">
            Volver
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-6 md:py-8">
        <ProductHeader productName={product.name} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Left column: Gallery + Details */}
          <section className="min-w-0">
            <div className="grid grid-cols-1 md:grid-cols-[40%_60%] gap-4">
              {/* Gallery */}
              <ProductGallery
                variants={variants}
                product={product}
                selectedImageIndex={selectedImageIndex}
                onImageIndexChange={setSelectedImageIndex}
              />

              {/* Details */}
              <div className="space-y-4">
                <ProductDescription />
              </div>
            </div>
          </section>

          {/* Right column: Order sidebar */}
          <OrderSidebar
            rows={rows}
            selectedTier={selectedTier}
            selectedVariantId={selectedVariantId}
            market={market}
            content={content}
            onRowsChange={setRows}
            onTierChange={setSelectedTier}
            onVariantSelect={handleVariantSelection}
            totals={totals}
          />
        </div>

        {/* Market-specific banners */}
        <MarketSpecificBanners />
      </main>
      <Footer />
    </div>
  );
};

export default ProductView;