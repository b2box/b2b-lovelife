-- Create pricing settings table for exchange rates and default increments
create table if not exists public.pricing_settings (
  id uuid primary key default gen_random_uuid(),
  -- Exchange rates
  ar_cny_to_usd numeric not null default 1,
  co_cny_to_cop numeric not null default 1,
  -- Default percentage increments per tier
  ar_tier1_pct numeric not null default 300,
  ar_tier2_pct numeric not null default 300,
  ar_tier3_pct numeric not null default 300,
  co_tier1_pct numeric not null default 200,
  co_tier2_pct numeric not null default 200,
  co_tier3_pct numeric not null default 200,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS and restrict to admins
alter table public.pricing_settings enable row level security;

create policy if not exists "Admins manage pricing_settings"
  on public.pricing_settings
  for all
  to authenticated
  using (has_role(auth.uid(), 'admin'::app_role))
  with check (has_role(auth.uid(), 'admin'::app_role));

-- Trigger to maintain updated_at
create trigger if not exists pricing_settings_set_updated_at
before update on public.pricing_settings
for each row execute function public.update_updated_at_column();

-- Seed a default row if none exists
insert into public.pricing_settings (ar_cny_to_usd, co_cny_to_cop)
select 1, 1
where not exists (select 1 from public.pricing_settings);
