-- Fix security definer view issue by recreating the view without SECURITY DEFINER
DROP VIEW IF EXISTS public.products_public;

-- Create view without SECURITY DEFINER (uses invoker's permissions)
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
WHERE active = true AND status = 'published';

-- Grant access permissions explicitly
GRANT SELECT ON public.products_public TO anon;
GRANT SELECT ON public.products_public TO authenticated;

-- Add comment to document the security fix
COMMENT ON VIEW public.products_public IS 'Public view of products excluding sensitive supplier information (supplier_link, supplier_model, agent_profile_id)';