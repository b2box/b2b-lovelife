-- Remove the active column from product_variants table
-- All variants will be considered active by default, controlled only by product status

ALTER TABLE public.product_variants DROP COLUMN IF EXISTS active;