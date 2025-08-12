-- Remove the active column from products table since we only need published/draft status
ALTER TABLE public.products DROP COLUMN IF EXISTS active;

-- Update RLS policies to remove references to active column
DROP POLICY IF EXISTS "Public can view basic product info" ON public.products;

-- Create new policy without active column reference
CREATE POLICY "Public can view basic product info" 
ON public.products 
FOR SELECT 
USING (status = 'published'::product_status);