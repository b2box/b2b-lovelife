import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { categories } from "@/components/landing/data";
import type { Product } from "@/components/landing/ProductCard";
import { ArrowUpRight, Truck, Pencil, BadgeDollarSign, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  type VariantRow = {
    id: string;
    name: string;
    color: string;
    unitPrice: number;
    stock: number;
    qty: number;
    comps: { labeling: boolean; barcode: boolean; photos: boolean; packaging: boolean };
  };

  const initialVariants: VariantRow[] = [
    { id: "var-rosa", name: product?.name || "", color: "Rosa Estándar", unitPrice: 5, stock: 4000, qty: 0, comps: { labeling: false, barcode: false, photos: false, packaging: false } },
    { id: "var-gris", name: product?.name || "", color: "Gris Estándar", unitPrice: 5, stock: 4000, qty: 0, comps: { labeling: false, barcode: false, photos: false, packaging: false } },
    { id: "var-lila", name: product?.name || "", color: "Lila Estándar", unitPrice: 5, stock: 4000, qty: 0, comps: { labeling: false, barcode: false, photos: false, packaging: false } },
    { id: "var-crema", name: product?.name || "", color: "Crema Estándar", unitPrice: 5, stock: 4000, qty: 0, comps: { labeling: false, barcode: false, photos: false, packaging: false } },
    { id: "var-azul", name: product?.name || "", color: "Azul Estándar", unitPrice: 5, stock: 4000, qty: 0, comps: { labeling: false, barcode: false, photos: false, packaging: false } },
  ];

  const [rows, setRows] = useState<VariantRow[]>(initialVariants);

  const perUnitLabeling = 0.15;
  const perUnitPackaging = 0.04;
  const fixedBarcode = 40;
  const fixedPhotos = 1863;
  const minOrder = 100;

  const rowTotal = (r: VariantRow) => {
    const base = r.qty * r.unitPrice;
    const comps =
      (r.comps.labeling ? r.qty * perUnitLabeling : 0) +
      (r.comps.packaging ? r.qty * perUnitPackaging : 0) +
      (r.comps.barcode ? fixedBarcode : 0) +
      (r.comps.photos ? fixedPhotos : 0);
    return base + comps;
  };

  const totals = rows.reduce(
    (acc, r) => {
      const base = r.qty * r.unitPrice;
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
      toast({ title: "Orden mínima $100", description: "Agrega más productos para continuar." });
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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[4fr_1fr]">
          {/* Columna izquierda (80%): Galería 40% + Detalles 60% */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-4">
              {/* Galería 40% */}
              <div className="rounded-[28px] bg-card shadow-elevate p-3 md:p-4">
                <div className="space-y-3">
                  <div className="relative overflow-hidden rounded-[28px] bg-muted aspect-[5/4]">
                    <img
                      src={product.image}
                      alt={product.name}
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
                    <span className="absolute top-3 right-3 rounded-full bg-black/50 text-white text-xs px-2 py-1">1 de 9</span>
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 grid size-10 place-items-center rounded-full bg-black/40 text-white hover:bg-black/60" aria-label="Siguiente imagen">›</button>
                  </div>

                  {/* Thumbnails */}
                  <div className="flex items-center gap-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="relative h-16 w-16 md:h-18 md:w-18 overflow-hidden rounded-xl ring-1 ring-border bg-muted">
                        <img src={product.image} alt={`${product.name} miniatura ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
                        {i === 4 && (
                          <div className="absolute inset-0 grid place-items-center bg-black/40 text-white text-sm font-medium">+4</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Detalles + Tramos 60% */}
              <div className="space-y-4">
                <header>
                  <h1 className="text-2xl md:text-3xl font-semibold leading-tight">{product.name}</h1>
                </header>

                {/* Barra de precios por tiers */}
                <article className="rounded-[28px] bg-card text-card-foreground border shadow-elevate overflow-hidden">
                  <div className="px-4 pt-4">
                    <div className="grid grid-cols-3 gap-2 bg-muted rounded-full p-1">
                      {/* Inicial */}
                      <div className="rounded-[18px] px-4 py-4 text-center text-muted-foreground">
                        <div className="text-sm">Inicial</div>
                        <div className="text-2xl font-bold opacity-60">$35</div>
                        <div className="text-xs opacity-70">50 - 499 unidades</div>
                      </div>
                      {/* Mayorista destacado */}
                      <div className="relative rounded-[18px] bg-background px-4 py-4 text-center shadow-sm">
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-foreground text-background text-xs px-3 py-1 shadow-elevate">Recomendado</span>
                        <div className="text-muted-foreground text-sm mt-1">Mayorista</div>
                        <div className="text-3xl font-bold">$300</div>
                        <div className="text-xs text-muted-foreground">500 - 1250 unidades</div>
                      </div>
                      {/* Distribuidor */}
                      <div className="rounded-[18px] px-4 py-4 text-center text-muted-foreground">
                        <div className="text-sm">Distribuidor</div>
                        <div className="text-2xl font-bold opacity-60">$725</div>
                        <div className="text-xs opacity-70">+1250 unidades</div>
                      </div>
                    </div>
                  </div>

                  {/* Faja inferior: tendencia + Trends con flecha */}
                  <div className="flex items-center justify-between gap-3 px-4 py-3 bg-yellow-300/90">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span>Producto en tendencia en</span>
                      <span className="rounded bg-yellow-200 px-2 py-0.5">mercado libre</span>
                    </div>
                    <button className="inline-flex items-center gap-2 text-sm font-medium" aria-label="Ver más en Trends">
                      <span>Ver más en</span>
                      <span className="rounded bg-orange-200 px-2 py-0.5">TRENDS</span>
                      <span className="grid size-8 place-items-center rounded-full border border-black/30 text-black/70 bg-white/70 hover:bg-white">
                        <ArrowUpRight />
                      </span>
                    </button>
                  </div>
                </article>
              </div>
            </div>
          </section>

          {/* Columna derecha (20%): Resumen sticky */}
          <aside className="hidden md:block sticky top-24 self-start h-max rounded-2xl bg-card text-card-foreground border shadow-elevate p-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Orden mínima $100</span>
              <CheckCircle2 className="opacity-60" />
            </div>

            <button
              onClick={addToCart}
              className="mt-4 w-full rounded-xl bg-green-500 text-white py-3 font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              aria-label="Añadir al carrito"
              disabled={totals.total < minOrder}
            >
              Añadir al carrito
            </button>

            <div className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between"><span>Productos ({totals.items})</span><span>${totals.products.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Complementos</span><span>${totals.complements.toFixed(2)}</span></div>
              <div className="flex justify-between font-semibold text-base pt-1 border-t"><span>Total</span><span>${totals.total.toFixed(2)}</span></div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
              <div className="rounded-lg border p-2 flex items-center gap-2"><Truck className="h-4 w-4" /> Método de envío</div>
              <div className="rounded-lg border p-2 flex items-center gap-2"><Pencil className="h-4 w-4" /> Personalizar</div>
              <div className="rounded-lg border p-2 flex items-center gap-2"><BadgeDollarSign className="h-4 w-4" /> Precios claros</div>
            </div>
          </aside>
        </div>

        {/* Descripción y características */}
        <section className="mt-6 md:mt-8">
          <article className="prose prose-sm md:prose-base max-w-none">
            <p>
              ¡Aprovecha cada rincón con la Estantería de Dos Niveles para Almacenamiento que lo transforma todo! Diseño práctico de dos niveles con estructura ventilada y colores vibrantes que revitalizan tu espacio. ¡Perfecto para baño o tocador!
            </p>
            <h3>Características destacadas:</h3>
            <ul>
              <li>Dos niveles versátiles: almacena más en menos espacio.</li>
              <li>Estructura ventilada: mantiene tus artículos frescos y secos.</li>
              <li>Colores vibrantes: disponibles en tonos que alegran tu ambiente.</li>
              <li>Resistencia sólida: sostiene tus objetos con seguridad.</li>
              <li>Material premium brillante: plástico resistente con acabados modernos.</li>
            </ul>
          </article>
        </section>

        {/* Variantes */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-3">Variantes</h2>
          <div className="overflow-x-auto rounded-2xl border bg-card">
            <table className="min-w-[960px] w-full text-sm">
              <thead className="bg-secondary/40 text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Producto</th>
                  <th className="text-left px-4 py-3 font-medium">Unidades</th>
                  <th className="text-left px-4 py-3 font-medium">Precio Unitario</th>
                  <th className="px-4 py-3 font-medium">Etiquetado por Marketplaces</th>
                  <th className="px-4 py-3 font-medium">Registro de Código de Barras</th>
                  <th className="px-4 py-3 font-medium">Fotografías Comerciales</th>
                  <th className="px-4 py-3 font-medium">Empaque</th>
                  <th className="text-right px-4 py-3 font-medium">Precio Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <img src={product.image} alt={r.name} className="size-12 rounded-md object-cover" loading="lazy" />
                        <div>
                          <div className="font-medium leading-tight">{r.name}</div>
                          <div className="text-xs text-muted-foreground">{r.color}</div>
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
                    <td className="px-4 py-4">${r.unitPrice.toFixed(2)}</td>

                    {/* Etiquetado */}
                    <td className="px-4 py-4 text-center">
                      <button
                        className={`px-3 py-1 rounded-full text-xs border ${r.comps.labeling ? "bg-green-500/15 text-green-700" : "bg-transparent"}`}
                        onClick={() => toggleComp(r.id, "labeling")}
                      >
                        ${perUnitLabeling.toFixed(2)} /U
                      </button>
                      <div className="text-[10px] text-muted-foreground mt-1">{r.stock.toLocaleString()} unidades</div>
                    </td>

                    {/* Código de barras */}
                    <td className="px-4 py-4 text-center">
                      <button
                        className={`px-3 py-1 rounded-full text-xs border ${r.comps.barcode ? "bg-green-500/15 text-green-700" : "bg-transparent"}`}
                        onClick={() => toggleComp(r.id, "barcode")}
                      >
                        ${fixedBarcode.toFixed(0)}
                      </button>
                    </td>

                    {/* Fotos */}
                    <td className="px-4 py-4 text-center">
                      <button
                        className={`px-3 py-1 rounded-full text-xs border ${r.comps.photos ? "bg-green-500/15 text-green-700" : "bg-transparent"}`}
                        onClick={() => toggleComp(r.id, "photos")}
                      >
                        ${fixedPhotos.toLocaleString()}
                      </button>
                    </td>

                    {/* Empaque */}
                    <td className="px-4 py-4 text-center">
                      <button
                        className={`px-3 py-1 rounded-full text-xs border ${r.comps.packaging ? "bg-green-500/15 text-green-700" : "bg-transparent"}`}
                        onClick={() => toggleComp(r.id, "packaging")}
                      >
                        ${perUnitPackaging.toFixed(2)} /U
                      </button>
                    </td>

                    <td className="px-4 py-4 text-right font-medium">${rowTotal(r).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ProductView;
