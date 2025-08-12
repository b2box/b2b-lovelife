import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useEffect, useMemo, useState } from "react";
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

  const initialVariants: VariantRow[] = useMemo(() => {
    console.log("Creating initial variants from:", variants);
    return variants.map(variant => {
      // Get the minimum quantity from the first price tier
      const firstTier = variant.price_tiers?.find(tier => tier.tier === "tier1") || 
                       variant.price_tiers?.[0];
      const minQty = firstTier?.min_qty || 1;
      
      return {
        id: variant.id,
        variant,
        qty: minQty, // Set initial quantity to minimum required
        comps: { labeling: false, barcode: false, photos: false, packaging: false }
      };
    });
  }, [variants]);

  const [rows, setRows] = useState<VariantRow[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Update rows when variants change
  useEffect(() => {
    console.log("Updating rows. Variants length:", variants.length, "Initial variants:", initialVariants);
    setRows(initialVariants);
  }, [initialVariants]);

  // Set the first variant as selected by default (separate effect to avoid loop)
  useEffect(() => {
    if (initialVariants.length > 0 && !selectedVariantId) {
      setSelectedVariantId(initialVariants[0].id);
    }
  }, [initialVariants.length]); // Only depend on length, not the actual array or selectedVariantId

  const perUnitLabeling = 0.15;
  const perUnitPackaging = 0.04;
  const fixedBarcode = 40;
  const fixedPhotos = 1863;
  const minOrder = 100;
  const [selectedTier, setSelectedTier] = useState<"inicial" | "mayorista" | "distribuidor">("mayorista");

  // Get pricing settings and market content for calculations
  const { data: pricingSettings } = usePricingSettings();

  // Calculate variant pricing directly without hook violations
  const getVariantPrice = (variant: ProductVariant, tier: "inicial" | "mayorista" | "distribuidor") => {
    if (!pricingSettings) return 0;

    // Map tier names to database tier values
    const tierMap = {
      inicial: "tier1",
      mayorista: "tier2", 
      distribuidor: "tier3"
    } as const;

    const dbTier = tierMap[tier];

    // Find the price tier for this variant and tier
    const priceTier = variant.price_tiers?.find(
      (priceTier: any) => priceTier.tier === dbTier
    );

    if (!priceTier) {
      return variant.price || 0;
    }

    // Get the base CNY price
    const cnyPrice = priceTier.unit_price;

    // Apply market-specific conversion and markup
    let finalPrice = cnyPrice;

    switch (market) {
      case "AR":
        const arsExchangeRate = pricingSettings.arRate || 1;
        const arsMarkup = tier === "inicial" ? pricingSettings.arPercents[0] :
                         tier === "mayorista" ? pricingSettings.arPercents[1] :
                         pricingSettings.arPercents[2];
        finalPrice = cnyPrice * arsExchangeRate * (arsMarkup / 100);
        break;
        
      case "CO":
        const copExchangeRate = pricingSettings.coRate || 1;
        const copMarkup = tier === "inicial" ? pricingSettings.coPercents[0] :
                         tier === "mayorista" ? pricingSettings.coPercents[1] :
                         pricingSettings.coPercents[2];
        finalPrice = cnyPrice * copExchangeRate * (copMarkup / 100);
        break;
        
      case "CN":
        const usdExchangeRate = pricingSettings.cnRate || 1;
        const usdMarkup = tier === "inicial" ? pricingSettings.cnPercents[0] :
                         tier === "mayorista" ? pricingSettings.cnPercents[1] :
                         pricingSettings.cnPercents[2];
        finalPrice = cnyPrice * usdExchangeRate * (usdMarkup / 100);
        break;
    }

    return Math.round(finalPrice * 100) / 100; // Round to 2 decimal places
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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[4fr_1fr]">
          {/* Columna izquierda (80%): Galería 40% + Detalles 60% */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-4">
              {/* Galería 40% */}
              <div className="rounded-[28px] bg-card p-3 md:p-4">
                <div className="space-y-3">
                  <div className="relative overflow-hidden rounded-[28px] bg-muted aspect-square">
                    {(() => {
                      const selectedVariant = variants.find(v => v.id === selectedVariantId);
                      const variantImages = selectedVariant?.images || [];
                      const sortedImages = variantImages.sort((a, b) => a.sort_order - b.sort_order);
                      const currentImage = sortedImages[selectedImageIndex];
                      const displayImage = currentImage?.url || product.image;
                      const imageCount = sortedImages.length;

                      return (
                        <>
                          <img
                            src={displayImage}
                            alt={currentImage?.alt || product.name}
                            className="absolute inset-0 h-full w-full object-cover"
                            loading="lazy"
                          />
                          {/* Viral badge */}
                          {product.viral && (
                            <img
                              src="/lovable-uploads/984b614e-1f6b-484a-8b88-5c741374625b.png"
                              alt="Viral ahora"
                              className="absolute left-3 top-3 h-8 w-auto select-none"
                              loading="lazy"
                            />
                          )}
                          {/* Contador y flecha */}
                          <span className="absolute top-3 right-3 rounded-full bg-black/50 text-white text-xs px-2 py-1">
                            {selectedImageIndex + 1} de {imageCount || 1}
                          </span>
                          {imageCount > 1 && (
                            <button 
                              className="absolute right-3 top-1/2 -translate-y-1/2 grid size-10 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60" 
                              aria-label="Siguiente imagen"
                              onClick={() => setSelectedImageIndex((prev) => (prev + 1) % imageCount)}
                            >
                              ›
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  {/* Thumbnails - Real variant images */}
                  <div className="flex items-center gap-3">
                    {(() => {
                      const selectedVariant = variants.find(v => v.id === selectedVariantId);
                      const variantImages = selectedVariant?.images || [];
                      const sortedImages = variantImages.sort((a, b) => a.sort_order - b.sort_order);
                      const displayImages = sortedImages.slice(0, 5);
                      const remainingCount = Math.max(0, sortedImages.length - 5);

                      return displayImages.map((image, i) => (
                        <button
                          key={image.id}
                          className={`relative h-16 w-16 md:h-18 md:w-18 overflow-hidden rounded-xl ring-1 bg-muted ${
                            selectedImageIndex === i ? 'ring-primary ring-2' : 'ring-border'
                          }`}
                          onClick={() => setSelectedImageIndex(i)}
                          aria-label={`Ver imagen ${i + 1} de ${selectedVariant?.name || product.name}`}
                        >
                          <img 
                            src={image.url} 
                            alt={image.alt || `${selectedVariant?.name || product.name} imagen ${i + 1}`} 
                            className="h-full w-full object-cover" 
                            loading="lazy" 
                          />
                          {i === 4 && remainingCount > 0 && (
                            <div className="absolute inset-0 grid place-items-center bg-black/40 text-white text-sm font-medium">
                              +{remainingCount}
                            </div>
                          )}
                        </button>
                      ));
                    })()}
                  </div>
                </div>
              </div>

              {/* Detalles + Tramos 60% */}
              <div className="space-y-4">
                <header>
                  <h1 className="text-2xl md:text-3xl font-semibold leading-tight">{product.name}</h1>
                </header>

                {/* Barra de precios por tiers */}
                <article className="rounded-[28px] bg-card text-card-foreground border overflow-hidden">
                  <div className="px-4 pt-4">
                    <div className="grid grid-cols-3 gap-4 bg-muted rounded-[24px] p-4">
                      {/* Inicial */}
                      <button
                        type="button"
                        onClick={() => setSelectedTier("inicial")}
                        className="text-center"
                        aria-pressed={selectedTier === "inicial"}
                      >
                        <div className="text-lg md:text-xl font-semibold">{content.pricingTiers.inicial.name}</div>
                        <div className={`mt-2 rounded-2xl border px-6 py-5 ${selectedTier === "inicial" ? "border-foreground text-foreground" : "border-border text-muted-foreground"}`}>
                          <div className={`text-3xl font-bold ${selectedTier === "inicial" ? "" : "opacity-60"}`}>{content.currencySymbol}{content.pricingTiers.inicial.price}</div>
                          <div className="text-xs opacity-70">{content.pricingTiers.inicial.range}</div>
                        </div>
                      </button>
                      {/* Mayorista destacado */}
                      <button
                        type="button"
                        onClick={() => setSelectedTier("mayorista")}
                        className="text-center"
                        aria-pressed={selectedTier === "mayorista"}
                      >
                        <div className="text-lg md:text-xl font-semibold">{content.pricingTiers.mayorista.name}</div>
                        <div className={`relative mt-2 rounded-2xl border px-6 py-5 ${selectedTier === "mayorista" ? "border-foreground" : "border-border"}`}>
                          {selectedTier === "mayorista" && (
                            <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-foreground text-background text-xs px-3 py-1">{content.pricingTiers.mayorista.badge}</span>
                          )}
                          <div className="text-3xl font-bold">{content.currencySymbol}{content.pricingTiers.mayorista.price}</div>
                          <div className="text-xs text-muted-foreground">{content.pricingTiers.mayorista.range}</div>
                        </div>
                      </button>
                      {/* Distribuidor */}
                      <button
                        type="button"
                        onClick={() => setSelectedTier("distribuidor")}
                        className="text-center"
                        aria-pressed={selectedTier === "distribuidor"}
                      >
                        <div className="text-lg md:text-xl font-semibold">{content.pricingTiers.distribuidor.name}</div>
                        <div className={`mt-2 rounded-2xl border px-6 py-5 ${selectedTier === "distribuidor" ? "border-foreground text-foreground" : "border-border text-muted-foreground"}`}>
                          <div className={`text-3xl font-bold ${selectedTier === "distribuidor" ? "" : "opacity-60"}`}>{content.currencySymbol}{content.pricingTiers.distribuidor.price}</div>
                          <div className="text-xs opacity-70">{content.pricingTiers.distribuidor.range}</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Faja inferior: tendencia + Trends con flecha */}
                  <MarketSpecificBanners />
                </article>
              </div>
            </div>
          </section>

          {/* Columna derecha (20%): Resumen sticky */}
          <aside className="hidden md:block sticky top-24 self-start h-max rounded-2xl bg-card text-card-foreground border p-4">
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

        {/* Descripción y características */}
        <section className="mt-6 md:mt-8">
          <article className="prose prose-sm md:prose-base max-w-none w-full md:w-4/5">
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
        <section className="mt-8 w-full md:w-4/5">
          <h2 className="text-xl font-semibold mb-3">Variantes</h2>
          <div className="overflow-x-auto rounded-2xl border bg-card">
            <table className="min-w-[960px] w-full text-sm">
              <thead className="bg-secondary/40 text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">{content.tableHeaders.product}</th>
                  <th className="text-left px-4 py-3 font-medium">{content.tableHeaders.units}</th>
                  <th className="text-left px-4 py-3 font-medium">{content.tableHeaders.unitPrice}</th>
                  <th className="px-4 py-3 font-medium">{content.tableHeaders.labeling}</th>
                  <th className="px-4 py-3 font-medium">{content.tableHeaders.barcode}</th>
                  <th className="px-4 py-3 font-medium">{content.tableHeaders.photos}</th>
                  <th className="px-4 py-3 font-medium">{content.tableHeaders.packaging}</th>
                  <th className="text-right px-4 py-3 font-medium">{content.tableHeaders.total}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const variantPrice = getVariantPrice(r.variant, selectedTier);
                  const variantImage = r.variant.images?.[0]?.url || product.image;
                  const variantName = r.variant.name || product.name;
                  const variantOption = r.variant.option_name || r.variant.attributes?.color || "Estándar";
                  
                  return (
                    <tr 
                      key={r.id} 
                      className={`border-t cursor-pointer hover:bg-muted/30 transition-colors ${
                        selectedVariantId === r.id ? 'bg-muted/50' : ''
                      }`}
                      onClick={() => {
                        setSelectedVariantId(r.id);
                        setSelectedImageIndex(0); // Reset image index when changing variants
                      }}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <img src={variantImage} alt={variantName} className="size-12 rounded-md object-cover" loading="lazy" />
                          <div>
                            <div className="font-medium leading-tight">{variantName}</div>
                            <div className="text-xs text-muted-foreground">{variantOption}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="inline-flex items-center rounded-full border">
                          <button className="px-3 py-1" onClick={() => changeQty(r.id, -1)} aria-label="Disminuir">-</button>
                          <span className="px-3 py-1 min-w-8 text-center">{r.qty}</span>
                          <button className="px-3 py-1" onClick={() => changeQty(r.id, 1)} aria-label="Aumentar">+</button>
                        </div>
                      </td>
                      <td className="px-4 py-4">{content.currencySymbol}{variantPrice.toFixed(2)}</td>

                      {/* Etiquetado */}
                      <td className="px-4 py-4 text-center">
                        <button
                          className={`px-3 py-1 rounded-full text-xs border ${r.comps.labeling ? "bg-green-500/15 text-green-700" : "bg-transparent"}`}
                          onClick={() => toggleComp(r.id, "labeling")}
                        >
                          {content.currencySymbol}{perUnitLabeling.toFixed(2)} {content.complementPricing.labelingUnit}
                        </button>
                        <div className="text-[10px] text-muted-foreground mt-1">{r.variant.stock.toLocaleString()} {content.complementPricing.unitsText}</div>
                      </td>

                    {/* Código de barras */}
                    <td className="px-4 py-4 text-center">
                      <button
                        className={`px-3 py-1 rounded-full text-xs border ${r.comps.barcode ? "bg-green-500/15 text-green-700" : "bg-transparent"}`}
                        onClick={() => toggleComp(r.id, "barcode")}
                        >
                          {content.currencySymbol}{fixedBarcode.toFixed(0)}
                      </button>
                    </td>

                    {/* Fotos */}
                    <td className="px-4 py-4 text-center">
                      <button
                        className={`px-3 py-1 rounded-full text-xs border ${r.comps.photos ? "bg-green-500/15 text-green-700" : "bg-transparent"}`}
                        onClick={() => toggleComp(r.id, "photos")}
                        >
                          {content.currencySymbol}{fixedPhotos.toLocaleString()}
                      </button>
                    </td>

                    {/* Empaque */}
                    <td className="px-4 py-4 text-center">
                      <button
                        className={`px-3 py-1 rounded-full text-xs border ${r.comps.packaging ? "bg-green-500/15 text-green-700" : "bg-transparent"}`}
                        onClick={() => toggleComp(r.id, "packaging")}
                        >
                          {content.currencySymbol}{perUnitPackaging.toFixed(2)} {content.complementPricing.packagingUnit}
                      </button>
                    </td>

                      <td className="px-4 py-4 text-right font-medium">{content.currencySymbol}{rowTotal(r).toFixed(2)}</td>
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
        <section className="mt-8 w-full md:w-4/5">
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
        <section className="mt-8 w-full md:w-4/5">
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
