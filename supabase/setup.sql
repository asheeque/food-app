-- ============================================================
-- Deira Fresh — Schema + Seed (idempotent, safe to re-run)
-- ============================================================

-- ── Tables ────────────────────────────────────────────────────

create table if not exists public.suppliers (
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

create table if not exists public.restaurants (
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

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null check (role in ('admin', 'supplier', 'restaurant')),
  entity_id   uuid,
  name        text,
  created_at  timestamptz default now()
);

create table if not exists public.orders (
  id              text primary key,
  restaurant_id   uuid references public.restaurants(id) on delete set null,
  restaurant_name text,
  supplier_id     uuid references public.suppliers(id) on delete set null,
  supplier_name   text,
  status          text not null default 'Pending'
                    check (status in ('Pending','Confirmed','Delivered','Cancelled')),
  amount          numeric(12,2) default 0,
  source          text default 'WhatsApp'
                    check (source in ('WhatsApp','Portal')),
  items           jsonb default '[]',
  raw_transcript  text,
  message_id      text unique,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create table if not exists public.inventory (
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

create table if not exists public.whatsapp_log (
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

-- ── Trigger ───────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ── Row Level Security ────────────────────────────────────────

alter table public.profiles    enable row level security;
alter table public.suppliers   enable row level security;
alter table public.restaurants enable row level security;
alter table public.orders      enable row level security;
alter table public.inventory   enable row level security;
alter table public.whatsapp_log enable row level security;

-- Drop all existing policies so this is idempotent
do $$ declare r record; begin
  for r in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('profiles','suppliers','restaurants','orders','inventory','whatsapp_log')
  loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- Profiles
create policy "profiles: own row"        on public.profiles for select using (auth.uid() = id);
create policy "profiles: own row update" on public.profiles for update using (auth.uid() = id);

-- Suppliers
create policy "suppliers: admin all" on public.suppliers
  for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "suppliers: own row" on public.suppliers
  for select using (id = (select entity_id from public.profiles where id = auth.uid()));
create policy "suppliers: own row update" on public.suppliers
  for update using (id = (select entity_id from public.profiles where id = auth.uid()));

-- Restaurants
create policy "restaurants: admin all" on public.restaurants
  for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "restaurants: own row" on public.restaurants
  for select using (id = (select entity_id from public.profiles where id = auth.uid()));
create policy "restaurants: own row update" on public.restaurants
  for update using (id = (select entity_id from public.profiles where id = auth.uid()));

-- Orders
create policy "orders: admin all" on public.orders
  for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "orders: supplier view" on public.orders
  for select using (supplier_id = (select entity_id from public.profiles where id = auth.uid()));
create policy "orders: supplier update status" on public.orders
  for update using (supplier_id = (select entity_id from public.profiles where id = auth.uid()));
create policy "orders: restaurant view" on public.orders
  for select using (restaurant_id = (select entity_id from public.profiles where id = auth.uid()));
create policy "orders: restaurant insert" on public.orders
  for insert with check (restaurant_id = (select entity_id from public.profiles where id = auth.uid()));

-- Inventory
create policy "inventory: admin all" on public.inventory
  for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "inventory: supplier all" on public.inventory
  for all using (supplier_id = (select entity_id from public.profiles where id = auth.uid()));

-- WhatsApp log (webhook writes via service role, bypasses RLS)
create policy "whatsapp_log: admin all" on public.whatsapp_log
  for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ── Realtime ──────────────────────────────────────────────────

alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.inventory;

-- ── Seed Data ─────────────────────────────────────────────────

insert into public.suppliers (id, business_name, trade_license, trn, categories, products_count, whatsapp, email, warehouse_address, orders_count, rating, on_time_rate, active)
values
  ('11111111-0000-0000-0000-000000000001', 'Al Khaleej Fresh Produce', 'TL-2024-8821', 'TRN-100298765', array['Vegetables','Fruits','Herbs'],         47, '+971501234567', 'orders@alkhaleej.ae',    'Warehouse 12, Al Quoz Industrial 3, Dubai', 142, 4.8, 96.5, true),
  ('11111111-0000-0000-0000-000000000002', 'Emirates Dairy & Poultry', 'TL-2024-3312', 'TRN-200198432', array['Dairy','Eggs','Poultry'],                31, '+971502345678', 'supply@emiratesdairy.ae', 'Unit 4, JAFZA South, Dubai',                 89,  4.6, 93.2, true),
  ('11111111-0000-0000-0000-000000000003', 'Spice Route Trading',      'TL-2024-5577', 'TRN-300456123', array['Spices','Dry Goods','Condiments'],       58, '+971503456789', 'hello@spiceroute.ae',    'Shop 7, Deira Spice Market, Dubai',          67,  4.9, 98.1, true),
  ('11111111-0000-0000-0000-000000000004', 'Blue Ocean Seafood',       'TL-2024-9901', 'TRN-400789012', array['Fish','Shellfish','Frozen Seafood'],     24, '+971504567890', 'orders@blueocean.ae',    'Cold Store 3, Deira Fish Market, Dubai',     54,  4.5, 91.8, true)
on conflict (id) do nothing;

insert into public.restaurants (id, name, brand_group, zone, contact, whatsapp, email, cuisine_type, preferred_time, primary_supplier_id, active, orders_count, gmv)
values
  ('22222222-0000-0000-0000-000000000001', 'Taj Dubai Kitchen', null,                'Downtown / Business Bay', 'Ahmed Hassan',    '+971551234567', 'kitchen@tajdubai.ae',      'Indian',   '6:00 AM – 9:00 AM', '11111111-0000-0000-0000-000000000001', true, 48, 24800),
  ('22222222-0000-0000-0000-000000000002', 'Beirut Garden',     'Levant Group',      'Jumeirah',               'Sara Al Masri',   '+971552345678', 'chef@beirutgarden.ae',     'Lebanese', '5:30 AM – 8:00 AM', '11111111-0000-0000-0000-000000000001', true, 36, 18200),
  ('22222222-0000-0000-0000-000000000003', 'Golden Wok',        'Eastern Bites LLC', 'Deira',                  'Chen Wei',        '+971553456789', 'orders@goldenwok.ae',      'Chinese',  '7:00 AM – 10:00 AM','11111111-0000-0000-0000-000000000002', true, 29, 15600),
  ('22222222-0000-0000-0000-000000000004', 'Casa Napoli',       null,                'Bur Dubai',              'Marco Rossi',     '+971554567890', 'kitchen@casanapoli.ae',    'Italian',  '6:30 AM – 9:30 AM', '11111111-0000-0000-0000-000000000003', true, 22, 12400),
  ('22222222-0000-0000-0000-000000000005', 'The Saffron',       'Luxury Hotels Group','Al Quoz',               'Fatima Al Zaabi', '+971555678901', 'procurement@saffron.ae',   'Emirati',  '5:00 AM – 7:00 AM', '11111111-0000-0000-0000-000000000001', true, 61, 38500)
on conflict (id) do nothing;

insert into public.orders (id, restaurant_id, restaurant_name, supplier_id, supplier_name, status, amount, source, items, created_at, updated_at)
values
  ('DF-4821', '22222222-0000-0000-0000-000000000001', 'Taj Dubai Kitchen', '11111111-0000-0000-0000-000000000001', 'Al Khaleej Fresh Produce', 'Delivered', 1840, 'WhatsApp', '[{"id":"i1","name":"Tomatoes","qty":20,"unit":"kg","confidence":0.97},{"id":"i2","name":"Onions","qty":15,"unit":"kg","confidence":0.95},{"id":"i3","name":"Fresh Coriander","qty":5,"unit":"bunches","confidence":0.88}]', now()-interval'2 days', now()-interval'2 days'),
  ('DF-4822', '22222222-0000-0000-0000-000000000002', 'Beirut Garden',     '11111111-0000-0000-0000-000000000001', 'Al Khaleej Fresh Produce', 'Confirmed', 920,  'WhatsApp', '[{"id":"i4","name":"Parsley","qty":10,"unit":"bunches","confidence":0.91},{"id":"i5","name":"Lemons","qty":8,"unit":"kg","confidence":0.99}]', now()-interval'1 day', now()-interval'1 day'),
  ('DF-4823', '22222222-0000-0000-0000-000000000003', 'Golden Wok',        '11111111-0000-0000-0000-000000000002', 'Emirates Dairy & Poultry', 'Pending',   1250, 'WhatsApp', '[{"id":"i6","name":"Eggs","qty":30,"unit":"boxes","confidence":0.94},{"id":"i7","name":"Chicken Breast","qty":25,"unit":"kg","confidence":0.89}]', now()-interval'3 hours', now()-interval'3 hours'),
  ('DF-4824', '22222222-0000-0000-0000-000000000005', 'The Saffron',       '11111111-0000-0000-0000-000000000001', 'Al Khaleej Fresh Produce', 'Delivered', 3200, 'Portal',   '[{"id":"i8","name":"Saffron","qty":0.5,"unit":"kg","confidence":1},{"id":"i9","name":"Dates","qty":20,"unit":"kg","confidence":1}]', now()-interval'5 days', now()-interval'5 days'),
  ('DF-4825', '22222222-0000-0000-0000-000000000004', 'Casa Napoli',       '11111111-0000-0000-0000-000000000003', 'Spice Route Trading',     'Pending',   580,  'WhatsApp', '[{"id":"i10","name":"Basil","qty":6,"unit":"bunches","confidence":0.82},{"id":"i11","name":"Oregano","qty":2,"unit":"kg","confidence":0.78}]', now()-interval'30 minutes', now()-interval'30 minutes')
on conflict (id) do nothing;

insert into public.inventory (supplier_id, name, category, stock_qty, unit, reorder_threshold, status)
values
  ('11111111-0000-0000-0000-000000000001', 'Tomatoes',        'Vegetables', 450, 'kg',      50, 'In Stock'),
  ('11111111-0000-0000-0000-000000000001', 'Onions',          'Vegetables', 380, 'kg',      50, 'In Stock'),
  ('11111111-0000-0000-0000-000000000001', 'Potatoes',        'Vegetables',  12, 'kg',      30, 'Low Stock'),
  ('11111111-0000-0000-0000-000000000001', 'Fresh Coriander', 'Herbs',       48, 'bunches', 20, 'In Stock'),
  ('11111111-0000-0000-0000-000000000001', 'Parsley',         'Herbs',       32, 'bunches', 20, 'In Stock'),
  ('11111111-0000-0000-0000-000000000001', 'Lemons',          'Fruits',     210, 'kg',      40, 'In Stock'),
  ('11111111-0000-0000-0000-000000000001', 'Mangoes',         'Fruits',       0, 'kg',      20, 'Out of Stock'),
  ('11111111-0000-0000-0000-000000000001', 'Cucumber',        'Vegetables', 165, 'kg',      30, 'In Stock'),
  ('11111111-0000-0000-0000-000000000001', 'Bell Peppers',    'Vegetables',   8, 'kg',      25, 'Low Stock'),
  ('11111111-0000-0000-0000-000000000001', 'Garlic',          'Vegetables',  90, 'kg',      20, 'In Stock');

insert into public.whatsapp_log (restaurant_id, restaurant_name, type, transcript, parsed, status, order_id)
values
  ('22222222-0000-0000-0000-000000000001', 'Taj Dubai Kitchen', 'Voice', '20 kg tomatoes, 15 kg onions, 5 bunches fresh coriander please', true, 'Delivered', 'DF-4821'),
  ('22222222-0000-0000-0000-000000000002', 'Beirut Garden',     'Voice', '10 bunches parsley, 8 kg lemons',                                 true, 'Confirmed', 'DF-4822'),
  ('22222222-0000-0000-0000-000000000003', 'Golden Wok',        'Text',  '30 boxes eggs and 25 kg chicken breast',                          true, 'Pending',   'DF-4823'),
  ('22222222-0000-0000-0000-000000000004', 'Casa Napoli',       'Voice', 'Six bunches basil and two kilo oregano',                          true, 'Pending',   'DF-4825');
