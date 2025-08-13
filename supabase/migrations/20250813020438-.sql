-- Drop the existing products_public view that may have security definer properties
DROP VIEW IF EXISTS public.products_public;

-- Recreate the view without security definer (uses invoker rights by default)
-- This view will respect the RLS policies of the querying user, not the view creator
CREATE VIEW public.products_public AS 
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
WHERE active = true AND status = 'published'::product_status;

-- Grant appropriate permissions to the view
-- Allow public access since this is meant for public product data
GRANT SELECT ON public.products_public TO anon;
GRANT SELECT ON public.products_public TO authenticated;

-- Add a comment explaining the security design
COMMENT ON VIEW public.products_public IS 'Public view of published products. Uses invoker rights (not SECURITY DEFINER) to respect user RLS policies.';