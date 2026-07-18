import { supabase } from '@/lib/supabase/client'
import type { StockStatus } from '@/types'

function statusFor(qty: number, reorderThreshold: number): StockStatus {
  return qty === 0 ? 'Out of Stock' : qty <= reorderThreshold ? 'Low Stock' : 'In Stock'
}

/** Re-derive an inventory row's cached stock_qty/status/expiry/batch summary from its live batches. */
export async function recomputeInventoryFromBatches(inventoryId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: inv, error: invErr } = await (supabase as any)
    .from('inventory')
    .select('reorder_threshold')
    .eq('id', inventoryId)
    .single()
  if (invErr) throw invErr

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: batches, error: batchErr } = await (supabase as any)
    .from('inventory_batches')
    .select('qty, expiry_date, batch_number')
    .eq('inventory_id', inventoryId)
    .gt('qty', 0)
    .order('expiry_date', { ascending: true, nullsFirst: false })
  if (batchErr) throw batchErr

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalQty = (batches ?? []).reduce((s: number, b: any) => s + Number(b.qty), 0)
  const soonest = (batches ?? [])[0] ?? null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateErr } = await (supabase as any)
    .from('inventory')
    .update({
      stock_qty:    totalQty,
      status:       statusFor(totalQty, inv.reorder_threshold ?? 0),
      expiry_date:  soonest?.expiry_date ?? null,
      batch_number: soonest?.batch_number ?? null,
      updated_at:   new Date().toISOString(),
    })
    .eq('id', inventoryId)
  if (updateErr) throw updateErr
}

/** Deduct qty from an item's batches oldest-expiry-first (FEFO), then resync the parent row's cached summary. */
export async function deductFEFO(inventoryId: string, qtyToDeduct: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: batches, error } = await (supabase as any)
    .from('inventory_batches')
    .select('id, qty')
    .eq('inventory_id', inventoryId)
    .gt('qty', 0)
    .order('expiry_date', { ascending: true, nullsFirst: false })
  if (error) throw error

  let remaining = qtyToDeduct
  for (const batch of batches ?? []) {
    if (remaining <= 0) break
    const take = Math.min(remaining, Number(batch.qty))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updErr } = await (supabase as any)
      .from('inventory_batches')
      .update({ qty: Number(batch.qty) - take })
      .eq('id', batch.id)
    if (updErr) throw updErr
    remaining -= take
  }

  await recomputeInventoryFromBatches(inventoryId)
}
