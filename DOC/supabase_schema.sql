-- Core schema for NeuroBuy multivendor e-commerce
-- Tables: users (extension of auth), stores, products, orders, logistics, shipments, payments

-- Users table for Clerk authentication (independent from auth.users)
create table if not exists public.users (
	id uuid primary key default gen_random_uuid(),
	name text,
	email text unique not null,
	image text,
	cart jsonb default '{}',
	role text default 'CUSTOMER',
	created_at timestamp with time zone default now()
);

-- Stores table for vendors
create table if not exists public.stores (
	id uuid primary key default gen_random_uuid(),
	vendor_id uuid not null references public.users(id) on delete cascade,
	store_name text not null,
	username text unique,
	description text,
	email text,
	contact text,
	address text,
	image_url text,
	status text default 'pending',
	created_at timestamp with time zone default now()
);

-- Products table
create table if not exists public.products (
	id uuid primary key default gen_random_uuid(),
	vendor_id uuid references public.users(id) on delete set null,
	name text not null,
	description text,
	price bigint not null,
	mrp bigint,
	currency text not null default 'XAF',
	category text,
	image_url text,
	stock integer,
	status text not null default 'active',
	created_at timestamp with time zone default now()
);

-- Addresses table for users
create table if not exists public.addresses (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references public.users(id) on delete cascade,
	name text not null,
	email text not null,
	street text not null,
	city text not null,
	state text not null,
	zip text not null,
	country text not null,
	phone text not null,
	created_at timestamp with time zone default now()
);

-- Orders table
create table if not exists public.orders (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references public.users(id) on delete cascade,
	store_id uuid references public.stores(id) on delete set null,
	status text not null default 'pending',
	total_price bigint not null,
	currency text not null default 'XAF',
	created_at timestamp with time zone default now()
);

-- Order items table
create table if not exists public.order_items (
	id uuid primary key default gen_random_uuid(),
	order_id uuid not null references public.orders(id) on delete cascade,
	product_id uuid not null references public.products(id) on delete restrict,
	name text not null,
	quantity integer not null,
	unit_price bigint not null,
	currency text not null default 'XAF'
);

-- Ratings table
create table if not exists public.ratings (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references public.users(id) on delete cascade,
	product_id uuid not null references public.products(id) on delete cascade,
	rating integer not null check (rating >= 1 and rating <= 5),
	comment text,
	created_at timestamp with time zone default now(),
	unique(user_id, product_id)
);

-- Logistics table
create table if not exists public.logistics (
	id uuid primary key default gen_random_uuid(),
	company_name text not null,
	contact text,
	region text,
	created_at timestamp with time zone default now()
);

-- Shipments table
create table if not exists public.shipments (
	id uuid primary key default gen_random_uuid(),
	order_id uuid not null references public.orders(id) on delete cascade,
	logistics_id uuid references public.logistics(id) on delete set null,
	current_status text not null default 'processing',
	updated_at timestamp with time zone default now()
);

-- Payments table
create table if not exists public.payments (
	id uuid primary key default gen_random_uuid(),
	order_id uuid not null references public.orders(id) on delete cascade,
	amount bigint not null,
	currency text not null default 'XAF',
	status text not null default 'pending',
	method text,
	created_at timestamp with time zone default now()
);

-- Coupons table
create table if not exists public.coupons (
	code text primary key,
	description text,
	discount decimal not null,
	for_new_user boolean default false,
	for_member boolean default false,
	is_public boolean default false,
	expires_at timestamp with time zone not null,
	created_at timestamp with time zone default now()
);

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.stores enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.shipments enable row level security;
alter table public.payments enable row level security;
alter table public.coupons enable row level security;
alter table public.ratings enable row level security;
alter table public.logistics enable row level security;

-- Users table policies - disabled for Clerk authentication
-- Policies are managed by Clerk, not Supabase auth
-- create policy "Users can view own data" on public.users 
--   for select using (auth.uid() = id);

-- Products table policies
create policy "Products are viewable by everyone" on public.products 
  for select using (true);

-- Note: Vendor product management policies disabled for Clerk
-- create policy "Vendors can manage own products" on public.products 
--   for all using (auth.uid() = vendor_id);

-- Stores table policies
create policy "Stores are viewable by everyone" on public.stores 
  for select using (true);

-- Note: Vendor store management policies disabled for Clerk
-- create policy "Vendors can manage own stores" on public.stores 
--   for all using (auth.uid() = vendor_id);

-- Addresses table policies - disabled for Clerk
-- create policy "Users can manage own addresses" on public.addresses 
--   for all using (auth.uid() = user_id);

-- Orders table policies - disabled for Clerk
-- create policy "Users can view own orders" on public.orders 
--   for select using (auth.uid() = user_id);

-- create policy "Vendors can view orders for their stores" on public.orders 
--   for select using (
--     exists (
--       select 1 from public.stores 
--       where stores.id = orders.store_id 
--       and stores.vendor_id = auth.uid()
--     )
--   );

-- create policy "Users can create orders" on public.orders 
--   for insert with check (auth.uid() = user_id);

-- Order items table policies - disabled for Clerk
-- create policy "Order items follow order permissions" on public.order_items 
--   for select using (
--     exists (
--       select 1 from public.orders 
--       where orders.id = order_items.order_id 
--       and orders.user_id = auth.uid()
--     )
--   );

-- Payments table policies - disabled for Clerk
-- create policy "Payments follow order permissions" on public.payments 
--   for all using (
--     exists (
--       select 1 from public.orders 
--       where orders.id = payments.order_id 
--       and orders.user_id = auth.uid()
--     )
--   );

-- Shipments table policies - disabled for Clerk
-- create policy "Shipments follow order permissions" on public.shipments 
--   for all using (
--     exists (
--       select 1 from public.orders 
--       where orders.id = shipments.order_id 
--       and orders.user_id = auth.uid()
--     )
--   );

-- Coupons table policies
create policy "Coupons are viewable by everyone" on public.coupons 
  for select using (true);

-- Ratings table policies
create policy "Ratings are viewable by everyone" on public.ratings 
  for select using (true);

-- Note: User rating management policies disabled for Clerk
-- create policy "Users can manage own ratings" on public.ratings 
--   for all using (auth.uid() = user_id);

-- Logistics table policies
create policy "Logistics providers are viewable by everyone" on public.logistics 
  for select using (true);

-- Create indexes for better performance
create index if not exists idx_users_email on public.users(email);
create index if not exists idx_stores_vendor_id on public.stores(vendor_id);
create index if not exists idx_products_vendor_id on public.products(vendor_id);
create index if not exists idx_addresses_user_id on public.addresses(user_id);
create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_items_product_id on public.order_items(product_id);
create index if not exists idx_ratings_user_id on public.ratings(user_id);
create index if not exists idx_ratings_product_id on public.ratings(product_id);

-- Note: Trigger for auth.users removed since we're using Clerk
-- User creation is handled by the API route /api/user/sync
