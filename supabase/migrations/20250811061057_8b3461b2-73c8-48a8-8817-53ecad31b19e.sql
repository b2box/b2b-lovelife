-- Add China market support to pricing settings
ALTER TABLE public.pricing_settings 
ADD COLUMN cn_cny_to_cny numeric NOT NULL DEFAULT 1,
ADD COLUMN cn_tier1_pct numeric NOT NULL DEFAULT 100,
ADD COLUMN cn_tier2_pct numeric NOT NULL DEFAULT 100, 
ADD COLUMN cn_tier3_pct numeric NOT NULL DEFAULT 100;