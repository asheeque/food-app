'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { authedFetch } from '@/lib/utils'
import { mapInventoryItem, mapInventoryBatch } from '@/lib/supabase/mappers'
import { recomputeInventoryFromBatches } from '@/lib/supabase/batches'
import type { StockStatus } from '@/types'

export function useInventoryBatches(inventoryId?: string) {
  const query = useQuery({
    queryKey: ['inventory-batches', inventoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_batches')
        .select('*')
        .eq('inventory_id', inventoryId as string)
        .gt('qty', 0)
        .order('expiry_date', { ascending: true, nullsFirst: false })
      if (error) throw error
      return (data ?? []).map(mapInventoryBatch)
    },
    enabled: !!inventoryId,
  })
  return { ...query, data: query.data ?? [] }
}

export function useInventory(supplierId?: string) {
  const query = useQuery({
    queryKey: ['inventory', { supplierId }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (supplierId) params.set('supplier_id', supplierId)
      const res = await authedFetch(`/api/inventory?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch inventory')
      const data = (await res.json()) as object[]
      return (data ?? []).map(mapInventoryItem)
    },
  })
  return { ...query, data: query.data ?? [] }
}

export function useInventoryStats(supplierId?: string) {
  const { data } = useInventory(supplierId)
  const byStatus = data.reduce<Record<StockStatus, number>>(
    (acc, i) => ({ ...acc, [i.status]: (acc[i.status] ?? 0) + 1 }),
    {} as Record<StockStatus, number>
  )
  return {
    total: data.length,
    inStock: byStatus['In Stock'] ?? 0,
    lowStock: byStatus['Low Stock'] ?? 0,
    outOfStock: byStatus['Out of Stock'] ?? 0,
  }
}

type AddInput = {
  supplierId: string; name: string; category: string
  stockQty: number; unit: string; reorderThreshold: number
  unitCost?: number | null; sellPrice?: number | null
  expiryDate?: string | null; batchNumber?: string | null
}

export function useAddInventoryItem() {
  const queryClient = useQueryClient()
  return useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: async (input: AddInput) => {
      const status: StockStatus = input.stockQty === 0 ? 'Out of Stock' : input.stockQty <= input.reorderThreshold ? 'Low Stock' : 'In Stock'
      const { data, error } = await (supabase as any).from('inventory').insert({
        supplier_id:       input.supplierId,
        name:              input.name,
        category:          input.category,
        stock_qty:         input.stockQty,
        unit:              input.unit,
        reorder_threshold: input.reorderThreshold,
        unit_cost:         input.unitCost ?? null,
        sell_price:        input.sellPrice ?? null,
        expiry_date:       input.expiryDate ?? null,
        batch_number:      input.batchNumber ?? null,
        status,
      }).select('id').single()
      if (error) throw error

      if (input.stockQty > 0) {
        const { error: batchErr } = await (supabase as any).from('inventory_batches').insert({
          inventory_id: data.id,
          supplier_id:  input.supplierId,
          qty:          input.stockQty,
          unit_cost:    input.unitCost ?? null,
          expiry_date:  input.expiryDate ?? null,
          batch_number: input.batchNumber ?? null,
        })
        if (batchErr) throw batchErr
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['inventory'] }) },
  })
}

type UpdateInput = {
  id: string; stockQty: number; reorderThreshold: number
  unitCost?: number | null; sellPrice?: number | null
  expiryDate?: string | null; batchNumber?: string | null
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient()
  return useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: async ({ id, stockQty, reorderThreshold, unitCost, sellPrice, expiryDate, batchNumber }: UpdateInput) => {
      const status: StockStatus = stockQty === 0 ? 'Out of Stock' : stockQty <= reorderThreshold ? 'Low Stock' : 'In Stock'
      const { error } = await (supabase as any).from('inventory').update({
        stock_qty:         stockQty,
        reorder_threshold: reorderThreshold,
        unit_cost:         unitCost ?? null,
        sell_price:        sellPrice ?? null,
        expiry_date:       expiryDate ?? null,
        batch_number:      batchNumber ?? null,
        status,
        updated_at:        new Date().toISOString(),
      }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['inventory'] }) },
  })
}

export function useRestockItem() {
  const queryClient = useQueryClient()
  return useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: async ({ id, addQty, unitCost, expiryDate, batchNumber }: { id: string; addQty: number; reorderThreshold: number; unitCost?: number | null; expiryDate?: string | null; batchNumber?: string | null }) => {
      const { data: current, error: fetchErr } = await (supabase as any).from('inventory').select('supplier_id').eq('id', id).single()
      if (fetchErr) throw fetchErr

      // Each restock is its own batch — never overwrites an earlier batch's expiry/lot#
      const { error: batchErr } = await (supabase as any).from('inventory_batches').insert({
        inventory_id: id,
        supplier_id:  current.supplier_id,
        qty:          addQty,
        unit_cost:    unitCost ?? null,
        expiry_date:  expiryDate ?? null,
        batch_number: batchNumber ?? null,
      })
      if (batchErr) throw batchErr

      await recomputeInventoryFromBatches(id)

      // Keep the displayed unit cost current — it's the latest received cost, not batch-specific
      if (unitCost != null) {
        const { error: costErr } = await (supabase as any).from('inventory').update({ unit_cost: unitCost }).eq('id', id)
        if (costErr) throw costErr
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-batches'] })
    },
  })
}
