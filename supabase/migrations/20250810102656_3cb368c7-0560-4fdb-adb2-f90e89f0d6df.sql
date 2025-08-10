
-- 1) Enums
do $$
begin
  if not exists (select 1 from pg_type where typname = 'discount_type') then
    create type public.discount_type as enum ('percentage', 'fixed');
  end if;
  if not exists (select 1 from pg_type where typname = 'inventory_reason') then
    create type public.inventory_reason as enum ('adjustment','purchase','sale','return');
  end if;
end $$;

-- 2) Promotions
create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  type public.discount_type not null,
  value numeric not null check (value >= 0),
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.promotions enable row level security;

-- Public can view promotions (needed to display promos on storefront)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'promotions' and policyname = 'Public can view promotions'
  ) then
    create policy "Public can view promotions"
      on public.promotions
      for select
      using (true);
  end if;
end $$;

-- Admins manage promotions
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'promotions' and policyname = 'Admins manage promotions'
  ) then
    create policy "Admins manage promotions"
      on public.promotions
      for all
      using (has_role(auth.uid(), 'admin'))
      with check (has_role(auth.uid(), 'admin'));
  end if;
end $$;

-- Validate time windows with a trigger (avoid time-based CHECK)
create or replace function public.validate_promotion_time()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.starts_at is not null and new.ends_at is not null and new.ends_at <= new.starts_at then
    raise exception 'ends_at must be after starts_at';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_promotions_validate on public.promotions;
create trigger trg_promotions_validate
before insert or update on public.promotions
for each row execute function public.validate_promotion_time();

-- Keep updated_at fresh
drop trigger if exists trg_promotions_updated_at on public.promotions;
create trigger trg_promotions_updated_at
before update on public.promotions
for each row execute function public.update_updated_at_column();

-- Link tables for promotions
create table if not exists public.promotion_products (
  promotion_id uuid not null references public.promotions(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  primary key (promotion_id, product_id)
);

alter table public.promotion_products enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='promotion_products' and policyname='Public can view promotion_products'
  ) then
    create policy "Public can view promotion_products"
      on public.promotion_products
      for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='promotion_products' and policyname='Admins manage promotion_products'
  ) then
    create policy "Admins manage promotion_products"
      on public.promotion_products
      for all
      using (has_role(auth.uid(), 'admin'))
      with check (has_role(auth.uid(), 'admin'));
  end if;
end $$;

create index if not exists idx_promotion_products_product on public.promotion_products(product_id);

create table if not exists public.promotion_categories (
  promotion_id uuid not null references public.promotions(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (promotion_id, category_id)
);

alter table public.promotion_categories enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='promotion_categories' and policyname='Public can view promotion_categories'
  ) then
    create policy "Public can view promotion_categories"
      on public.promotion_categories
      for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='promotion_categories' and policyname='Admins manage promotion_categories'
  ) then
    create policy "Admins manage promotion_categories"
      on public.promotion_categories
      for all
      using (has_role(auth.uid(), 'admin'))
      with check (has_role(auth.uid(), 'admin'));
  end if;
end $$;

create index if not exists idx_promotion_categories_category on public.promotion_categories(category_id);

-- 3) Inventory movements with stock-sync triggers
create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_variant_id uuid not null references public.product_variants(id) on delete cascade,
  quantity integer not null,
  reason public.inventory_reason not null default 'adjustment',
  note text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_inventory_movements_variant on public.inventory_movements(product_variant_id);

alter table public.inventory_movements enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='inventory_movements' and policyname='Admins manage inventory movements'
  ) then
    create policy "Admins manage inventory movements"
      on public.inventory_movements
      for all
      using (has_role(auth.uid(), 'admin'))
      with check (has_role(auth.uid(), 'admin'));
  end if;
end $$;

-- Trigger to keep product_variants.stock in sync
create or replace function public.apply_inventory_movement()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.product_variants
      set stock = coalesce(stock, 0) + new.quantity,
          updated_at = now()
    where id = new.product_variant_id;
    return new;
  elsif tg_op = 'UPDATE' then
    update public.product_variants
      set stock = coalesce(stock, 0) + (new.quantity - old.quantity),
          updated_at = now()
    where id = new.product_variant_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.product_variants
      set stock = coalesce(stock, 0) - old.quantity,
          updated_at = now()
    where id = old.product_variant_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_inventory_movements_ins on public.inventory_movements;
create trigger trg_inventory_movements_ins
after insert on public.inventory_movements
for each row execute function public.apply_inventory_movement();

drop trigger if exists trg_inventory_movements_upd on public.inventory_movements;
create trigger trg_inventory_movements_upd
after update on public.inventory_movements
for each row execute function public.apply_inventory_movement();

drop trigger if exists trg_inventory_movements_del on public.inventory_movements;
create trigger trg_inventory_movements_del
after delete on public.inventory_movements
for each row execute function public.apply_inventory_movement();

-- 4) Customer price tiers (per-customer assignment)
create table if not exists public.customer_price_tiers (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  tier public.price_tier_name not null,
  created_at timestamptz not null default now()
);

alter table public.customer_price_tiers enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='customer_price_tiers' and policyname='Admin manage customer price tiers'
  ) then
    create policy "Admin manage customer price tiers"
      on public.customer_price_tiers
      for all
      using (has_role(auth.uid(), 'admin'))
      with check (has_role(auth.uid(), 'admin'));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='customer_price_tiers' and policyname='Users view own price tier'
  ) then
    create policy "Users view own price tier"
      on public.customer_price_tiers
      for select
      using (profile_id = auth.uid());
  end if;
end $$;

-- 5) Expand admin privileges on existing tables
-- Profiles
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='profiles' and policyname='Admins manage profiles'
  ) then
    create policy "Admins manage profiles"
      on public.profiles
      for all
      using (has_role(auth.uid(), 'admin'))
      with check (has_role(auth.uid(), 'admin'));
  end if;
end $$;

-- Orders
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='orders' and policyname='Admins manage orders'
  ) then
    create policy "Admins manage orders"
      on public.orders
      for all
      using (has_role(auth.uid(), 'admin'))
      with check (has_role(auth.uid(), 'admin'));
  end if;
end $$;

-- Order items
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='order_items' and policyname='Admins manage order_items'
  ) then
    create policy "Admins manage order_items"
      on public.order_items
      for all
      using (has_role(auth.uid(), 'admin'))
      with check (has_role(auth.uid(), 'admin'));
  end if;
end $$;
