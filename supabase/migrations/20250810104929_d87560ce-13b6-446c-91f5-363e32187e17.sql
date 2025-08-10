-- Add explicit columns to product_variants (idempotent)
ALTER TABLE public.product_variants
  ADD COLUMN IF NOT EXISTS option_name text,
  ADD COLUMN IF NOT EXISTS length_cm numeric,
  ADD COLUMN IF NOT EXISTS width_cm numeric,
  ADD COLUMN IF NOT EXISTS height_cm numeric,
  ADD COLUMN IF NOT EXISTS weight_kg numeric,
  ADD COLUMN IF NOT EXISTS box_length_cm numeric,
  ADD COLUMN IF NOT EXISTS box_width_cm numeric,
  ADD COLUMN IF NOT EXISTS box_height_cm numeric,
  ADD COLUMN IF NOT EXISTS box_weight_kg numeric,
  ADD COLUMN IF NOT EXISTS pcs_per_carton integer,
  ADD COLUMN IF NOT EXISTS cbm_per_carton numeric,
  ADD COLUMN IF NOT EXISTS has_battery boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_clothing boolean NOT NULL DEFAULT false;

-- Ensure updated_at trigger exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_product_variants_updated_at'
  ) THEN
    CREATE TRIGGER trg_update_product_variants_updated_at
    BEFORE UPDATE ON public.product_variants
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Create product_variant_images table
CREATE TABLE IF NOT EXISTS public.product_variant_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_variant_id uuid NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_variant_images_variant ON public.product_variant_images(product_variant_id);

ALTER TABLE public.product_variant_images ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='product_variant_images' AND policyname='Admins manage product_variant_images'
  ) THEN
    CREATE POLICY "Admins manage product_variant_images"
    ON public.product_variant_images
    FOR ALL
    USING (public.has_role(auth.uid(), 'admin'::public.app_role))
    WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='product_variant_images' AND policyname='Public can view product_variant_images'
  ) THEN
    CREATE POLICY "Public can view product_variant_images"
    ON public.product_variant_images
    FOR SELECT
    USING (true);
  END IF;
END $$;

-- Ensure bucket for images exists and is public
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'product-images') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
  END IF;
END $$;