import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NumericInput } from "@/components/ui/numeric-input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { usePricingSettings } from "@/hooks/usePricingSettings";
import { ensureMarkets, recomputeMarkets, type Markets } from "@/lib/pricing";

interface VariantPricingEditorProps {
  variantId: string;
  onPricingUpdate?: () => void;
}

type PriceTier = {
  id?: string;
  tier: "inicial" | "mayorista" | "distribuidor";
  min_qty: number;
  unit_price: number;
  currency: string;
};

export const VariantPricingEditor: React.FC<VariantPricingEditorProps> = ({
  variantId,
  onPricingUpdate,
}) => {
  const { toast } = useToast();
  const { data: pricingSettings } = usePricingSettings();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Base pricing in CNY (supplier pricing)
  const [baseTiers, setBaseTiers] = useState([0, 0, 0]); // [inicial, mayorista, distribuidor] in CNY
  
  // Market-specific pricing and percentages
  const [markets, setMarkets] = useState<Markets>({
    AR: [
      { percent: 300, price: 0 },
      { percent: 300, price: 0 },
      { percent: 300, price: 0 }
    ],
    COL: [
      { percent: 200, price: 0 },
      { percent: 200, price: 0 },
      { percent: 200, price: 0 }
    ]
  });

  const tierLabels = ["Inicial", "Mayorista", "Distribuidor"];
  const tierNames: ("inicial" | "mayorista" | "distribuidor")[] = ["inicial", "mayorista", "distribuidor"];

  useEffect(() => {
    loadPricingData();
  }, [variantId]);

  const loadPricingData = async () => {
    setLoading(true);
    try {
      // Load existing variant price tiers
      const { data: tiers } = await supabase
        .from("variant_price_tiers")
        .select("*")
        .eq("product_variant_id", variantId);

      if (tiers && tiers.length > 0) {
        const newBaseTiers = [0, 0, 0];
        const newMarkets = { ...markets };

        tiers.forEach((tier) => {
          const tierIndex = tierNames.indexOf(tier.tier as any);
          if (tierIndex >= 0) {
            if (tier.currency === "CNY") {
              newBaseTiers[tierIndex] = Number(tier.unit_price);
            } else if (tier.currency === "USD") {
              // This is AR market data - extract percent from the price
              if (pricingSettings && newBaseTiers[tierIndex] > 0) {
                newMarkets.AR[tierIndex].price = Number(tier.unit_price);
                // Calculate percent based on base price
                const baseCny = newBaseTiers[tierIndex];
                if (baseCny > 0) {
                  const percent = (((tier.unit_price / (baseCny * pricingSettings.arRate)) - 1) * 100);
                  newMarkets.AR[tierIndex].percent = Number(percent.toFixed(2));
                }
              }
            } else if (tier.currency === "COP") {
              // This is COL market data
              if (pricingSettings && newBaseTiers[tierIndex] > 0) {
                newMarkets.COL[tierIndex].price = Number(tier.unit_price);
                const baseCny = newBaseTiers[tierIndex];
                if (baseCny > 0) {
                  const percent = (((tier.unit_price / (baseCny * pricingSettings.coRate)) - 1) * 100);
                  newMarkets.COL[tierIndex].percent = Number(percent.toFixed(2));
                }
              }
            }
          }
        });

        setBaseTiers(newBaseTiers);
        setMarkets(newMarkets);
      }
    } catch (error) {
      console.error("Error loading pricing data:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información de precios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateBaseTier = (tierIndex: number, value: number) => {
    const newBaseTiers = [...baseTiers];
    newBaseTiers[tierIndex] = value;
    setBaseTiers(newBaseTiers);

    // Recompute market prices when base tiers change
    if (pricingSettings) {
      const newMarkets = recomputeMarkets(markets, newBaseTiers, pricingSettings);
      setMarkets(newMarkets);
    }
  };

  const updateMarketPercent = (market: "AR" | "COL", tierIndex: number, percent: number) => {
    const newMarkets = { ...markets };
    newMarkets[market][tierIndex].percent = percent;
    
    // Recompute price based on new percent
    if (pricingSettings && baseTiers[tierIndex] > 0) {
      const rate = market === "AR" ? pricingSettings.arRate : pricingSettings.coRate;
      const price = baseTiers[tierIndex] * (1 + percent / 100) * rate;
      newMarkets[market][tierIndex].price = Number(price.toFixed(2));
    }
    
    setMarkets(newMarkets);
  };

  const updateMarketPrice = (market: "AR" | "COL", tierIndex: number, price: number) => {
    const newMarkets = { ...markets };
    newMarkets[market][tierIndex].price = price;
    
    // Recompute percent based on new price
    if (pricingSettings && baseTiers[tierIndex] > 0) {
      const rate = market === "AR" ? pricingSettings.arRate : pricingSettings.coRate;
      const baseCny = baseTiers[tierIndex];
      const percent = (((price / (baseCny * rate)) - 1) * 100);
      newMarkets[market][tierIndex].percent = Number(percent.toFixed(2));
    }
    
    setMarkets(newMarkets);
  };

  const savePricing = async () => {
    setSaving(true);
    try {
      // Delete existing pricing data for this variant
      await supabase
        .from("variant_price_tiers")
        .delete()
        .eq("product_variant_id", variantId);

      // Insert new pricing data
      const tiersToInsert: any[] = [];

      // Base tiers in CNY
      baseTiers.forEach((price, index) => {
        if (price > 0) {
          tiersToInsert.push({
            product_variant_id: variantId,
            tier: tierNames[index],
            min_qty: index === 0 ? 1 : index === 1 ? 50 : 100,
            unit_price: price,
            currency: "CNY",
          });
        }
      });

      // Market-specific pricing
      markets.AR.forEach((marketTier, index) => {
        if (marketTier.price > 0) {
          tiersToInsert.push({
            product_variant_id: variantId,
            tier: tierNames[index],
            min_qty: index === 0 ? 1 : index === 1 ? 50 : 100,
            unit_price: marketTier.price,
            currency: "USD",
          });
        }
      });

      markets.COL.forEach((marketTier, index) => {
        if (marketTier.price > 0) {
          tiersToInsert.push({
            product_variant_id: variantId,
            tier: tierNames[index],
            min_qty: index === 0 ? 1 : index === 1 ? 50 : 100,
            unit_price: marketTier.price,
            currency: "COP",
          });
        }
      });

      if (tiersToInsert.length > 0) {
        const { error } = await supabase
          .from("variant_price_tiers")
          .insert(tiersToInsert);

        if (error) throw error;
      }

      toast({
        title: "Guardado",
        description: "Precios guardados correctamente",
      });

      onPricingUpdate?.();
    } catch (error) {
      console.error("Error saving pricing:", error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los precios",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4">Cargando precios...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Base Pricing (Supplier in CNY) */}
      <Card className="p-4">
        <h4 className="font-medium mb-3">Precios Base (CNY) - Supplier</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tierLabels.map((label, index) => (
            <div key={index}>
              <Label>{label}</Label>
              <NumericInput
                value={baseTiers[index]}
                onValueChange={(value) => updateBaseTier(index, value)}
                placeholder="0.00"
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Argentina Market */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <img 
            src="/images/flags/ar.svg" 
            alt="Argentina" 
            className="w-6 h-4 object-cover rounded"
          />
          <h4 className="font-medium">Argentina (USD)</h4>
        </div>
        <div className="space-y-3">
          {tierLabels.map((label, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div>
                <Label className="text-xs">{label}</Label>
              </div>
              <div>
                <Label className="text-xs">% Markup</Label>
                <NumericInput
                  value={markets.AR[index].percent}
                  onValueChange={(value) => updateMarketPercent("AR", index, value)}
                  placeholder="300"
                />
              </div>
              <div>
                <Label className="text-xs">Precio USD</Label>
                <NumericInput
                  value={markets.AR[index].price}
                  onValueChange={(value) => updateMarketPrice("AR", index, value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Colombia Market */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <img 
            src="/images/flags/co.svg" 
            alt="Colombia" 
            className="w-6 h-4 object-cover rounded"
          />
          <h4 className="font-medium">Colombia (COP)</h4>
        </div>
        <div className="space-y-3">
          {tierLabels.map((label, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div>
                <Label className="text-xs">{label}</Label>
              </div>
              <div>
                <Label className="text-xs">% Markup</Label>
                <NumericInput
                  value={markets.COL[index].percent}
                  onValueChange={(value) => updateMarketPercent("COL", index, value)}
                  placeholder="200"
                />
              </div>
              <div>
                <Label className="text-xs">Precio COP</Label>
                <NumericInput
                  value={markets.COL[index].price}
                  onValueChange={(value) => updateMarketPrice("COL", index, value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={savePricing} disabled={saving}>
          {saving ? "Guardando..." : "Guardar Precios"}
        </Button>
      </div>
    </div>
  );
};