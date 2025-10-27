import { useQuery } from "@tanstack/react-query";
import { fetchShopifyProducts, fetchProductByHandle } from "@/lib/shopify/api";

export function useShopifyProducts() {
  return useQuery({
    queryKey: ["shopify-products"],
    queryFn: () => fetchShopifyProducts(50),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useShopifyProduct(handle: string) {
  return useQuery({
    queryKey: ["shopify-product", handle],
    queryFn: () => fetchProductByHandle(handle),
    enabled: !!handle,
    staleTime: 5 * 60 * 1000,
  });
}
