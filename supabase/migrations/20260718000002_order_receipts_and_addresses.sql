-- ============================================================
-- Order receipts (tax + delivery address) and saved restaurant addresses
-- ============================================================

-- Orders: snapshot tax and the chosen delivery address at creation time,
-- so a receipt stays accurate even if the restaurant's address list changes later.
alter table public.orders add column tax_amount numeric(12,2) default 0;
alter table public.orders add column delivery_address text;

-- Restaurants pick from a saved list of addresses at checkout, like a real app.
create table public.restaurant_addresses (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  label         text not null,
  address_line  text not null,
  is_default    boolean default false,
  created_at    timestamptz default now()
);

create index restaurant_addresses_restaurant_id_idx on public.restaurant_addresses(restaurant_id);

alter table public.restaurant_addresses enable row level security;

create policy "restaurant_addresses: admin all" on public.restaurant_addresses
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "restaurant_addresses: restaurant all" on public.restaurant_addresses
  for all using (
    restaurant_id = (select entity_id from public.profiles where id = auth.uid())
  );
