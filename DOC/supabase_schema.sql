-- Core schema for NeuroBuy multivendor e-commerce
-- Tables: users (extension of auth), stores, products, orders, logistics, shipments, payments

create table if not exists public.stores (
	id uuid primary key default gen_random_uuid(),
	vendor_id uuid not null references auth.users(id) on delete cascade,
	store_name text not null,
	description text,
	created_at timestamp with time zone default now()
);

create table if not exists public.products (
	id uuid primary key default gen_random_uuid(),
	vendor_id uuid references auth.users(id) on delete set null,
	name text not null,
	description text,
	price bigint not null,
	currency text not null default 'XAF',
	category text,
	image_url text,
	stock integer,
	status text not null default 'active',
	created_at timestamp with time zone default now()
);

create table if not exists public.logistics (
	id uuid primary key default gen_random_uuid(),
	company_name text not null,
	contact text,
	region text,
	created_at timestamp with time zone default now()
);

create table if not exists public.orders (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users(id) on delete cascade,
	store_id uuid references public.stores(id) on delete set null,
	status text not null default 'pending',
	total_price bigint not null,
	currency text not null default 'XAF',
	created_at timestamp with time zone default now()
);

create table if not exists public.shipments (
	id uuid primary key default gen_random_uuid(),
	order_id uuid not null references public.orders(id) on delete cascade,
	logistics_id uuid references public.logistics(id) on delete set null,
	current_status text not null default 'processing',
	updated_at timestamp with time zone default now()
);

create table if not exists public.payments (
	id uuid primary key default gen_random_uuid(),
	order_id uuid not null references public.orders(id) on delete cascade,
	payment_method text not null,
	payment_status text not null default 'pending',
	timestamp timestamp with time zone default now()
);

create table if not exists public.order_items (
	id uuid primary key default gen_random_uuid(),
	order_id uuid not null references public.orders(id) on delete cascade,
	product_id uuid not null references public.products(id) on delete restrict,
	name text not null,
	quantity integer not null,
	unit_price bigint not null,
	currency text not null default 'XAF'
);

-- RLS placeholders (enable and define policies per role)
alter table public.products enable row level security;
alter table public.stores enable row level security;
alter table public.orders enable row level security;
alter table public.shipments enable row level security;
alter table public.payments enable row level security;
alter table public.order_items enable row level security;

-- Example policies (adjust before production)
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'products' and policyname = 'products_read_all'
  ) then
    create policy products_read_all on public.products for select using (true);
  end if;
end $$;
