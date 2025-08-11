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
          cnRate: Number(data.cn_cny_to_cny) || 1,
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
        } as PricingSettingsData;
      }
      return defaultPricingSettings;
    },
    staleTime: 60_000,
  });
}
