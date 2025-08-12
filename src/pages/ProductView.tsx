import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import type { Product } from "@/components/landing/ProductCard";
import { ArrowUpRight, CheckCircle2, Cog, Hash, Box, Package, Battery, Ruler, Scale } from "lucide-react";
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
    if (id) return id; // Direct ID access from fallback routes
    if (slug && products.length > 0) {
      // Find product by slug first, then fallback to ID if slug looks like a UUID
      const productBySlug = products.find(p => p.slug === slug);
      if (productBySlug) return productBySlug.id;
      
      // If slug looks like a UUID, treat it as an ID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(slug)) return slug;
    }
    return undefined;
  }, [slug, id, products.length]); // Only depend on length, not the array

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
  }, [productId, products.length]); // Only depend on length, not the array

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
    setSelectedVariantId(variantId);
    
    // Update quantities for all rows based on selected variant
    setRows(prev => prev.map(row => {
      if (row.id === variantId) {
        // Get min quantity for this variant in current tier
        const tierMap = { inicial: "tier1", mayorista: "tier2", distribuidor: "tier3" } as const;
        const dbTier = tierMap[selectedTier];
        const priceTier = (row.variant as any).variant_price_tiers?.find((tier: any) => tier.tier === dbTier);
        const minQty = priceTier?.min_qty || 1;
        
        return { ...row, qty: minQty };
      }
      return row;
    }));
    
    // Jump to first image of selected variant
    const allImages = variants.flatMap(variant => 
      (variant as any).product_variant_images?.map((img: any) => ({
        ...img,
        variantId: variant.id
      })) || []
    ).sort((a, b) => a.sort_order - b.sort_order);
    
    const variantImageIndex = allImages.findIndex(img => img.variantId === variantId);
    if (variantImageIndex !== -1) {
      setSelectedImageIndex(variantImageIndex);
    }
  }, [selectedTier, variants]);

  // Initialize rows when variants change - stabilized to prevent reloads
  useEffect(() => {
    if (variants.length > 0 && rows.length === 0) {
      const newRows = variants.map(variant => {
        // Get the minimum quantity for mayorista tier (default)
        const mayoristaTier = (variant as any).variant_price_tiers?.find((tier: any) => tier.tier === "mayorista");
        const fallbackTier = (variant as any).variant_price_tiers?.[0];
        const tierData = mayoristaTier || fallbackTier;
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
    }
  }, [variants, rows.length, selectedVariantId]); // More stable dependencies

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

  const rowTotal = (r: VariantRow) => {
    const variantPrice = getVariantPrice(r.variant, selectedTier);
    const base = r.qty * variantPrice;
    const comps =
      (r.comps.labeling ? r.qty * perUnitLabeling : 0) +
      (r.comps.packaging ? r.qty * perUnitPackaging : 0) +
      (r.comps.barcode ? fixedBarcode : 0) +
      (r.comps.photos ? fixedPhotos : 0);
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

  const changeQty = (id: string, delta: number) =>
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, qty: Math.max(0, r.qty + delta) } : r))
    );

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

  // Redirect to slug-based URL if we're using ID-based URL
  useEffect(() => {
    if (product && product.slug && id && !slug) {
      const currentPath = location.pathname;
      const newPath = currentPath.replace(`/product/id/${id}`, `/product/${product.slug}`);
      navigate(newPath, { replace: true });
    }
  }, [product, id, slug, navigate, location.pathname]);

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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[3fr_1fr]">
          {/* Columna izquierda (75%): Galería + Detalles */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4">{/* Optimizar proporción galería/detalles */}
              {/* Galería - compacta */}
              <div className="rounded-2xl bg-card p-2 md:p-3 h-fit">
                <div className="space-y-2">
                  <div className="relative overflow-hidden rounded-xl bg-muted aspect-square p-4">
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
                  <h1 className="text-2xl md:text-3xl font-semibold leading-tight">{product.name}</h1>
                </header>

                {/* Barra de precios por tiers - Rediseñada según referencia */}
                <article className="max-w-[1140px] mx-auto bg-white border border-[#E5E7EB] rounded-3xl overflow-hidden shadow-sm">
                  <div className="p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-6">
                      {/* Inicial - Lateral izquierdo */}
                      <div className="text-center order-2 md:order-1">
                        <h3 className="text-[28px] md:text-[32px] font-semibold text-[#0A0A0A] mb-6">{content.pricingTiers.inicial.name}</h3>
                        <div className="bg-[#F6F6F6] border border-[#E5E7EB] rounded-3xl p-8 md:p-10">
                          <div className="text-[48px] md:text-[64px] font-extrabold text-[#9CA3AF] tracking-tight leading-none mb-4">
                            {content.currencySymbol}{(() => {
                              if (variants.length > 0) {
                                return Math.round(getVariantPrice(variants[0], "inicial"));
                              }
                              return "35";
                            })()}
                          </div>
                          <div className="text-[20px] md:text-[22px] text-[#9CA3AF]">{content.pricingTiers.inicial.range}</div>
                        </div>
                      </div>

                      {/* Mayorista - Central destacado */}
                      <div className="text-center relative order-1 md:order-2">
                        {/* Badge "Recomendado" flotante */}
                        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10">
                          <div className="bg-[#0A0A0A] text-white text-[14px] md:text-[16px] font-medium px-4 py-2 rounded-full">
                            {content.pricingTiers.mayorista.badge}
                          </div>
                        </div>
                        
                        <h3 className="text-[28px] md:text-[32px] font-semibold text-[#0A0A0A] mb-6">{content.pricingTiers.mayorista.name}</h3>
                        <div className="bg-white border-[3px] border-[#0A0A0A] rounded-3xl p-8 md:p-10 shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
                          <div className="text-[48px] md:text-[64px] font-extrabold text-[#0A0A0A] tracking-tight leading-none mb-4">
                            {content.currencySymbol}{(() => {
                              if (variants.length > 0) {
                                return Math.round(getVariantPrice(variants[0], "mayorista"));
                              }
                              return "300";
                            })()}
                          </div>
                          <div className="text-[20px] md:text-[22px] text-[#6B7280]">{content.pricingTiers.mayorista.range}</div>
                        </div>
                      </div>

                      {/* Distribuidor - Lateral derecho */}
                      <div className="text-center order-3">
                        <h3 className="text-[28px] md:text-[32px] font-semibold text-[#0A0A0A] mb-6">{content.pricingTiers.distribuidor.name}</h3>
                        <div className="bg-[#F6F6F6] border border-[#E5E7EB] rounded-3xl p-8 md:p-10">
                          <div className="text-[48px] md:text-[64px] font-extrabold text-[#9CA3AF] tracking-tight leading-none mb-4">
                            {content.currencySymbol}{(() => {
                              if (variants.length > 0) {
                                return Math.round(getVariantPrice(variants[0], "distribuidor"));
                              }
                              return "725";
                            })()}
                          </div>
                          <div className="text-[20px] md:text-[22px] text-[#9CA3AF]">{content.pricingTiers.distribuidor.range}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Banner inferior amarillo */}
                  <div className="bg-[#FFE65A] min-h-[96px] rounded-b-3xl px-6 md:px-8 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[#0A0A0A] font-medium">Producto en tendencia en</span>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-sm">ML</span>
                        </div>
                        <span className="text-[#0A0A0A] font-semibold">mercado libre</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[#0A0A0A] font-medium">Ver más en 🔥TRENDS</span>
                      <button 
                        className="w-12 h-12 bg-white border border-[#0A0A0A] rounded-full flex items-center justify-center hover:shadow-md transition-shadow"
                        aria-label="Ver tendencias"
                      >
                        <ArrowUpRight className="w-5 h-5 text-[#0A0A0A]" />
                      </button>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </section>

          {/* Columna derecha (20%): Resumen sticky */}
          <aside className="hidden md:block sticky top-20 self-start h-max rounded-2xl bg-card text-card-foreground border p-6 z-10 shadow-md">{/* Fixed sticky positioning */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{content.minOrderText}</span>
              <CheckCircle2 className="opacity-60" />
            </div>

            <button
              onClick={addToCart}
              className="mt-4 w-full rounded-xl bg-green-500 text-white py-3 font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              aria-label={content.cartButtonText}
              disabled={totals.total < minOrder}
            >
              {content.cartButtonText}
            </button>

            <div className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between"><span>{content.tableHeaders.product} ({totals.items})</span><span>{content.currencySymbol}{totals.products.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Complementos</span><span>{content.currencySymbol}{totals.complements.toFixed(2)}</span></div>
              <div className="flex justify-between font-semibold text-base pt-1 border-t"><span>Total</span><span>{content.currencySymbol}{totals.total.toFixed(2)}</span></div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
              {/* Método de envío */}
              <HoverCard>
                <HoverCardTrigger asChild>
                  <div className="relative rounded-2xl border p-3 bg-background cursor-default aspect-square flex flex-col items-center justify-center text-center">
                    <img src="/lovable-uploads/bcaad47c-1390-4a6e-a192-4c5279337cf3.png" alt="Método de envío" className="h-6 w-auto opacity-60" loading="lazy" />
                    <span className="mt-2 block">Método de envío</span>
                    <img src="/lovable-uploads/b649a871-c178-4c15-bd9b-de67f426d03e.png" alt="Ayuda" className="absolute top-2 right-2 h-4 w-4 opacity-60" loading="lazy" />
                  </div>
                </HoverCardTrigger>
                <HoverCardContent side="top" align="end" className="w-64 p-3 text-xs">
                  {content.features.shipping.description}
                </HoverCardContent>
              </HoverCard>

              {/* Personalizar producto */}
              <HoverCard>
                <HoverCardTrigger asChild>
                  <div className="relative rounded-2xl border p-3 bg-background cursor-default aspect-square flex flex-col items-center justify-center text-center">
                    <img src="/lovable-uploads/e176248e-ec33-4374-8df2-39c6d1d81194.png" alt="Personalizar producto" className="h-6 w-auto opacity-60" loading="lazy" />
                    <span className="mt-2 block">Personalizar producto</span>
                    <img src="/lovable-uploads/b649a871-c178-4c15-bd9b-de67f426d03e.png" alt="Ayuda" className="absolute top-2 right-2 h-4 w-4 opacity-60" loading="lazy" />
                  </div>
                </HoverCardTrigger>
                <HoverCardContent side="top" align="center" className="w-64 p-3 text-xs">
                  {content.features.customization.description}
                </HoverCardContent>
              </HoverCard>

              {/* Precios sin sorpresas */}
              <HoverCard>
                <HoverCardTrigger asChild>
                  <div className="relative rounded-2xl border p-3 bg-background cursor-default aspect-square flex flex-col items-center justify-center text-center">
                    <img src="/lovable-uploads/6a45e477-73d7-45a9-9eda-470e2c37a6cb.png" alt="Precios sin sorpresas" className="h-6 w-auto opacity-60" loading="lazy" />
                    <span className="mt-2 block">Precios sin sorpresas</span>
                    <img src="/lovable-uploads/b649a871-c178-4c15-bd9b-de67f426d03e.png" alt="Ayuda" className="absolute top-2 right-2 h-4 w-4 opacity-60" loading="lazy" />
                  </div>
                </HoverCardTrigger>
                <HoverCardContent side="top" align="start" className="w-64 p-3 text-xs">
                  Transparencia total: desglose de costos, sin cargos ocultos al confirmar tu orden.
                </HoverCardContent>
              </HoverCard>
            </div>
          </aside>
        </div>

        {/* Descripción y características - Solo columna izquierda */}
        <section className="mt-6 md:mt-8 md:w-3/5">
          <article className="prose prose-sm md:prose-base max-w-none">
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
        </section>

        {/* Variantes */}
        <section className="mt-8 w-full md:w-3/5">
          <h2 className="text-xl font-semibold mb-3">Variantes</h2>
          <div className="overflow-x-auto rounded-2xl border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40 text-muted-foreground">
                <tr>
                  <th className="text-left px-3 py-3 font-medium w-[200px]">{content.tableHeaders.product}</th>
                  <th className="text-center px-2 py-3 font-medium w-[80px]">{content.tableHeaders.units}</th>
                  <th className="text-center px-2 py-3 font-medium w-[90px]">Precio Unitario</th>
                  <th className="text-center px-2 py-3 font-medium w-[120px]">Etiquetado para Marketplaces</th>
                  <th className="text-center px-2 py-3 font-medium w-[100px]">Registro de Código de Barras</th>
                  <th className="text-center px-2 py-3 font-medium w-[90px]">Fotografías Comerciales</th>
                  <th className="text-center px-2 py-3 font-medium w-[100px]">Empaque Optimizado</th>
                  <th className="text-center px-2 py-3 font-medium w-[80px]">Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const variantPrice = getVariantPrice(r.variant, selectedTier);
                  const variantImage = (r.variant as any).product_variant_images?.[0]?.url || product.image;
                  const variantName = r.variant.name || product.name;
                  const variantOption = r.variant.option_name || r.variant.attributes?.color || "Estándar";
                  
                  // Get units from price tier data
                  const tierMap = { inicial: "tier1", mayorista: "tier2", distribuidor: "tier3" } as const;
                  const dbTier = tierMap[selectedTier];
                  const priceTier = (r.variant as any).variant_price_tiers?.find((tier: any) => tier.tier === dbTier);
                  const minQty = priceTier?.min_qty || 1;
                  
                  const isSelected = selectedVariantId === r.id;
                  
                  return (
                    <tr 
                      key={r.id} 
                      className={`border-t cursor-pointer hover:bg-muted/30 transition-colors ${
                        isSelected ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                      }`}
                      onClick={() => handleVariantSelection(r.id)}
                    >
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <img src={variantImage} alt={variantName} className="w-10 h-10 rounded object-cover flex-shrink-0" loading="lazy" />
                          <div className="min-w-0">
                            <div className="font-medium leading-tight text-sm truncate">{variantName}</div>
                            {variantOption !== "Estándar" && (
                              <div className="text-xs text-muted-foreground truncate">{variantOption}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center">
                          <div className="inline-flex items-center border rounded">
                            <button className="px-2 py-1 text-xs" onClick={() => changeQty(r.id, -minQty)} aria-label="Disminuir">-</button>
                            <span className="px-2 py-1 min-w-[40px] text-center text-xs">{r.qty}</span>
                            <button className="px-2 py-1 text-xs" onClick={() => changeQty(r.id, minQty)} aria-label="Aumentar">+</button>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-center">
                        <div className="text-sm font-medium">{content.currencySymbol}{variantPrice.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">{content.currencySymbol}0.15 PU</div>
                      </td>

                      {/* Etiquetado */}
                      <td className="px-2 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className={`inline-block w-6 h-6 rounded border-2 cursor-pointer transition-all ${
                          r.comps.labeling ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-400'
                        }`} onClick={() => toggleComp(r.id, "labeling")}>
                          {r.comps.labeling && <div className="text-white text-xs leading-none mt-0.5">✓</div>}
                        </div>
                        <div className="text-xs text-green-600 mt-1">4.000 artículos</div>
                        <div className="text-xs text-muted-foreground">TOTAL $1.863</div>
                      </td>

                      {/* Código de barras */}
                      <td className="px-2 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className={`inline-block w-6 h-6 rounded border-2 cursor-pointer transition-all ${
                          r.comps.barcode ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-400'
                        }`} onClick={() => toggleComp(r.id, "barcode")}>
                          {r.comps.barcode && <div className="text-white text-xs leading-none mt-0.5">✓</div>}
                        </div>
                        <div className="text-xs text-green-600 mt-1">$40</div>
                      </td>

                      {/* Fotos */}
                      <td className="px-2 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className={`inline-block w-6 h-6 rounded border-2 cursor-pointer transition-all ${
                          r.comps.photos ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-400'
                        }`} onClick={() => toggleComp(r.id, "photos")}>
                          {r.comps.photos && <div className="text-white text-xs leading-none mt-0.5">✓</div>}
                        </div>
                        <div className="text-xs text-green-600 mt-1">$1.863</div>
                      </td>

                      {/* Empaque */}
                      <td className="px-2 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className={`inline-block w-6 h-6 rounded border-2 cursor-pointer transition-all ${
                          r.comps.packaging ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-400'
                        }`} onClick={() => toggleComp(r.id, "packaging")}>
                          {r.comps.packaging && <div className="text-white text-xs leading-none mt-0.5">✓</div>}
                        </div>
                        <div className="text-xs text-green-600 mt-1">4.000 artículos</div>
                        <div className="text-xs text-muted-foreground">TOTAL $1.863</div>
                      </td>

                      <td className="px-2 py-3 text-center">
                        <div className="text-sm font-semibold">{content.currencySymbol}{rowTotal(r).toFixed(2)}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <article className="rounded-2xl border bg-card text-card-foreground p-4 flex items-start gap-4">
              <span className="inline-flex items-center justify-center size-10 rounded-xl bg-muted text-muted-foreground" aria-hidden="true">
                <Cog className="size-5" />
              </span>
              <div>
                <h3 className="font-semibold">{content.features.customization.title}</h3>
                <p className="text-sm text-muted-foreground">{content.features.customization.description}</p>
              </div>
            </article>
            <article className="rounded-2xl border bg-card text-card-foreground p-4 flex items-start gap-4">
              <span className="inline-flex items-center justify-center size-10 rounded-xl bg-muted text-muted-foreground" aria-hidden="true">
                <Cog className="size-5" />
              </span>
              <div>
                <h3 className="font-semibold">{content.features.shipping.title}</h3>
                <p className="text-sm text-muted-foreground">{content.features.shipping.description}</p>
              </div>
            </article>
            <article className="rounded-2xl border bg-card text-card-foreground p-4 flex items-start gap-4">
              <span className="inline-flex items-center justify-center size-10 rounded-xl bg-muted text-muted-foreground" aria-hidden="true">
                <Cog className="size-5" />
              </span>
              <div>
                <h3 className="font-semibold">{content.features.payment.title}</h3>
                <p className="text-sm text-muted-foreground">{content.features.payment.description}</p>
              </div>
            </article>
            <article className="rounded-2xl border bg-card text-card-foreground p-4 flex items-start gap-4">
              <span className="inline-flex items-center justify-center size-10 rounded-xl bg-muted text-muted-foreground" aria-hidden="true">
                <Cog className="size-5" />
              </span>
              <div>
                <h3 className="font-semibold">{content.features.quality.title}</h3>
                <p className="text-sm text-muted-foreground">{content.features.quality.description}</p>
              </div>
            </article>
          </div>
        </section>

        {/* Detalles técnicos */}
        <section className="mt-8 w-full md:w-3/5">
          <h2 className="text-xl font-semibold mb-3">Detalles técnicos</h2>
          <div className="rounded-2xl border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40 text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Producto</th>
                  <th className="text-left px-4 py-3 font-medium">Detalles caja</th>
                  <th className="text-left px-4 py-3 font-medium">Detalles producto</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-destructive"><Hash className="size-4" /><span className="text-foreground">Código PA</span></div>
                    <div className="text-muted-foreground">PA00120</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-destructive"><Ruler className="size-4" /><span className="text-foreground">Ancho de la caja</span></div>
                    <div className="text-muted-foreground">15.5 cm</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-destructive"><Ruler className="size-4" /><span className="text-foreground">Ancho del producto</span></div>
                    <div className="text-muted-foreground">14 cm</div>
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-destructive"><Box className="size-4" /><span className="text-foreground">Categoría</span></div>
                    <div className="text-muted-foreground">Hogar</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-destructive"><Ruler className="size-4" /><span className="text-foreground">Largo de la caja</span></div>
                    <div className="text-muted-foreground">24.5 cm</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-destructive"><Ruler className="size-4" /><span className="text-foreground">Largo del producto</span></div>
                    <div className="text-muted-foreground">21 cm</div>
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-destructive"><Box className="size-4" /><span className="text-foreground">Subcategoría</span></div>
                    <div className="text-muted-foreground">Organizadores</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-destructive"><Ruler className="size-4" /><span className="text-foreground">Alto de la caja</span></div>
                    <div className="text-muted-foreground">5.5 cm</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-destructive"><Ruler className="size-4" /><span className="text-foreground">Alto del producto</span></div>
                    <div className="text-muted-foreground">20.5 cm</div>
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-destructive"><Package className="size-4" /><span className="text-foreground">Material</span></div>
                    <div className="text-muted-foreground">Plástico</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-destructive"><Scale className="size-4" /><span className="text-foreground">Peso de la caja</span></div>
                    <div className="text-muted-foreground">0.22 kg</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-destructive"><Scale className="size-4" /><span className="text-foreground">Peso del producto</span></div>
                    <div className="text-muted-foreground">0.17 kg</div>
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-destructive"><Battery className="size-4" /><span className="text-foreground">¿Contiene batería?</span></div>
                    <div className="text-muted-foreground">No</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-destructive"><Package className="size-4" /><span className="text-foreground">Empaque</span></div>
                    <div className="text-muted-foreground">Incluido</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-destructive"><Package className="size-4" /><span className="text-foreground">—</span></div>
                    <div className="text-muted-foreground">—</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Imágenes */}
        <section className="mt-8 w-full md:w-3/5">
          <h2 className="text-xl font-semibold mb-3">Imágenes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-2xl border overflow-hidden bg-muted">
                <img src={product.image} alt={`${product.name} imagen ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default ProductView;
