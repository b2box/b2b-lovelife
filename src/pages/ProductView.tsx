import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { categories } from "@/components/landing/data";
import type { Product } from "@/components/landing/ProductCard";
import { ArrowUpRight } from "lucide-react";

const findProductById = (id?: string): Product | undefined => {
  if (!id) return undefined;
  for (const key of Object.keys(categories)) {
    const found = categories[key].find((p) => p.id === id);
    if (found) return found;
  }
  return undefined;
};

const ProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = useMemo(() => findProductById(id), [id]);

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

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto py-8">
          <p className="text-muted-foreground">Producto no encontrado.</p>
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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Galería */}
          <section className="md:col-span-1 lg:col-span-2 rounded-2xl bg-card shadow-elevate p-3 md:p-4">
            <div className="relative overflow-hidden rounded-xl bg-muted aspect-[4/3] md:aspect-[5/4]">
              <img
                src={product.image}
                alt={product.name}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
              {/* Badge viral placeholder si existe */}
              {product.viral && (
                <img
                  src="/lovable-uploads/984b614e-1f6b-484a-8b88-5c741374625b.png"
                  alt="Viral ahora"
                  className="absolute left-3 top-3 h-8 w-auto select-none"
                  loading="lazy"
                />
              )}
            </div>
          </section>

          {/* Panel derecho: Título + barra de precios */}
          <section className="md:col-span-1 space-y-4">
            <header>
              <h1 className="text-2xl md:text-3xl font-semibold leading-tight">{product.name}</h1>
            </header>

            {/* Barra de precios por tiers (placeholder 1:1 estructura) */}
            <article className="rounded-2xl bg-card text-card-foreground border shadow-elevate overflow-hidden">
              <div className="grid grid-cols-3">
                {/* Inicial */}
                <div className="p-4 md:p-5 text-center">
                  <div className="text-muted-foreground text-sm">Inicial</div>
                  <div className="text-2xl font-bold">$35</div>
                  <div className="text-xs text-muted-foreground mt-1">50 - 499 unidades</div>
                </div>
                {/* Mayorista destacado */}
                <div className="relative p-4 md:p-5 text-center bg-primary/5">
                  <div className="absolute inset-x-4 -top-3 mx-auto w-max rounded-full bg-primary text-primary-foreground text-xs px-3 py-1 shadow-elevate">
                    Recomendado
                  </div>
                  <div className="text-muted-foreground text-sm mt-2">Mayorista</div>
                  <div className="text-2xl font-bold">$300</div>
                  <div className="text-xs text-muted-foreground mt-1">500 - 1250 unidades</div>
                </div>
                {/* Distribuidor */}
                <div className="p-4 md:p-5 text-center opacity-70">
                  <div className="text-muted-foreground text-sm">Distribuidor</div>
                  <div className="text-2xl font-bold">$725</div>
                  <div className="text-xs text-muted-foreground mt-1">+1250 unidades</div>
                </div>
              </div>

              {/* Faja inferior: tendencia + Trends con flecha */}
              <div className="flex items-center justify-between gap-3 bg-secondary/40 px-4 py-3">
                <div className="text-sm">
                  <span className="text-muted-foreground">Producto en tendencia en</span>{" "}
                  <strong className="text-foreground">Mercado Libre</strong>
                </div>
                <button
                  className="inline-flex items-center gap-2 rounded-full border border-white/60 px-3 py-2 text-sm hover:bg-white/10"
                  aria-label="Ver más en Trends"
                >
                  <span>Ver más en Trends</span>
                  <span className="grid size-8 place-items-center rounded-full border border-white/70 text-white/90 hover:bg-white/10">
                    <ArrowUpRight />
                  </span>
                </button>
              </div>
            </article>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductView;
