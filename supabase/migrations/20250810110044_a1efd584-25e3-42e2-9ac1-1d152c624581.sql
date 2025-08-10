-- 1) Create enum for product status
DO $$ BEGIN
  CREATE TYPE public.product_status AS ENUM ('draft','published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Alter products to add explicit fields
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS status public.product_status NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS subtitle text,
  ADD COLUMN IF NOT EXISTS bx_code text,
  ADD COLUMN IF NOT EXISTS material text,
  ADD COLUMN IF NOT EXISTS discountable boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS agent_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS supplier_link text,
  ADD COLUMN IF NOT EXISTS supplier_model text,
  ADD COLUMN IF NOT EXISTS type text,
  ADD COLUMN IF NOT EXISTS collection text;

-- 3) Tags and product_tags join
CREATE TABLE IF NOT EXISTS public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_tags (
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (product_id, tag_id)
);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_tags ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Admins manage tags' AND tablename='tags') THEN
    CREATE POLICY "Admins manage tags" ON public.tags FOR ALL USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Public can view tags' AND tablename='tags') THEN
    CREATE POLICY "Public can view tags" ON public.tags FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Admins manage product_tags' AND tablename='product_tags') THEN
    CREATE POLICY "Admins manage product_tags" ON public.product_tags FOR ALL USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Public can view product_tags' AND tablename='product_tags') THEN
    CREATE POLICY "Public can view product_tags" ON public.product_tags FOR SELECT USING (true);
  END IF;
END $$;

-- 4) Product translations
CREATE TABLE IF NOT EXISTS public.product_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  country_code text NOT NULL,
  title text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, country_code)
);

ALTER TABLE public.product_translations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Admins manage product_translations' AND tablename='product_translations') THEN
    CREATE POLICY "Admins manage product_translations" ON public.product_translations FOR ALL USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Public can view product_translations' AND tablename='product_translations') THEN
    CREATE POLICY "Public can view product_translations" ON public.product_translations FOR SELECT USING (true);
  END IF;
END $$;

-- Trigger to update updated_at on product_translations
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_product_translations_updated_at') THEN
    CREATE TRIGGER trg_update_product_translations_updated_at
    BEFORE UPDATE ON public.product_translations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;