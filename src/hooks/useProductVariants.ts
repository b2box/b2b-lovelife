import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string | null;
  option_name: string | null;
  sku: string | null;
  stock: number;
  price: number | null;
  currency: string;
  attributes: any;
  weight_kg: number | null;
  length_cm: number | null;
  width_cm: number | null;
  height_cm: number | null;
  box_length_cm: number | null;
  box_width_cm: number | null;
  box_height_cm: number | null;
  box_weight_kg: number | null;
  pcs_per_carton: number | null;
  cbm_per_carton: number | null;
  has_battery: boolean;
  is_clothing: boolean;
  has_individual_packaging: boolean;
  individual_packaging_required: boolean;
  individual_packaging_price_cny: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  images?: ProductVariantImage[];
  price_tiers?: VariantPriceTier[];
}

export interface ProductVariantImage {
  id: string;
  product_variant_id: string;
  url: string;
  alt: string | null;
  sort_order: number;
  is_verified: boolean;
  created_at: string;
}

export interface VariantPriceTier {
  id: string;
  product_variant_id: string;
  tier: "tier1" | "tier2" | "tier3";
  currency: string;
  unit_price: number;
  min_qty: number;
  created_at: string;
}

export function useProductVariants(productId: string | undefined) {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setVariants([]);
      setLoading(false);
      return;
    }

    const fetchVariants = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch product variants with their images and price tiers
        const { data: variantsData, error: variantsError } = await supabase
          .from("product_variants")
          .select(`
            *,
            product_variant_images (*),
            variant_price_tiers (*)
          `)
          .eq("product_id", productId)
          .order("sort_order", { ascending: true });

        if (variantsError) {
          throw variantsError;
        }

        console.log("Fetched variants for product:", productId, variantsData);
        setVariants(variantsData || []);
      } catch (err) {
        console.error("Error fetching product variants:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchVariants();
  }, [productId]);

  return {
    variants,
    loading,
    error,
    refetch: () => {
      if (productId) {
        const fetchVariants = async () => {
          try {
            setLoading(true);
            const { data: variantsData, error: variantsError } = await supabase
              .from("product_variants")
              .select(`
                *,
                product_variant_images (*),
                variant_price_tiers (*)
              `)
              .eq("product_id", productId)
              .order("sort_order", { ascending: true });

            if (variantsError) throw variantsError;
            setVariants(variantsData || []);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
          } finally {
            setLoading(false);
          }
        };
        fetchVariants();
      }
    }
  };
}