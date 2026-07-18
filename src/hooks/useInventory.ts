'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { mapInventoryItem } from '@/lib/supabase/mappers'
import type { StockStatus } from '@/types'

export function useInventory(supplierId?: string) {
  const query = useQuery({
    queryKey: ['inventory', { supplierId }],
    queryFn: async () => {
      let q = supabase.from('inventory').select('*')
      if (supplierId) q = q.eq('supplier_id', supplierId)
      const { data, error } = await q.order('name')
      if (error) throw error
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

export function useAddInventoryItem() {
  const queryClient = useQueryClient()
  return useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: async (input: { supplierId: string; name: string; category: string; stockQty: number; unit: string; reorderThreshold: number }) => {
      const status: StockStatus = input.stockQty === 0 ? 'Out of Stock' : input.stockQty <= input.reorderThreshold ? 'Low Stock' : 'In Stock'
      const { error } = await (supabase as any).from('inventory').insert({
        supplier_id:       input.supplierId,
        name:              input.name,
        category:          input.category,
        stock_qty:         input.stockQty,
        unit:              input.unit,
        reorder_threshold: input.reorderThreshold,
        status,
      })
      if (error) throw error
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['inventory'] }) },
  })
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient()
  return useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: async ({ id, stockQty, reorderThreshold }: { id: string; stockQty: number; reorderThreshold: number }) => {
      const status: StockStatus = stockQty === 0 ? 'Out of Stock' : stockQty <= reorderThreshold ? 'Low Stock' : 'In Stock'
      const { error } = await (supabase as any).from('inventory').update({
        stock_qty:         stockQty,
        reorder_threshold: reorderThreshold,
        status,
        updated_at:        new Date().toISOString(),
      }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['inventory'] }) },
  })
}
