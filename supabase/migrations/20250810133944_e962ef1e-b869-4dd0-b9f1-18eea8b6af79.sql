-- Secure addresses table: enable RLS, drop any public read policy, add admin policy

-- 1) Ensure Row Level Security is enabled
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- 2) Remove any potential public read policies (defensive, only if present)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'addresses' AND policyname = 'Public can view addresses'
  ) THEN
    DROP POLICY "Public can view addresses" ON public.addresses;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'addresses' AND policyname = 'Public can select addresses'
  ) THEN
    DROP POLICY "Public can select addresses" ON public.addresses;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'addresses' AND policyname = 'Public read addresses'
  ) THEN
    DROP POLICY "Public read addresses" ON public.addresses;
  END IF;
END $$;

-- 3) Ensure admins can manage all addresses (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'addresses' AND policyname = 'Admins manage addresses'
  ) THEN
    CREATE POLICY "Admins manage addresses"
    ON public.addresses
    FOR ALL
    USING (has_role(auth.uid(), 'admin'::app_role))
    WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;

-- Note: The existing policy "Users manage own addresses" remains active to allow
-- users to fully manage only their own rows via (user_id = auth.uid()).