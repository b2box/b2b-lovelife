import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { defaultPricingSettings, type PricingSettingsData } from "@/lib/pricing";

export function usePricingSettings() {
  return useQuery<PricingSettingsData>({
    queryKey: ["pricing_settings"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("pricing_settings")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        return {
          arRate: Number(data.ar_cny_to_usd) || 1,
          coRate: Number(data.co_cny_to_cop) || 1,
          cnRate: Number(data.cn_cny_to_usd) || 1,
          arPercents: [
            Number(data.ar_tier1_pct) || 300,
            Number(data.ar_tier2_pct) || 300,
            Number(data.ar_tier3_pct) || 300,
          ],
          coPercents: [
            Number(data.co_tier1_pct) || 200,
            Number(data.co_tier2_pct) || 200,
            Number(data.co_tier3_pct) || 200,
          ],
          cnPercents: [
            Number(data.cn_tier1_pct) || 100,
            Number(data.cn_tier2_pct) || 100,
            Number(data.cn_tier3_pct) || 100,
          ],
          marketplace_labeling_pct: Number(data.marketplace_labeling_pct) || 2,
          barcode_registration_usd: Number(data.barcode_registration_usd) || 1,
          commercial_photos_usd: Number(data.commercial_photos_usd) || 45,
          optimized_packaging_pct: Number(data.optimized_packaging_pct) || 5,
        } as PricingSettingsData;
      }
      return defaultPricingSettings;
    },
    staleTime: 60_000,
  });
}
