import { ArrowUpRight, Cog, Hash, Box, Package, Battery, Ruler, Scale, ArrowLeftRight, ArrowUpDown } from "lucide-react";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { usePricingSettings } from "@/hooks/usePricingSettings";
import type { ProductVariant } from "@/hooks/useProductVariants";
import type { VariantRow } from "./OrderSidebar";

interface VariantsTableProps {
  rows: VariantRow[];
  selectedTier: "inicial" | "mayorista" | "distribuidor";
  selectedVariantId: string | null;
  market: string;
  onRowsChange: (rows: VariantRow[]) => void;
  onTierChange: (tier: "inicial" | "mayorista" | "distribuidor") => void;
  onVariantSelect: (variantId: string) => void;
}

const VariantsTable = ({
  rows,
  selectedTier,
  selectedVariantId,
  market,
  onRowsChange,
  onTierChange,
  onVariantSelect
}: VariantsTableProps) => {
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

  const changeQty = (id: string, delta: number) => {
    const updatedRows = rows.map((r) => {
      if (r.id === id) {
        const newQty = Math.max(0, r.qty + delta);
        
        // Auto-update selected tier based on new quantity if this is the selected variant
        if (selectedVariantId === id) {
          const newTier = getTierFromQuantity(r.variant, newQty);
          if (newTier !== selectedTier) {
            onTierChange(newTier);
          }
        }
        
        return { ...r, qty: newQty };
      }
      return r;
    });
    onRowsChange(updatedRows);
  };

  const toggleComp = (id: string, key: keyof VariantRow["comps"]) => {
    const updatedRows = rows.map((r) => 
      r.id === id ? { ...r, comps: { ...r.comps, [key]: !r.comps[key] } } : r
    );
    onRowsChange(updatedRows);
  };

  return (
    <div className="space-y-3">
      {/* Tier selector */}
      <div className="grid grid-cols-3 gap-1 bg-muted p-1 rounded-lg">
        {(["inicial", "mayorista", "distribuidor"] as const).map((tier) => (
          <button
            key={tier}
            onClick={() => onTierChange(tier)}
            className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
              selectedTier === tier
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tier.charAt(0).toUpperCase() + tier.slice(1)}
          </button>
        ))}
      </div>

      {/* Variants */}
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="border rounded-lg p-3 space-y-2">
            {/* Variant header */}
            <div 
              className={`flex items-center justify-between cursor-pointer ${
                selectedVariantId === r.id ? 'ring-2 ring-primary rounded' : ''
              }`}
              onClick={() => onVariantSelect(r.id)}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-muted rounded border flex items-center justify-center">
                  {(r.variant as any)?.product_variant_images?.[0]?.url ? (
                    <img 
                      src={(r.variant as any).product_variant_images[0].url} 
                      alt={r.variant.name}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <Package className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{r.variant.name}</p>
                  <p className="text-xs text-muted-foreground">${getVariantPrice(r.variant, selectedTier).toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Quantity controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => changeQty(r.id, -1)}
                  className="w-6 h-6 rounded border bg-background hover:bg-muted flex items-center justify-center text-sm"
                >
                  -
                </button>
                <input
                  type="number"
                  value={r.qty}
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
                    
                    const validQty = Math.max(minQty, inputValue);
                    const updatedRows = rows.map((row) =>
                      row.id === r.id ? { ...row, qty: validQty } : row
                    );
                    onRowsChange(updatedRows);
                  }}
                  className="w-12 h-6 text-center text-sm border rounded bg-background"
                  min="1"
                />
                <button
                  onClick={() => changeQty(r.id, 1)}
                  className="w-6 h-6 rounded border bg-background hover:bg-muted flex items-center justify-center text-sm"
                >
                  +
                </button>
              </div>
              <span className="text-sm font-medium">${rowTotal(r).toFixed(2)}</span>
            </div>

            {/* Complements */}
            <div className="flex items-center gap-1">
              {[
                { key: "labeling" as const, icon: Hash, tooltip: "Etiquetado marketplace" },
                { key: "barcode" as const, icon: Cog, tooltip: "Registro código de barras" },
                { key: "photos" as const, icon: ArrowUpRight, tooltip: "Fotos comerciales" },
                { key: "packaging" as const, icon: Package, tooltip: "Empaque optimizado" }
              ].map(({ key, icon: Icon, tooltip }) => (
                <HoverCard key={key}>
                  <HoverCardTrigger asChild>
                    <button
                      onClick={() => toggleComp(r.id, key)}
                      className={`w-6 h-6 rounded border flex items-center justify-center ${
                        r.comps[key] ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-40 p-2">
                    <p className="text-xs">{tooltip}</p>
                  </HoverCardContent>
                </HoverCard>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VariantsTable;