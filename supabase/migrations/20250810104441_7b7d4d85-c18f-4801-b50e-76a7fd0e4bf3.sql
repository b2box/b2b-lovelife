-- Fix: use existing enum type for tier
-- 1) Create variant_price_tiers table using public.price_tier_name
CREATE TABLE IF NOT EXISTS public.variant_price_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_variant_id uuid NOT NULL,
  tier public.price_tier_name NOT NULL,
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