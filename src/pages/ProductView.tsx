import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import type { Product } from "@/components/landing/ProductCard";
import { ArrowUpRight, CheckCircle2, Cog, Hash, Box, Package, Battery, Ruler, Scale, ArrowLeftRight, ArrowUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { useProducts } from "@/hooks/useProducts";
import { useProductMarketContent } from "@/hooks/useProductMarketContent";
import { MarketSpecificBanners } from "@/components/product/MarketSpecificBanners";
import { useProductVariants, type ProductVariant } from "@/hooks/useProductVariants";
import { useVariantPricing } from "@/hooks/useVariantPricing";
import { usePricingSettings } from "@/hooks/usePricingSettings";
import ImageGallery from "@/components/product/ImageGallery";
import ImageThumbnails from "@/components/product/ImageThumbnails";

const ProductView = () => {
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
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
  const { toast } = useToast();
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

  type VariantRow = {
    id: string;
    variant: ProductVariant;
    qty: number;
    comps: { labeling: boolean; barcode: boolean; photos: boolean; packaging: boolean };
  };

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
    if (!Array.isArray(variants) || variants.length === 0) return;
    
    // Only initialize if we don't have rows yet
    if (rows.length > 0) return;
    
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
  }, [variants, selectedTier]); // Removed rows.length and selectedVariantId from dependencies

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

  const perUnitLabeling = 0.15;
  const perUnitPackaging = 0.04;
  const fixedBarcode = 40;
  const fixedPhotos = 1863;
  const minOrder = 100;

  // Get pricing settings and market content for calculations
  const { data: pricingSettings } = usePricingSettings();

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
  
  // Function to determine the appropriate tier based on quantity
  const getTierFromQuantity = (variant: ProductVariant, qty: number): "inicial" | "mayorista" | "distribuidor" => {
    // Use CNY currency to get the correct min_qty values for tier determination
    const tiers = ((variant as any).variant_price_tiers || [])
      .filter((tier: any) => tier.currency === "CNY")
      .sort((a: any, b: any) => (b.min_qty || 0) - (a.min_qty || 0));
    
    // Find the highest tier where quantity meets minimum
    for (const tier of tiers) {
      if (qty >= (tier.min_qty || 0)) {
        const tierName = tier.tier as "inicial" | "mayorista" | "distribuidor";
        return tierName;
      }
    }
    
    return "inicial"; // fallback
  };

  const rowTotal = (r: VariantRow) => {
    const variantPrice = getVariantPrice(r.variant, selectedTier);
    const base = r.qty * variantPrice;
    const comps =
      (r.comps.labeling ? r.qty * variantPrice * (pricingSettings?.marketplace_labeling_pct || 2) / 100 : 0) +
      (r.comps.packaging ? r.qty * variantPrice * (pricingSettings?.optimized_packaging_pct || 5) / 100 : 0) +
      (r.comps.barcode ? (pricingSettings?.barcode_registration_usd || 1) : 0) +
      (r.comps.photos ? (pricingSettings?.commercial_photos_usd || 45) : 0);
    return base + comps;
  };

  const totals = rows.reduce(
    (acc, r) => {
      const variantPrice = getVariantPrice(r.variant, selectedTier);
      const base = r.qty * variantPrice;
      const comps = rowTotal(r) - base;
      acc.items += r.qty;
      acc.products += base;
      acc.complements += comps;
      acc.total += base + comps;
      return acc;
    },
    { items: 0, products: 0, complements: 0, total: 0 }
  );

  const changeQty = (id: string, delta: number) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const newQty = Math.max(0, r.qty + delta);
          
          // Auto-update selected tier based on new quantity if this is the selected variant
          if (selectedVariantId === id) {
            const newTier = getTierFromQuantity(r.variant, newQty);
            if (newTier !== selectedTier) {
              setSelectedTier(newTier);
            }
          }
          
          return { ...r, qty: newQty };
        }
        return r;
      })
    );
  };

  const toggleComp = (id: string, key: keyof VariantRow["comps"]) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, comps: { ...r.comps, [key]: !r.comps[key] } } : r)));

  const addToCart = () => {
    if (totals.total < minOrder) {
      toast({ title: content.minOrderText, description: "Agrega más productos para continuar." });
      return;
    }
    toast({ title: "Añadido al carrito", description: `${totals.items} unidades agregadas.` });
  };

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
        {/* Breadcrumb simple - placeholder para el diseño final */}
        <nav aria-label="breadcrumb" className="text-sm text-muted-foreground mb-4">
          <button onClick={() => navigate("/app")} className="story-link">Productos</button>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Columna izquierda: Galería + Detalles */}
          <section className="flex-1 min-w-0">
            <div className="grid grid-cols-1 md:grid-cols-[40%_60%] gap-4">{/* Optimizar proporción galería/detalles */}
              {/* Galería - compacta */}
              <div className="rounded-2xl bg-card p-2 md:p-3 h-fit">
                <div className="space-y-2">
                  <div className="relative overflow-hidden rounded-xl bg-muted aspect-square">
                    <ImageGallery 
                      variants={variants}
                      product={product}
                      selectedImageIndex={selectedImageIndex}
                      onImageIndexChange={setSelectedImageIndex}
                    />
                  </div>

                  {/* Thumbnails */}
                  <ImageThumbnails 
                    variants={variants}
                    product={product}
                    selectedImageIndex={selectedImageIndex}
                    onImageIndexChange={setSelectedImageIndex}
                  />
                </div>
              </div>

              {/* Detalles + Tramos 75% */}
              <div className="space-y-4">
                <header>
                  <h1 className="text-xl md:text-2xl font-semibold leading-tight">{product.name}</h1>
                </header>

                {/* Descripción del producto */}
                <article className="prose prose-sm md:prose-sm max-w-none text-sm">
                  <p>
                    ¡Aprovecha cada rincón con la Estantería de Dos Niveles para Almacenamiento que lo transforma todo! Este diseño práctico de dos niveles organiza cosméticos, productos de higiene y más, con una estructura ventilada y colores vibrantes que revitalizan tu espacio. ¡Perfecto para tu baño o tocador!
                  </p>
                  <h3>Características destacadas:</h3>
                  <ul>
                    <li>🧴 Dos niveles versátiles: Almacena más en menos espacio.</li>
                    <li>💨 Estructura ventilada: Mantiene tus artículos frescos y secos.</li>
                    <li>🎨 Colores vibrantes: Disponible en tonos que alegran tu ambiente.</li>
                    <li>💪🏻 Resistencia sólida: Sostiene tus objetos con seguridad.</li>
                    <li>✨ Material premium brillante: ¡Plástico resistente con acabados modernos!</li>
                  </ul>
                  <p>🛍 Ideal para: ✅Baños organizados, ✅tocadores prácticos y ✅hogares con estilo.</p>
                </article>
              </div>
            </div>
          </section>

          {/* Columna derecha: Resumen sticky */}
          <aside className="hidden md:block w-[320px] flex-shrink-0">
            <div className="sticky top-6 z-10" style={{ position: 'sticky' }}>
              <div className="max-h-[calc(100vh-4rem)] overflow-y-auto">
                <div className="bg-white border border-[#E5E7EB] rounded-[24px] p-3 shadow-sm">
                {/* Encabezado con check verde */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[22px] font-semibold text-[#0A0A0A]">Orden mínima $100</span>
                  <div className="w-6 h-6 bg-[#22C55E] rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Barra de progreso verde */}
                <div className="h-[6px] bg-[#22C55E] rounded-full mb-4"></div>

                {/* Botón CTA */}
                <button
                  onClick={addToCart}
                  className="w-full h-16 rounded-[24px] bg-[#BBF7D0] text-[#0A0A0A] text-[20px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 mb-5"
                  aria-label={content.cartButtonText}
                  disabled={totals.total < minOrder}
                >
                  Añadir al carrito
                </button>

                {/* Bloque de totales sin fondo */}
                <div className="px-0 py-5 mb-5">
                  <div className="space-y-3">
                    <div className="flex justify-between text-[18px] text-[#0A0A0A]">
                      <span>Productos ({totals.items})</span>
                      <span>{content.currencySymbol}{totals.products.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-[18px] text-[#0A0A0A]">
                      <span>Complementos</span>
                      <span>{content.currencySymbol}{totals.complements.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-[22px] font-bold text-[#0A0A0A] pt-2">
                      <span>Total</span>
                      <span>{content.currencySymbol}{totals.total.toFixed(0)}</span>
                    </div>
                  </div>
                </div>

                {/* Tarjetas de features */}
                <div className="grid grid-cols-3 gap-2">
                  {/* Método de envío */}
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div className="relative w-[100px] h-[100px] rounded-[20px] border border-[#E5E7EB] bg-white p-3 cursor-default flex flex-col items-center justify-center text-center opacity-60">
                        <img src="/lovable-uploads/bcaad47c-1390-4a6e-a192-4c5279337cf3.png" alt="Método de envío" className="h-6 w-auto mb-2" loading="lazy" />
                        <span className="text-[12px] text-[#6B7280] leading-tight">Método de envío</span>
                        <div className="absolute top-2 right-2 w-4 h-4 bg-[#6B7280] text-white rounded-full flex items-center justify-center text-[10px] font-bold">?</div>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent side="top" align="end" className="w-64 p-3 text-xs">
                      {content.features.shipping.description}
                    </HoverCardContent>
                  </HoverCard>

                  {/* Personalizar producto */}
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div className="relative w-[100px] h-[100px] rounded-[20px] border border-[#E5E7EB] bg-white p-3 cursor-default flex flex-col items-center justify-center text-center opacity-60">
                        <img src="/lovable-uploads/e176248e-ec33-4374-8df2-39c6d1d81194.png" alt="Personalizar producto" className="h-6 w-auto mb-2" loading="lazy" />
                        <span className="text-[12px] text-[#6B7280] leading-tight">Personalizar producto</span>
                        <div className="absolute top-2 right-2 w-4 h-4 bg-[#6B7280] text-white rounded-full flex items-center justify-center text-[10px] font-bold">?</div>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent side="top" align="center" className="w-64 p-3 text-xs">
                      {content.features.customization.description}
                    </HoverCardContent>
                  </HoverCard>

                  {/* Precios sin sorpresas */}
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div className="relative w-[100px] h-[100px] rounded-[20px] border border-[#E5E7EB] bg-white p-3 cursor-default flex flex-col items-center justify-center text-center opacity-60">
                        <img src="/lovable-uploads/6a45e477-73d7-45a9-9eda-470e2c37a6cb.png" alt="Precios sin sorpresas" className="h-6 w-auto mb-2" loading="lazy" />
                        <span className="text-[12px] text-[#6B7280] leading-tight">Precios sin sorpresas</span>
                        <div className="absolute top-2 right-2 w-4 h-4 bg-[#6B7280] text-white rounded-full flex items-center justify-center text-[10px] font-bold">?</div>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent side="top" align="start" className="w-64 p-3 text-xs">
                      Transparencia total: desglose de costos, sin cargos ocultos al confirmar tu orden.
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

        {/* Barra de precios por tiers - Posicionada después del contenido principal */}
        <section className="mt-4 md:w-3/4">
          <article className="rounded-xl bg-card text-card-foreground border overflow-hidden shadow-sm">
            <div className="p-2 pb-0">
              <div className="grid grid-cols-3 gap-3">
                {/* Inicial */}
                <button
                  type="button"
                  onClick={() => setSelectedTier("inicial")}
                  className="text-center group transition-all duration-200"
                  aria-pressed={selectedTier === "inicial"}
                >
                  <div className="text-base font-bold mb-1 text-foreground">{content.pricingTiers.inicial.name}</div>
                  <div className={`
                    rounded-xl border-2 px-4 py-4 transition-all duration-200 bg-white/50
                    ${selectedTier === "inicial" 
                      ? "border-foreground shadow-lg scale-105 bg-white" 
                      : "border-border/50 hover:border-border group-hover:scale-102"
                    }
                  `}>
                    <div className={`
                      text-2xl font-black mb-1 transition-opacity duration-200
                      ${selectedTier === "inicial" ? "text-foreground" : "text-muted-foreground"}
                    `}>
                       {content.currencySymbol}{(() => {
                         // Calculate dynamic price for inicial tier using selected variant
                         const selectedVariant = variants.find(v => v.id === selectedVariantId) || variants[0];
                         if (selectedVariant) {
                           return getVariantPrice(selectedVariant, "inicial").toFixed(2);
                         }
                         return "0.00";
                       })()}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      {(() => {
                        // Get actual min_qty from selected variant's price tiers (not first variant)
                        const selectedVariant = rows.find(r => r.id === selectedVariantId)?.variant || variants[0];
                        if (!selectedVariant) return content.pricingTiers.inicial.range;
                        
                        // Use CNY currency to get the correct min_qty values
                        const inicialTier = (selectedVariant as any).variant_price_tiers?.find((pt: any) => 
                          pt.tier === "inicial" && pt.currency === "CNY"
                        );
                        const mayoristaTier = (selectedVariant as any).variant_price_tiers?.find((pt: any) => 
                          pt.tier === "mayorista" && pt.currency === "CNY"
                        );
                        
                        if (inicialTier && mayoristaTier) {
                          return `${inicialTier.min_qty.toLocaleString()} – ${(mayoristaTier.min_qty - 1).toLocaleString()} unidades`;
                        }
                        return content.pricingTiers.inicial.range;
                      })()}
                    </div>
                  </div>
                </button>

                {/* Mayorista destacado */}
                <button
                  type="button"
                  onClick={() => setSelectedTier("mayorista")}
                  className="text-center group transition-all duration-200"
                  aria-pressed={selectedTier === "mayorista"}
                >
                  <div className="text-lg font-bold mb-2 text-foreground">{content.pricingTiers.mayorista.name}</div>
                  <div className={`
                    relative rounded-[18px] border-2 px-6 py-6 transition-all duration-200 bg-white/50
                    ${selectedTier === "mayorista" 
                      ? "border-foreground shadow-xl scale-105 bg-white" 
                      : "border-border/50 hover:border-border group-hover:scale-102"
                    }
                  `}>
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-foreground text-background text-xs font-bold px-4 py-1 shadow-lg">
                      {content.pricingTiers.mayorista.badge}
                    </span>
                    <div className="text-3xl font-black mb-1 text-foreground">
                       {content.currencySymbol}{(() => {
                         // Calculate dynamic price for mayorista tier using selected variant
                         const selectedVariant = variants.find(v => v.id === selectedVariantId) || variants[0];
                         if (selectedVariant) {
                           return getVariantPrice(selectedVariant, "mayorista").toFixed(2);
                         }
                         return "0.00";
                       })()}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      {(() => {
                        // Get actual min_qty from selected variant's price tiers (not first variant)
                        const selectedVariant = rows.find(r => r.id === selectedVariantId)?.variant || variants[0];
                        if (!selectedVariant) return content.pricingTiers.mayorista.range;
                        
                        // Use CNY currency to get the correct min_qty values
                        const mayoristaTier = (selectedVariant as any).variant_price_tiers?.find((pt: any) => 
                          pt.tier === "mayorista" && pt.currency === "CNY"
                        );
                        const distribuidorTier = (selectedVariant as any).variant_price_tiers?.find((pt: any) => 
                          pt.tier === "distribuidor" && pt.currency === "CNY"
                        );
                        
                        if (mayoristaTier && distribuidorTier) {
                          return `${mayoristaTier.min_qty.toLocaleString()} – ${(distribuidorTier.min_qty - 1).toLocaleString()} unidades`;
                        }
                        return content.pricingTiers.mayorista.range;
                      })()}
                    </div>
                  </div>
                </button>

                {/* Distribuidor */}
                <button
                  type="button"
                  onClick={() => setSelectedTier("distribuidor")}
                  className="text-center group transition-all duration-200"
                  aria-pressed={selectedTier === "distribuidor"}
                >
                  <div className="text-lg font-bold mb-2 text-foreground">{content.pricingTiers.distribuidor.name}</div>
                  <div className={`
                    rounded-[18px] border-2 px-6 py-6 transition-all duration-200 bg-white/50
                    ${selectedTier === "distribuidor" 
                      ? "border-foreground shadow-lg scale-105 bg-white" 
                      : "border-border/50 hover:border-border group-hover:scale-102"
                    }
                  `}>
                    <div className={`
                      text-3xl font-black mb-1 transition-opacity duration-200
                      ${selectedTier === "distribuidor" ? "text-foreground" : "text-muted-foreground"}
                    `}>
                       {content.currencySymbol}{(() => {
                         // Calculate dynamic price for distribuidor tier using selected variant
                         const selectedVariant = variants.find(v => v.id === selectedVariantId) || variants[0];
                         if (selectedVariant) {
                           return getVariantPrice(selectedVariant, "distribuidor").toFixed(2);
                         }
                         return "0.00";
                       })()}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      {(() => {
                        // Get actual min_qty from selected variant's price tiers (not first variant)
                        const selectedVariant = rows.find(r => r.id === selectedVariantId)?.variant || variants[0];
                        if (!selectedVariant) return content.pricingTiers.distribuidor.range;
                        
                        // Use CNY currency to get the correct min_qty values
                        const distribuidorTier = (selectedVariant as any).variant_price_tiers?.find((pt: any) => 
                          pt.tier === "distribuidor" && pt.currency === "CNY"
                        );
                        
                        if (distribuidorTier) {
                          return `+${distribuidorTier.min_qty.toLocaleString()} unidades`;
                        }
                        return content.pricingTiers.distribuidor.range;
                      })()}
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Faja inferior: tendencia + Trends con flecha */}
            <MarketSpecificBanners />
          </article>
        </section>


        {/* Variantes */}
        <section className="mt-8 md:w-3/4">
          <h2 className="text-xl font-semibold mb-3">Variantes</h2>
          <div className="overflow-x-auto">
             <table className="w-full text-sm border-separate border-spacing-0">
               <thead>
                 {/* Primera fila del header */}
                 <tr>
                   <th className="px-3 py-2" style={{ backgroundColor: 'white' }}></th>
                    <th className="px-2 py-2" style={{ backgroundColor: 'white' }}></th>
                    <th className="px-2 py-2" style={{ backgroundColor: 'white' }}></th>
                   <th className="text-center px-2 py-3 font-medium bg-brand-blue text-white rounded-tl-2xl" colSpan={4}>
                     <div className="flex items-center justify-center gap-2">
                       <span>Complementos</span>
                     </div>
                   </th>
                   <th className="text-center px-2 py-3 font-medium text-white rounded-tr-2xl" style={{ backgroundColor: '#46cd8a' }}>Precio</th>
                 </tr>
                 
                 {/* Segunda fila del header */}
                 <tr>
                   <th className="text-left px-3 py-3 font-medium w-[200px] text-xs rounded-tl-2xl" style={{ backgroundColor: '#f5f5f5', color: '#898989' }}>{content.tableHeaders.product}</th>
                   <th className="text-center px-2 py-3 font-medium w-[80px] text-xs" style={{ backgroundColor: '#f5f5f5', color: '#898989' }}>{content.tableHeaders.units}</th>
                   <th className="text-center px-2 py-3 font-medium w-[90px] relative text-xs" style={{ backgroundColor: '#f5f5f5', color: '#898989' }}>
                     <div className="flex flex-col items-center gap-1">
                       <span>Precio</span>
                       <span>Unitario</span>
                     </div>
                     <HoverCard>
                       <HoverCardTrigger asChild>
                         <button className="absolute top-1 right-1 w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-[10px] text-gray-600">
                           ?
                         </button>
                       </HoverCardTrigger>
                       <HoverCardContent className="w-64">
                         <div className="space-y-2">
                           <h4 className="text-sm font-semibold">Precio Unitario</h4>
                           <p className="text-xs text-muted-foreground">
                             El precio por unidad varía según el nivel de precios seleccionado (inicial, mayorista o distribuidor).
                           </p>
                         </div>
                       </HoverCardContent>
                     </HoverCard>
                   </th>
                     <th className="text-left px-2 py-2 font-medium w-[110px] relative bg-brand-blue text-white text-xs">
                       <div className="flex flex-col items-start gap-1">
                         <span className="text-[10px]">Etiquetado para</span>
                         <span className="text-[10px]">Marketplaces</span>
                       </div>
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <button className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-[10px] text-white">
                            ?
                          </button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-64">
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold">Etiquetado para Marketplaces</h4>
                            <p className="text-xs text-muted-foreground">
                              Servicio de etiquetado especializado para cumplir con los requisitos de los principales marketplaces. Incluye códigos de barras, información de producto y etiquetas de calidad.
                            </p>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </th>
                     <th className="text-left px-2 py-2 font-medium w-[110px] relative bg-brand-blue text-white text-xs">
                       <div className="flex flex-col items-start gap-1">
                         <span className="text-[10px]">Registro de</span>
                         <span className="text-[10px]">Código de Barras</span>
                       </div>
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <button className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-[10px] text-white">
                            ?
                          </button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-64">
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold">Registro de Código de Barras</h4>
                            <p className="text-xs text-muted-foreground">
                              Registro oficial de códigos de barras UPC/EAN para su producto. Necesario para vender en tiendas físicas y algunos marketplaces.
                            </p>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </th>
                     <th className="text-left px-2 py-2 font-medium w-[110px] relative bg-brand-blue text-white text-xs">
                       <div className="flex flex-col items-start gap-1">
                         <span className="text-[10px]">Fotografías</span>
                         <span className="text-[10px]">Comerciales</span>
                       </div>
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <button className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-[10px] text-white">
                            ?
                          </button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-64">
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold">Fotografías Comerciales</h4>
                            <p className="text-xs text-muted-foreground">
                              Sesión fotográfica profesional de sus productos con fondo blanco y ángulos optimizados para e-commerce y marketplaces.
                            </p>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </th>
                     <th className="text-left px-2 py-2 font-medium w-[110px] relative bg-brand-blue text-white text-xs">
                       <div className="flex flex-col items-start gap-1">
                         <span className="text-[10px]">Empaque</span>
                         <span className="text-[10px]">Optimizado</span>
                       </div>
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <button className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-[10px] text-white">
                            ?
                          </button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-64">
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold">Empaque Optimizado</h4>
                            <p className="text-xs text-muted-foreground">
                              Diseño y optimización del empaque para reducir costos de envío, mejorar la protección del producto y cumplir con estándares de e-commerce.
                            </p>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </th>
                   <th className="text-center px-2 py-2 font-medium w-[80px] text-white text-base" style={{ backgroundColor: '#46cd8a' }}>Total</th>
                 </tr>
               </thead>
              <tbody>
                {rows.length > 0 && rows.map((r) => {
                  if (!r || !r.variant) return null;
                  
                  const variantPrice = getVariantPrice(r.variant, selectedTier) || 0;
                  const variantImages = (r.variant as any)?.product_variant_images;
                  const variantImage = (Array.isArray(variantImages) && variantImages[0]?.url) || product?.image || "/placeholder.svg";
                  const variantName = r.variant.name || product?.name || "Producto";
                  const variantOption = r.variant.option_name || r.variant.attributes?.color || "Estándar";
                  
                  // Get units from price tier data with USD currency for min_qty
                  const targetCurrency = market === "CO" ? "COP" : "USD";
                  const priceTiers = (r.variant as any)?.variant_price_tiers || [];
                  const priceTier = priceTiers.find((tier: any) => 
                    tier?.tier === selectedTier && tier?.currency === targetCurrency
                  );
                  const minQty = priceTier?.min_qty || 1;
                  
                  const isSelected = selectedVariantId === r.id;
                  
                    return (
                      <tr 
                        key={r.id}
                        className={`cursor-pointer hover:bg-muted/30 transition-all duration-200 ${
                          isSelected ? 'bg-white shadow-lg' : ''
                        }`}
                        style={isSelected ? { 
                          borderLeft: '4px solid #abff97',
                          boxShadow: '0 4px 12px rgba(171, 255, 151, 0.3)'
                        } : {}}
                        onClick={() => {
                          try {
                            handleVariantSelection(r.id);
                          } catch (error) {
                            console.error('Click handler error:', error);
                          }
                        }}
                      >
                        {/* Producto */}
                        <td className="px-3 py-3 w-[200px]">
                          <div className="flex items-center gap-2">
                            <img src={variantImage} alt={variantName} className="w-16 h-16 rounded object-cover flex-shrink-0" loading="lazy" />
                            <div className="min-w-0">
                              <div className="font-medium leading-tight text-base truncate">{variantName}</div>
                              {variantOption !== "Estándar" && (
                                <div className="text-sm text-muted-foreground truncate">{variantOption}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Unidades */}
                        <td className="px-2 py-3 w-[80px]" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center">
                            <div className="inline-flex items-center border rounded">
                              <button 
                                className="px-1 py-0.5 text-xs hover:bg-gray-100" 
                                onClick={() => changeQty(r.id, -1)} 
                                aria-label="Disminuir"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                value={r.qty || 0}
                                onChange={(e) => {
                                  const inputValue = parseInt(e.target.value) || 0;
                                  
                                  // Map tier names to database tier values
                                  const tierMap = {
                                    inicial: "tier1",
                                    mayorista: "tier2", 
                                    distribuidor: "tier3"
                                  } as const;
                                  
                                  const dbTier = tierMap[selectedTier as keyof typeof tierMap];
                                  
                                  // Get the min_qty for this variant and tier
                                  const priceTiers = (r.variant as any)?.price_tiers || [];
                                  const priceTier = priceTiers.find((tier: any) => 
                                    tier?.tier === dbTier
                                  );
                                  const minQty = priceTier?.min_qty || 1;
                                  
                                  // Ensure the value is not less than min_qty
                                  const newQty = Math.max(inputValue, minQty);
                                  const currentQty = r.qty || 0;
                                  const diff = newQty - currentQty;
                                  
                                  if (diff !== 0) {
                                    changeQty(r.id, diff);
                                  }
                                }}
                                className="w-10 px-1 py-0.5 text-center text-xs border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                min={(() => {
                                  const priceTiers = (r.variant as any)?.variant_price_tiers || [];
                                  const priceTier = priceTiers.find((tier: any) => 
                                    tier?.tier === selectedTier && tier?.currency === "CNY"
                                  );
                                  return priceTier?.min_qty || 1;
                                })()}
                              />
                              <button 
                                className="px-1 py-0.5 text-xs hover:bg-gray-100" 
                                onClick={() => changeQty(r.id, 1)} 
                                aria-label="Aumentar"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Precio Unitario */}
                        <td className="px-2 py-3 text-center w-[90px]">
                          <div className="text-xs font-medium">{content.currencySymbol}{variantPrice.toFixed(2)}</div>
                        </td>

                        {/* Etiquetado para Marketplaces */}
                         <td className="px-2 py-3 text-center w-[110px]" onClick={(e) => e.stopPropagation()}>
                           <div className="flex flex-col items-center gap-2 h-24 justify-between">
                             {/* Precio por unidad - siempre visible */}
                             <div className="text-[10px]" style={{ color: '#545454' }}>
                               {content.currencySymbol}{((variantPrice * (pricingSettings?.marketplace_labeling_pct || 2) / 100)).toFixed(3)} por unidad
                             </div>
                             
                              {/* Selector */}
                              <div className="flex justify-center">
                                {r.comps?.labeling ? (
                                  <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-green text-white cursor-pointer" onClick={() => toggleComp(r.id, "labeling")}>
                                    <span className="text-xs">✓</span>
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center justify-center w-6 h-6 rounded border-2 border-gray-300 hover:border-brand-green cursor-pointer transition-all" onClick={() => toggleComp(r.id, "labeling")}>
                                  </div>
                                )}
                              </div>
                              
                              {/* Número de artículos - solo si está seleccionado */}
                              {r.comps?.labeling && (
                                <div className="text-black text-[10px] font-medium px-3 py-1 rounded-full" style={{ backgroundColor: '#abff97' }}>
                                  10 artículos
                                </div>
                              )}
                             
                             {/* Total - solo si está seleccionado */}
                             {r.comps?.labeling && (
                               <div className="text-xs font-medium" style={{ color: '#545454' }}>
                                 TOTAL {content.currencySymbol}{(r.qty * variantPrice * (pricingSettings?.marketplace_labeling_pct || 2) / 100).toFixed(2)}
                               </div>
                             )}
                           </div>
                         </td>

                        {/* Registro de Código de Barras */}
                         <td className="px-2 py-3 text-center w-[110px]" onClick={(e) => e.stopPropagation()}>
                           <div className="flex flex-col items-center gap-2 h-24 justify-between">
                             {/* Precio fijo - siempre visible */}
                             <div className="text-[10px]" style={{ color: '#545454' }}>
                               {content.currencySymbol}{(pricingSettings?.barcode_registration_usd || 1).toFixed(0)} por variante
                             </div>
                             
                             {/* Selector */}
                             <div className="flex justify-center">
                               {r.comps?.barcode ? (
                                 <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-green text-white cursor-pointer" onClick={() => toggleComp(r.id, "barcode")}>
                                   <span className="text-xs">✓</span>
                                 </div>
                               ) : (
                                 <div className="inline-flex items-center justify-center w-6 h-6 rounded border-2 border-gray-300 hover:border-brand-green cursor-pointer transition-all" onClick={() => toggleComp(r.id, "barcode")}>
                                 </div>
                               )}
                             </div>
                             
                             {/* Total - solo si está seleccionado */}
                             {r.comps?.barcode && (
                               <div className="text-xs font-medium" style={{ color: '#545454' }}>
                                 TOTAL {content.currencySymbol}{(pricingSettings?.barcode_registration_usd || 1).toFixed(0)}
                               </div>
                             )}
                           </div>
                         </td>

                        {/* Fotografías Comerciales */}
                         <td className="px-2 py-3 text-center w-[110px]" onClick={(e) => e.stopPropagation()}>
                           <div className="flex flex-col items-center gap-2 h-24 justify-between">
                             {/* Precio fijo - siempre visible */}
                             <div className="text-[10px]" style={{ color: '#545454' }}>
                               {content.currencySymbol}{(pricingSettings?.commercial_photos_usd || 45).toFixed(0)} por variante
                             </div>
                             
                             {/* Selector */}
                             <div className="flex justify-center">
                               {r.comps?.photos ? (
                                 <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-green text-white cursor-pointer" onClick={() => toggleComp(r.id, "photos")}>
                                   <span className="text-xs">✓</span>
                                 </div>
                               ) : (
                                 <div className="inline-flex items-center justify-center w-6 h-6 rounded border-2 border-gray-300 hover:border-brand-green cursor-pointer transition-all" onClick={() => toggleComp(r.id, "photos")}>
                                 </div>
                               )}
                             </div>
                             
                             {/* Total - solo si está seleccionado */}
                             {r.comps?.photos && (
                               <div className="text-xs font-medium" style={{ color: '#545454' }}>
                                 TOTAL {content.currencySymbol}{(pricingSettings?.commercial_photos_usd || 45).toFixed(0)}
                               </div>
                             )}
                           </div>
                         </td>

                         {/* Empaque Optimizado */}
                          <td className="px-2 py-3 text-center w-[110px] bg-white hover:bg-gray-50 transition-colors" onClick={(e) => e.stopPropagation()}>
                           <div className="flex flex-col items-center gap-2 h-24 justify-between">
                             {/* Precio por unidad - siempre visible */}
                              <div className="text-[10px]" style={{ color: '#545454' }}>
                               {content.currencySymbol}{((variantPrice * (pricingSettings?.optimized_packaging_pct || 5) / 100)).toFixed(3)} por unidad
                             </div>
                             
                             {/* Número de artículos - solo si está seleccionado */}
                             {r.comps?.packaging && (
                               <div className="bg-green-400 text-black text-xs font-medium px-3 py-1 rounded-full">
                                 {r.qty.toLocaleString()} artículos
                               </div>
                             )}
                             
                             {/* Selector */}
                             <div className="flex justify-center">
                               {r.comps?.packaging ? (
                                 <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-green text-white cursor-pointer" onClick={() => toggleComp(r.id, "packaging")}>
                                   <span className="text-xs">✓</span>
                                 </div>
                               ) : (
                                 <div className="inline-flex items-center justify-center w-6 h-6 rounded border-2 border-gray-300 hover:border-brand-green cursor-pointer transition-all" onClick={() => toggleComp(r.id, "packaging")}>
                                 </div>
                               )}
                             </div>
                             
                             {/* Total - solo si está seleccionado */}
                             {r.comps?.packaging && (
                               <div className="text-xs font-medium" style={{ color: '#545454' }}>
                                 TOTAL {content.currencySymbol}{(r.qty * variantPrice * (pricingSettings?.optimized_packaging_pct || 5) / 100).toFixed(2)}
                               </div>
                             )}
                           </div>
                         </td>

                        {/* Total */}
                        <td className="px-2 py-3 text-center w-[80px]">
                          <div className="text-sm font-semibold">{content.currencySymbol}{rowTotal(r).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </td>
                      </tr>
                    );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <article className="rounded-2xl border bg-card text-card-foreground p-4 flex items-start gap-4 h-24">
              <span className="inline-flex items-center justify-center size-10 rounded-xl bg-muted text-muted-foreground flex-shrink-0" aria-hidden="true">
                <Cog className="size-5" />
              </span>
              <div className="flex-1">
                <h3 className="font-semibold">Opciones de personalización</h3>
                <p className="text-sm text-muted-foreground">Si deseas personalizar tus productos, nuestro equipo en China se encargará.</p>
              </div>
            </article>
            <article className="rounded-2xl border bg-card text-card-foreground p-4 flex items-start gap-4 h-24">
              <span className="inline-flex items-center justify-center size-10 rounded-xl bg-muted text-muted-foreground flex-shrink-0" aria-hidden="true">
                <Cog className="size-5" />
              </span>
              <div className="flex-1">
                <h3 className="font-semibold">Entrega confiable</h3>
                <p className="text-sm text-muted-foreground">Contamos con una logística optimizada para que recibas tus productos lo antes posible.</p>
              </div>
            </article>
            <article className="rounded-2xl border bg-card text-card-foreground p-4 flex items-start gap-4 h-24">
              <span className="inline-flex items-center justify-center size-10 rounded-xl bg-muted text-muted-foreground flex-shrink-0" aria-hidden="true">
                <Cog className="size-5" />
              </span>
              <div className="flex-1">
                <h3 className="font-semibold">Pago diferido</h3>
                <p className="text-sm text-muted-foreground">Hoy solo pagas el 30%. El resto lo pagas cuando confirmemos todo desde China.</p>
              </div>
            </article>
            <article className="rounded-2xl border bg-card text-card-foreground p-4 flex items-start gap-4 h-24">
              <span className="inline-flex items-center justify-center size-10 rounded-xl bg-muted text-muted-foreground flex-shrink-0" aria-hidden="true">
                <Cog className="size-5" />
              </span>
              <div className="flex-1">
                <h3 className="font-semibold">Control de calidad</h3>
                <p className="text-sm text-muted-foreground">Control de calidad en fábrica con estándares internacionales.</p>
              </div>
            </article>
          </div>

          {/* Detalles técnicos - movido aquí */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-6">Detalles técnicos</h2>
            <div className="bg-white rounded-lg p-6 border w-full">
              {(() => {
                const selectedVariant = variants.find(v => v.id === selectedVariantId) || variants[0];
                if (!selectedVariant) return <p className="text-muted-foreground">No hay datos disponibles</p>;
                
                const categories = product ? products.find(p => p.id === product.id)?.categories || [] : [];
                const mainCategory = categories[0];
                const subCategory = categories[1];
                
                return (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Columna 1: Producto */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-6">
                        <Package className="size-5 text-coral" />
                        <h3 className="text-lg font-semibold">Producto</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Hash className="size-4 text-coral" />
                          <div>
                            <div className="text-gray-400 text-sm">Código PA</div>
                            <div className="text-black font-medium">{selectedVariant.sku || "—"}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Box className="size-4 text-coral" />
                          <div>
                            <div className="text-gray-400 text-sm">Categoría</div>
                            <div className="text-black font-medium">{mainCategory?.name || "—"}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Box className="size-4 text-coral" />
                          <div>
                            <div className="text-gray-400 text-sm">Subcategoría</div>
                            <div className="text-black font-medium">{subCategory?.name || "—"}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Package className="size-4 text-coral" />
                          <div>
                            <div className="text-gray-400 text-sm">Material</div>
                            <div className="text-black font-medium">Plástico</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Battery className="size-4 text-coral" />
                          <div>
                            <div className="text-gray-400 text-sm">¿Contiene batería?</div>
                            <div className="text-black font-medium">{selectedVariant.has_battery ? "Sí" : "No"}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Columna 2: Detalles caja */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-6">
                        <Package className="size-5 text-coral" />
                        <h3 className="text-lg font-semibold">Detalles caja</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <ArrowLeftRight className="size-4 text-coral" />
                          <div>
                            <div className="text-gray-400 text-sm">Ancho de la caja</div>
                            <div className="text-black font-medium">
                              {selectedVariant.box_width_cm ? `${selectedVariant.box_width_cm} cm` : "—"}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <ArrowUpDown className="size-4 text-coral" />
                          <div>
                            <div className="text-gray-400 text-sm">Largo de la caja</div>
                            <div className="text-black font-medium">
                              {selectedVariant.box_length_cm ? `${selectedVariant.box_length_cm} cm` : "—"}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <ArrowUpDown className="size-4 text-coral rotate-90" />
                          <div>
                            <div className="text-gray-400 text-sm">Alto de la caja</div>
                            <div className="text-black font-medium">
                              {selectedVariant.box_height_cm ? `${selectedVariant.box_height_cm} cm` : "—"}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Scale className="size-4 text-coral" />
                          <div>
                            <div className="text-gray-400 text-sm">Peso de la caja</div>
                            <div className="text-black font-medium">
                              {selectedVariant.box_weight_kg ? `${selectedVariant.box_weight_kg} kg` : "—"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Columna 3: Detalles producto */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-6">
                        <Package className="size-5 text-coral" />
                        <h3 className="text-lg font-semibold">Detalles producto</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <ArrowLeftRight className="size-4 text-coral" />
                          <div>
                            <div className="text-gray-400 text-sm">Ancho del producto</div>
                            <div className="text-black font-medium">
                              {selectedVariant.width_cm ? `${selectedVariant.width_cm} cm` : "—"}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <ArrowUpDown className="size-4 text-coral" />
                          <div>
                            <div className="text-gray-400 text-sm">Largo del producto</div>
                            <div className="text-black font-medium">
                              {selectedVariant.length_cm ? `${selectedVariant.length_cm} cm` : "—"}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <ArrowUpDown className="size-4 text-coral rotate-90" />
                          <div>
                            <div className="text-gray-400 text-sm">Alto del producto</div>
                            <div className="text-black font-medium">
                              {selectedVariant.height_cm ? `${selectedVariant.height_cm} cm` : "—"}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Scale className="size-4 text-coral" />
                          <div>
                            <div className="text-gray-400 text-sm">Peso del producto</div>
                            <div className="text-black font-medium">
                              {selectedVariant.weight_kg ? `${selectedVariant.weight_kg} kg` : "—"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </section>

        {/* Imágenes */}
        <section className="mt-8 md:w-3/4">
          <h2 className="text-xl font-semibold mb-3">Imágenes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(() => {
              // Collect all images from all variants
              const allImages = variants.flatMap(variant => 
                (variant as any).product_variant_images?.map((img: any) => ({
                  ...img,
                  variantName: variant.name || product.name,
                  variantId: variant.id
                })) || []
              ).sort((a, b) => a.sort_order - b.sort_order);

              return allImages.map((image, i) => (
                <div key={`${image.variantId}-${image.id}`} className="relative rounded-2xl border overflow-hidden bg-muted aspect-square group hover:shadow-lg transition-all duration-200">
                  <img 
                    src={image.url} 
                    alt={image.alt || `${image.variantName} imagen ${i + 1}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" 
                    loading="lazy" 
                  />
                  <div className="absolute bottom-2 left-2 rounded-full bg-black/70 text-white text-xs px-2 py-1">
                    {image.variantName}
                  </div>
                </div>
              ));
            })()}
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default ProductView;
