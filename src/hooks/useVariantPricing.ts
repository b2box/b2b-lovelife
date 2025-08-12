import { useMemo } from "react";
import { useProductMarketContent } from "./useProductMarketContent";
import { ProductVariant, VariantPriceTier } from "./useProductVariants";
import { usePricingSettings } from "./usePricingSettings";

export function useVariantPricing(variant: ProductVariant, selectedTier: "inicial" | "mayorista" | "distribuidor") {
  const { market, content } = useProductMarketContent();
  const { data: pricingSettings } = usePricingSettings();

  const calculatedPrice = useMemo(() => {
    if (!variant || !pricingSettings) return 0;

    // Map tier names to database tier values
    const tierMap = {
      inicial: "tier1",
      mayorista: "tier2", 
      distribuidor: "tier3"
    } as const;

    const dbTier = tierMap[selectedTier];

    // Find the price tier for this variant and tier
    const priceTier = variant.price_tiers?.find(
      (tier: VariantPriceTier) => tier.tier === dbTier
    );

    if (!priceTier) {
      // Fallback to variant base price if no tier found
      return variant.price || 0;
    }

    // Get the base CNY price
    const cnyPrice = priceTier.unit_price;

    // Apply market-specific conversion and markup
    let finalPrice = cnyPrice;

    switch (market) {
      case "AR":
        // Convert CNY to ARS and apply markup
        const arsExchangeRate = pricingSettings.arRate || 1;
        const arsMarkup = selectedTier === "inicial" ? pricingSettings.arPercents[0] :
                         selectedTier === "mayorista" ? pricingSettings.arPercents[1] :
                         pricingSettings.arPercents[2];
        finalPrice = cnyPrice * arsExchangeRate * (arsMarkup / 100);
        break;
        
      case "CO":
        // Convert CNY to COP and apply markup
        const copExchangeRate = pricingSettings.coRate || 1;
        const copMarkup = selectedTier === "inicial" ? pricingSettings.coPercents[0] :
                         selectedTier === "mayorista" ? pricingSettings.coPercents[1] :
                         pricingSettings.coPercents[2];
        finalPrice = cnyPrice * copExchangeRate * (copMarkup / 100);
        break;
        
      case "CN":
        // Convert CNY to USD and apply markup
        const usdExchangeRate = pricingSettings.cnRate || 1;
        const usdMarkup = selectedTier === "inicial" ? pricingSettings.cnPercents[0] :
                         selectedTier === "mayorista" ? pricingSettings.cnPercents[1] :
                         pricingSettings.cnPercents[2];
        finalPrice = cnyPrice * usdExchangeRate * (usdMarkup / 100);
        break;
    }

    return Math.round(finalPrice * 100) / 100; // Round to 2 decimal places
  }, [variant, selectedTier, market, pricingSettings]);

  const minQuantity = useMemo(() => {
    const tierMap = {
      inicial: "tier1",
      mayorista: "tier2", 
      distribuidor: "tier3"
    } as const;

    const dbTier = tierMap[selectedTier];
    const priceTier = variant?.price_tiers?.find(
      (tier: VariantPriceTier) => tier.tier === dbTier
    );

    return priceTier?.min_qty || content.pricingTiers[selectedTier].minQuantity;
  }, [variant, selectedTier, content]);

  return {
    price: calculatedPrice,
    minQuantity,
    currency: content.currency,
    currencySymbol: content.currencySymbol
  };
}