-- 1) Add explicit columns to product_variants (no JSON usage)
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

-- Optional: ensure updated_at updates automatically
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trg_update_product_variants_updated_at'
  ) THEN
    CREATE TRIGGER trg_update_product_variants_updated_at
    BEFORE UPDATE ON public.product_variants
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 2) Create variant_price_tiers table
CREATE TABLE IF NOT EXISTS public.variant_price_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_variant_id uuid NOT NULL,
  tier public.tier NOT NULL,
  min_qty integer NOT NULL DEFAULT 1,
  currency text NOT NULL DEFAULT 'USD',
  unit_price numeric NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_vpt_variant FOREIGN KEY (product_variant_id) REFERENCES public.product_variants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_variant_price_tiers_variant ON public.variant_price_tiers(product_variant_id);

ALTER TABLE public.variant_price_tiers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='variant_price_tiers' AND policyname='Admins manage variant_price_tiers'
  ) THEN
    CREATE POLICY "Admins manage variant_price_tiers"
    ON public.variant_price_tiers
    FOR ALL
    USING (public.has_role(auth.uid(), 'admin'::public.app_role))
    WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='variant_price_tiers' AND policyname='Public can view variant_price_tiers'
  ) THEN
    CREATE POLICY "Public can view variant_price_tiers"
    ON public.variant_price_tiers
    FOR SELECT
    USING (true);
  END IF;
END $$;

-- 3) Create product_variant_images table
CREATE TABLE IF NOT EXISTS public.product_variant_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_variant_id uuid NOT NULL,
  url text NOT NULL,
  alt text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_pvi_variant FOREIGN KEY (product_variant_id) REFERENCES public.product_variants(id) ON DELETE CASCADE
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

-- 4) Ensure public bucket exists for variant images (reuse existing 'product-images')
-- Note: bucket already listed as existing; keep idempotent insert guarded
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'product-images') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
  END IF;
END $$;