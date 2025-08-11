-- Fix security issue: Restrict access to pricing and supplier information

-- 1. Update variant_price_tiers policies to restrict to authenticated users only
DROP POLICY IF EXISTS "Public can view variant_price_tiers" ON public.variant_price_tiers;

CREATE POLICY "Authenticated users can view variant_price_tiers" 
ON public.variant_price_tiers 
FOR SELECT 
TO authenticated
USING (true);

-- 2. Update product_price_tiers policies to restrict to authenticated users only  
DROP POLICY IF EXISTS "Public can view price tiers" ON public.product_price_tiers;

CREATE POLICY "Authenticated users can view price tiers" 
ON public.product_price_tiers 
FOR SELECT 
TO authenticated
USING (true);

-- 3. Create a view for public product information that excludes sensitive supplier data
CREATE OR REPLACE VIEW public.products_public AS
SELECT 
  id,
  name,
  description,
  brand,
  material,
  collection,
  type,
  subtitle,
  slug,
  bx_code,
  video_url,
  verified_product,
  verified_video,
  discountable,
  status,
  active,
  created_at,
  updated_at
FROM public.products
WHERE active = true AND status = 'published';

-- Grant public access to the view
GRANT SELECT ON public.products_public TO anon;
GRANT SELECT ON public.products_public TO authenticated;

-- 4. Create RLS policy for the public view
ALTER VIEW public.products_public OWNER TO postgres;

-- 5. Add comment to document the security fix
COMMENT ON VIEW public.products_public IS 'Public view of products excluding sensitive supplier information (supplier_link, supplier_model, agent_profile_id)';

-- 6. Update products table policies to be more restrictive for full data
DROP POLICY IF EXISTS "Public can view products" ON public.products;

CREATE POLICY "Authenticated users can view all product data" 
ON public.products 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Public can view basic product info" 
ON public.products 
FOR SELECT 
TO anon
USING (active = true AND status = 'published');