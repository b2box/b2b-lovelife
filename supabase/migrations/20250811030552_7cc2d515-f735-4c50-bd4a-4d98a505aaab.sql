-- Enforce uniqueness for BX Code and PA Code (SKU)
-- Use partial unique indexes to apply only when the value is not NULL

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_bx_code_unique
ON public.products (bx_code)
WHERE bx_code IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_product_variants_sku_unique
ON public.product_variants (sku)
WHERE sku IS NOT NULL;