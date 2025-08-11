-- Add sort_order column to product_variants table
ALTER TABLE public.product_variants 
ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;

-- Update existing variants to have sequential sort_order based on created_at
UPDATE public.product_variants 
SET sort_order = sub.row_num - 1
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY created_at) as row_num 
  FROM public.product_variants
) sub 
WHERE public.product_variants.id = sub.id;

-- Create index for better performance
CREATE INDEX idx_product_variants_sort_order ON public.product_variants(product_id, sort_order);