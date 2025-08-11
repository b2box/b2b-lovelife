import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ProductData {
  id: string;
  name: string;
  description?: string;
  brand?: string;
  subtitle?: string;
  slug?: string;
  active: boolean;
  status: 'draft' | 'published';
  video_url?: string;
  verified_product: boolean;
  verified_video: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id?: string;
  url: string;
  alt?: string;
  sort_order: number;
}

export interface ProductVariant {
  id: string;
  product_id?: string;
  name?: string;
  sku?: string;
  active: boolean;
  stock: number;
  sort_order: number;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  weight_kg?: number;
  is_clothing: boolean;
  has_battery: boolean;
  created_at: string;
  updated_at: string;
  product_variant_images?: ProductImage[];
}

export interface ProductCategory {
  id: string;
  name: string;
  slug?: string;
}

export interface VariantPriceTier {
  id: string;
  product_variant_id: string;
  tier: 'inicial' | 'mayorista' | 'distribuidor';
  min_qty: number;
  unit_price: number;
  currency: string;
}

export interface CompleteProduct extends ProductData {
  images: ProductImage[];
  variants: ProductVariant[];
  categories: ProductCategory[];
  variant_price_tiers: VariantPriceTier[];
}

export const useProducts = () => {
  const [products, setProducts] = useState<CompleteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch published products with their related data
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          product_images(id, url, alt, sort_order),
          product_variants!inner(
            id, name, sku, active, stock, sort_order, 
            length_cm, width_cm, height_cm, weight_kg,
            is_clothing, has_battery, created_at, updated_at,
            product_variant_images(id, url, alt, sort_order)
          ),
          product_categories!inner(
            categories(id, name, slug)
          )
        `)
        .eq('active', true)
        .eq('status', 'published')
        .eq('product_variants.active', true)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // Fetch price tiers for all variants
      const variantIds = productsData?.flatMap(p => p.product_variants?.map(v => v.id)) || [];
      
      let priceTiersData: VariantPriceTier[] = [];
      if (variantIds.length > 0) {
        const { data: tiers, error: tiersError } = await supabase
          .from('variant_price_tiers')
          .select('*')
          .in('product_variant_id', variantIds);

        if (tiersError) throw tiersError;
        priceTiersData = tiers || [];
      }

      // Transform data to match our interface
      const transformedProducts: CompleteProduct[] = productsData?.map(product => ({
        ...product,
        images: product.product_images || [],
        variants: product.product_variants || [],
        categories: product.product_categories?.map(pc => pc.categories).filter(Boolean) || [],
        variant_price_tiers: priceTiersData.filter(tier => 
          product.product_variants?.some(v => v.id === tier.product_variant_id)
        )
      })) || [];

      setProducts(transformedProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts
  };
};

export const useProduct = (id: string) => {
  const [product, setProduct] = useState<CompleteProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: productData, error: productError } = await supabase
        .from('products')
        .select(`
          *,
          product_images(id, url, alt, sort_order),
          product_variants(
            id, name, sku, active, stock, sort_order, 
            length_cm, width_cm, height_cm, weight_kg,
            is_clothing, has_battery, created_at, updated_at
          ),
          product_categories(
            categories(id, name, slug)
          )
        `)
        .eq('id', id)
        .eq('active', true)
        .eq('status', 'published')
        .single();

      if (productError) throw productError;

      // Fetch price tiers for variants
      const variantIds = productData?.product_variants?.map(v => v.id) || [];
      
      let priceTiersData: VariantPriceTier[] = [];
      if (variantIds.length > 0) {
        const { data: tiers, error: tiersError } = await supabase
          .from('variant_price_tiers')
          .select('*')
          .in('product_variant_id', variantIds);

        if (tiersError) throw tiersError;
        priceTiersData = tiers || [];
      }

      const transformedProduct: CompleteProduct = {
        ...productData,
        images: productData.product_images || [],
        variants: productData.product_variants || [],
        categories: productData.product_categories?.map(pc => pc.categories).filter(Boolean) || [],
        variant_price_tiers: priceTiersData
      };

      setProduct(transformedProduct);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err instanceof Error ? err.message : 'Producto no encontrado');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  return {
    product,
    loading,
    error,
    refetch: fetchProduct
  };
};

export const useProductsByCategory = (categoryName?: string) => {
  const [products, setProducts] = useState<CompleteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductsByCategory = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('products')
        .select(`
          *,
          product_images(id, url, alt, sort_order),
          product_variants!inner(
            id, name, sku, active, stock, sort_order, 
            length_cm, width_cm, height_cm, weight_kg,
            is_clothing, has_battery, created_at, updated_at
          ),
          product_categories!inner(
            categories!inner(id, name, slug)
          )
        `)
        .eq('active', true)
        .eq('status', 'published')
        .eq('product_variants.active', true);

      // Filter by category if provided
      if (categoryName) {
        query = query.eq('product_categories.categories.name', categoryName);
      }

      const { data: productsData, error: productsError } = await query
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // Fetch price tiers for all variants
      const variantIds = productsData?.flatMap(p => p.product_variants?.map(v => v.id)) || [];
      
      let priceTiersData: VariantPriceTier[] = [];
      if (variantIds.length > 0) {
        const { data: tiers, error: tiersError } = await supabase
          .from('variant_price_tiers')
          .select('*')
          .in('product_variant_id', variantIds);

        if (tiersError) throw tiersError;
        priceTiersData = tiers || [];
      }

      // Transform data
      const transformedProducts: CompleteProduct[] = productsData?.map(product => ({
        ...product,
        images: product.product_images || [],
        variants: product.product_variants || [],
        categories: product.product_categories?.map(pc => pc.categories).filter(Boolean) || [],
        variant_price_tiers: priceTiersData.filter(tier => 
          product.product_variants?.some(v => v.id === tier.product_variant_id)
        )
      })) || [];

      setProducts(transformedProducts);
    } catch (err) {
      console.error('Error fetching products by category:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsByCategory();
  }, [categoryName]);

  return {
    products,
    loading,
    error,
    refetch: fetchProductsByCategory
  };
};