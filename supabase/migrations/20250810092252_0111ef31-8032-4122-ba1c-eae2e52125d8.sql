-- Enable required extension
create extension if not exists pgcrypto;

-- Utility: auto-update updated_at
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Roles enum and role assignment
create type public.app_role as enum ('admin','user');

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- SECURITY DEFINER function to check roles
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = _user_id and ur.role = _role
  );
$$;

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy if not exists "Users can view own profile"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

create policy if not exists "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid());

-- Trigger to keep updated_at fresh
create or replace trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

-- Auto-insert profile on new auth user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', ''), new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Product schema
create type public.order_status as enum ('pending','paid','fulfilled','cancelled','refunded');
create type public.cart_status as enum ('active','abandoned','converted');
create type public.address_type as enum ('shipping','billing');
create type public.price_tier_name as enum ('inicial','mayorista','distribuidor');

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  name text not null,
  description text,
  brand text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

-- Public can see products
create policy if not exists "Public can view products"
  on public.products
  for select
  using (true);

-- Admins manage products
create policy if not exists "Admins manage products"
  on public.products
  for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create or replace trigger trg_products_updated_at
before update on public.products
for each row execute function public.update_updated_at_column();

-- Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy if not exists "Public can view categories"
  on public.categories
  for select using (true);

create policy if not exists "Admins manage categories"
  on public.categories
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create or replace trigger trg_categories_updated_at
before update on public.categories
for each row execute function public.update_updated_at_column();

-- Product-category relation
create table if not exists public.product_categories (
  product_id uuid not null references public.products(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (product_id, category_id)
);

alter table public.product_categories enable row level security;
create policy if not exists "Public can view product_categories"
  on public.product_categories for select using (true);
create policy if not exists "Admins manage product_categories"
  on public.product_categories for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Product images
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  alt text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.product_images enable row level security;
create policy if not exists "Public can view product_images"
  on public.product_images for select using (true);
create policy if not exists "Admins manage product_images"
  on public.product_images for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Product variants
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text unique,
  name text,
  attributes jsonb not null default '{}', -- e.g. {"color":"Rojo","talla":"M"}
  price numeric(10,2),
  currency text not null default 'USD',
  stock int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.product_variants enable row level security;
create policy if not exists "Public can view product_variants"
  on public.product_variants for select using (true);
create policy if not exists "Admins manage product_variants"
  on public.product_variants for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create or replace trigger trg_product_variants_updated_at
before update on public.product_variants
for each row execute function public.update_updated_at_column();

-- Price tiers per product
create table if not exists public.product_price_tiers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  tier public.price_tier_name not null,
  min_qty int not null default 1,
  unit_price numeric(10,2) not null,
  currency text not null default 'USD',
  unique (product_id, tier)
);

alter table public.product_price_tiers enable row level security;
create policy if not exists "Public can view price tiers"
  on public.product_price_tiers for select using (true);
create policy if not exists "Admins manage price tiers"
  on public.product_price_tiers for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Addresses
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type public.address_type not null,
  full_name text,
  phone text,
  line1 text not null,
  line2 text,
  city text not null,
  state text,
  postal_code text,
  country text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.addresses enable row level security;
create policy if not exists "Users manage own addresses"
  on public.addresses for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create or replace trigger trg_addresses_updated_at
before update on public.addresses
for each row execute function public.update_updated_at_column();

-- Carts
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status public.cart_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.carts enable row level security;
create policy if not exists "Users manage own carts"
  on public.carts for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy if not exists "Admins view all carts"
  on public.carts for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create or replace trigger trg_carts_updated_at
before update on public.carts
for each row execute function public.update_updated_at_column();

-- Cart items
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_variant_id uuid not null references public.product_variants(id),
  quantity int not null check (quantity > 0),
  unit_price numeric(10,2) not null,
  currency text not null default 'USD',
  created_at timestamptz not null default now(),
  unique (cart_id, product_variant_id)
);

alter table public.cart_items enable row level security;

create policy if not exists "Users manage items of own carts"
  on public.cart_items for all to authenticated
  using (cart_id in (select id from public.carts where user_id = auth.uid()))
  with check (cart_id in (select id from public.carts where user_id = auth.uid()));

create policy if not exists "Admins view all cart_items"
  on public.cart_items for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status public.order_status not null default 'pending',
  subtotal numeric(10,2) not null default 0,
  shipping_cost numeric(10,2) not null default 0,
  tax numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  shipping_address_id uuid references public.addresses(id),
  billing_address_id uuid references public.addresses(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;
create policy if not exists "Users manage own orders"
  on public.orders for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy if not exists "Admins view all orders"
  on public.orders for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create or replace trigger trg_orders_updated_at
before update on public.orders
for each row execute function public.update_updated_at_column();

-- Order items
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_variant_id uuid not null references public.product_variants(id),
  quantity int not null check (quantity > 0),
  unit_price numeric(10,2) not null,
  currency text not null default 'USD',
  created_at timestamptz not null default now(),
  unique (order_id, product_variant_id)
);

alter table public.order_items enable row level security;
create policy if not exists "Users view their order items"
  on public.order_items for select to authenticated
  using (order_id in (select id from public.orders where user_id = auth.uid()));

create policy if not exists "Admins view all order items"
  on public.order_items for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for product images
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Storage policies
create policy "Public can read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Admins can manage product images"
  on storage.objects for all to authenticated
  using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'))
  with check (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));

-- Helpful indexes
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_categories_slug on public.categories(slug);
create index if not exists idx_product_variants_product on public.product_variants(product_id);
create index if not exists idx_product_images_product on public.product_images(product_id);
create index if not exists idx_price_tiers_product on public.product_price_tiers(product_id);
create index if not exists idx_cart_items_cart on public.cart_items(cart_id);
create index if not exists idx_order_items_order on public.order_items(order_id);
