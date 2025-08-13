-- Fix critical security vulnerability in addresses table
-- The admin policy was incorrectly set to 'public' role instead of 'authenticated'

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Admins manage addresses" ON public.addresses;

-- Recreate the admin policy with correct role restriction
CREATE POLICY "Admins manage addresses" ON public.addresses
FOR ALL
TO authenticated  -- Changed from 'public' to 'authenticated'
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Verify the user policy is also correctly restricted (it already is)
-- This policy allows authenticated users to manage only their own addresses
-- DROP POLICY IF EXISTS "Users manage own addresses" ON public.addresses;
-- CREATE POLICY "Users manage own addresses" ON public.addresses
-- FOR ALL 
-- TO authenticated
-- USING (user_id = auth.uid())
-- WITH CHECK (user_id = auth.uid());