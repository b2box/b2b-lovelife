-- Drop and recreate the view with explicit SECURITY INVOKER to ensure no SECURITY DEFINER properties
DROP VIEW IF EXISTS public.products_public;

-- Create view with explicit SECURITY INVOKER (this is the default but makes it explicit)
CREATE VIEW public.products_public 
WITH (security_invoker = true) AS 
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

-- Grant appropriate permissions
GRANT SELECT ON public.products_public TO anon;
GRANT SELECT ON public.products_public TO authenticated;

-- Add comment
COMMENT ON VIEW public.products_public IS 'Public view of published products with explicit SECURITY INVOKER to respect user RLS policies.';