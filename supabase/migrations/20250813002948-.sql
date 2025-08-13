-- Add new fields to pricing_settings table for marketplace services
ALTER TABLE public.pricing_settings
ADD COLUMN marketplace_labeling_pct numeric NOT NULL DEFAULT 2,
ADD COLUMN barcode_registration_usd numeric NOT NULL DEFAULT 1,
ADD COLUMN commercial_photos_usd numeric NOT NULL DEFAULT 45,
ADD COLUMN optimized_packaging_pct numeric NOT NULL DEFAULT 5;