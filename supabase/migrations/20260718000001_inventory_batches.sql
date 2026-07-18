-- ============================================================
-- Inventory batches — per-lot stock tracking (FEFO)
-- ============================================================
-- inventory.stock_qty / expiry_date / batch_number remain as a cached
-- summary (total qty, soonest-expiring batch) for fast list rendering.
-- The batches themselves — each with their own qty/expiry/cost/lot# —
-- live here so restocking never overwrites an earlier batch's data.

create table public.inventory_batches (
  id            uuid primary key default gen_random_uuid(),
  inventory_id  uuid not null references public.inventory(id) on delete cascade,
  supplier_id   uuid not null references public.suppliers(id) on delete cascade,
  qty           numeric(12,2) not null default 0,
  unit_cost     numeric(12,2),
  expiry_date   date,
  batch_number  text,
  received_at   timestamptz default now(),
  created_at    timestamptz default now()
);

create index inventory_batches_inventory_id_idx on public.inventory_batches(inventory_id);

alter table public.inventory_batches enable row level security;

create policy "inventory_batches: admin all" on public.inventory_batches
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "inventory_batches: supplier all" on public.inventory_batches
  for all using (
    supplier_id = (select entity_id from public.profiles where id = auth.uid())
  );

-- Backfill: one batch per existing inventory row so current stock isn't lost
insert into public.inventory_batches (inventory_id, supplier_id, qty, unit_cost, expiry_date, batch_number, received_at)
select id, supplier_id, stock_qty, unit_cost, expiry_date, batch_number, coalesce(updated_at, now())
from public.inventory
where stock_qty > 0;
