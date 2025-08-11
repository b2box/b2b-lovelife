-- Fix security issue: Restrict pricing_settings access to admin users only
-- Drop any existing policies first
DROP POLICY IF EXISTS "Admins manage pricing_settings" ON public.pricing_settings;
DROP POLICY IF EXISTS "Public can view pricing_settings" ON public.pricing_settings;

-- Create strict admin-only policies
CREATE POLICY "Admin only select pricing_settings" 
ON public.pricing_settings 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin only insert pricing_settings" 
ON public.pricing_settings 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin only update pricing_settings" 
ON public.pricing_settings 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin only delete pricing_settings" 
ON public.pricing_settings 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Ensure RLS is enabled
ALTER TABLE public.pricing_settings ENABLE ROW LEVEL SECURITY;