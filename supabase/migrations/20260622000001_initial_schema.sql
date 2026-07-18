-- ============================================================
-- Deira Fresh — Initial Schema
-- ============================================================

-- Suppliers
create table public.suppliers (
  id                uuid primary key default gen_random_uuid(),
  business_name     text not null,
  trade_license     text,
  trn               text,
  categories        text[] default '{}',
  products_count    int default 0,
  whatsapp          text,
  email             text,
  warehouse_address text,
  orders_count      int default 0,
  rating            numeric(3,1) default 5.0,
  on_time_rate      numeric(5,2) default 100,
  active            boolean default true,
  created_at        timestamptz default now()
);

-- Restaurants
create table public.restaurants (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  brand_group         text,
  zone                text,
  contact             text,
  whatsapp            text,
  email               text,
  cuisine_type        text,
  preferred_time      text,
  primary_supplier_id uuid references public.suppliers(id) on delete set null,
  active              boolean default true,
  orders_count        int default 0,
  gmv                 numeric(12,2) default 0,
  created_at          timestamptz default now()
);

-- Profiles (extends Supabase auth.users, one row per auth user)
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null check (role in ('admin', 'supplier', 'restaurant')),
  entity_id   uuid,   -- suppliers.id or restaurants.id depending on role
  name        text,
  created_at  timestamptz default now()
);

-- Orders
create table public.orders (
  id              text primary key,           -- e.g. DF-4821
  restaurant_id   uuid references public.restaurants(id) on delete set null,
  restaurant_name text,
  supplier_id     uuid references public.suppliers(id) on delete set null,
  supplier_name   text,
  status          text not null default 'Pending'
                    check (status in ('Pending','Confirmed','Delivered','Cancelled')),
  amount          numeric(12,2) default 0,
  source          text default 'WhatsApp'
                    check (source in ('WhatsApp','Portal')),
  items           jsonb default '[]',         -- [{id,name,qty,unit,confidence}]
  raw_transcript  text,
  message_id      text unique,                -- Meta message_id for idempotency
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Inventory
create table public.inventory (
  id                 uuid primary key default gen_random_uuid(),
  supplier_id        uuid references public.suppliers(id) on delete cascade,
  name               text not null,
  category           text,
  stock_qty          numeric(12,2) default 0,
  unit               text default 'kg',
  reorder_threshold  numeric(12,2) default 0,
  status             text default 'In Stock'
                       check (status in ('In Stock','Low Stock','Out of Stock')),
  updated_at         timestamptz default now()
);

-- WhatsApp message log
create table public.whatsapp_log (
  id               uuid primary key default gen_random_uuid(),
  restaurant_id    uuid references public.restaurants(id) on delete set null,
  restaurant_name  text,
  type             text check (type in ('Voice','Text')),
  transcript       text,
  parsed           boolean default false,
  status           text default 'Pending',
  order_id         text references public.orders(id) on delete set null,
  received_at      timestamptz default now()
);

-- Auto-update orders.updated_at on any change
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

-- Profiles: users see only their own profile
alter table public.profiles enable row level security;

create policy "profiles: own row" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles: own row update" on public.profiles
  for update using (auth.uid() = id);

-- Suppliers: admin full access, supplier sees their own row
alter table public.suppliers enable row level security;

create policy "suppliers: admin all" on public.suppliers
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "suppliers: own row" on public.suppliers
  for select using (
    id = (select entity_id from public.profiles where id = auth.uid())
  );

create policy "suppliers: own row update" on public.suppliers
  for update using (
    id = (select entity_id from public.profiles where id = auth.uid())
  );

-- Restaurants: admin full access, restaurant sees their own row
alter table public.restaurants enable row level security;

create policy "restaurants: admin all" on public.restaurants
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "restaurants: own row" on public.restaurants
  for select using (
    id = (select entity_id from public.profiles where id = auth.uid())
  );

create policy "restaurants: own row update" on public.restaurants
  for update using (
    id = (select entity_id from public.profiles where id = auth.uid())
  );

-- Orders: admin all; supplier sees their orders; restaurant sees their orders
alter table public.orders enable row level security;

create policy "orders: admin all" on public.orders
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "orders: supplier view" on public.orders
  for select using (
    supplier_id = (select entity_id from public.profiles where id = auth.uid())
  );

create policy "orders: supplier update status" on public.orders
  for update using (
    supplier_id = (select entity_id from public.profiles where id = auth.uid())
  );

create policy "orders: restaurant view" on public.orders
  for select using (
    restaurant_id = (select entity_id from public.profiles where id = auth.uid())
  );

create policy "orders: restaurant insert" on public.orders
  for insert with check (
    restaurant_id = (select entity_id from public.profiles where id = auth.uid())
  );

-- Inventory: admin all; supplier manages their own
alter table public.inventory enable row level security;

create policy "inventory: admin all" on public.inventory
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "inventory: supplier all" on public.inventory
  for all using (
    supplier_id = (select entity_id from public.profiles where id = auth.uid())
  );

-- WhatsApp log: admin only (webhook writes via service role, bypasses RLS)
alter table public.whatsapp_log enable row level security;

create policy "whatsapp_log: admin all" on public.whatsapp_log
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- Enable Realtime on hot tables
-- ============================================================
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.inventory;
