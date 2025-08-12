-- Add is_verified column to product_variant_images table
ALTER TABLE public.product_variant_images 
ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT false;

-- Add index for better performance when filtering by verification status
CREATE INDEX idx_product_variant_images_is_verified 
ON public.product_variant_images(product_variant_id, is_verified);