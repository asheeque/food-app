'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { mapOrder } from '@/lib/supabase/mappers'
import { deductFEFO } from '@/lib/supabase/batches'
import type { Order, OrderFilters, OrderStatus } from '@/types'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
function isUUID(s?: string | null): s is string { return !!s && UUID_RE.test(s) }

/** UAE standard VAT rate */
export const VAT_RATE = 0.05
const round2 = (n: number) => Math.round(n * 100) / 100

export function useOrders(filters?: OrderFilters) {
  const restaurantId = isUUID(filters?.restaurantId) ? filters!.restaurantId : undefined
  const supplierId   = isUUID(filters?.supplierId)   ? filters!.supplierId   : undefined

  const query = useQuery({
    queryKey: ['orders', { ...filters, restaurantId, supplierId }],
    queryFn: async () => {
      let q = supabase.from('orders').select('*')
      if (restaurantId) q = q.eq('restaurant_id', restaurantId)
      if (supplierId)   q = q.eq('supplier_id',   supplierId)
      if (filters?.status) q = q.eq('status', filters.status)
      if (filters?.source) q = q.eq('source', filters.source)
      const { data, error } = await q.order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map(mapOrder)
    },
    enabled: !filters?.restaurantId || isUUID(filters.restaurantId),
  })
  return { ...query, data: query.data ?? [] }
}

export function useOrder(id: string) {
  const query = useQuery({
    queryKey: ['orders', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return mapOrder(data)
    },
    enabled: !!id,
  })
  return { ...query, data: query.data ?? null }
}

export function useOrderStats(filters?: OrderFilters) {
  const { data: orders } = useOrders(filters)
  const byStatus = orders.reduce<Record<OrderStatus, number>>(
    (acc, o) => ({ ...acc, [o.status]: (acc[o.status] ?? 0) + 1 }),
    {} as Record<OrderStatus, number>
  )
  const totalAED = orders.reduce((sum, o) => sum + o.amount, 0)
  return { byStatus, totalAED, count: orders.length }
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const { data: current, error: fetchErr } = await supabase
        .from('orders')
        .select('status, items')
        .eq('id', id)
        .single()
      if (fetchErr) throw fetchErr

      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error

      // Deduct stock the moment a supplier commits to an order — only once, on the Pending → Confirmed transition.
      // Consumes oldest-expiring batches first (FEFO) rather than touching a single aggregate row.
      if (status === 'Confirmed' && current?.status === 'Pending') {
        const items = (current.items ?? []) as { itemId?: string; qty: number }[]
        for (const item of items) {
          if (!item.itemId) continue
          await deductFEFO(item.itemId, item.qty)
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-batches'] })
    },
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      restaurantId: string
      restaurantName: string
      supplierId: string
      supplierName: string
      deliveryAddress: string
      items: { name: string; qty: number; unit: string; itemId?: string; unitPrice?: number | null }[]
    }) => {
      const id = `DF-${Date.now().toString().slice(-5)}`
      const subtotal  = input.items.reduce((s, i) => s + (i.unitPrice ?? 0) * i.qty, 0)
      const taxAmount = round2(subtotal * VAT_RATE)
      const amount    = round2(subtotal + taxAmount)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('orders').insert({
        id,
        restaurant_id:    input.restaurantId,
        restaurant_name:  input.restaurantName,
        supplier_id:      input.supplierId,
        supplier_name:    input.supplierName,
        status:           'Pending',
        source:           'Portal',
        amount,
        tax_amount:       taxAmount,
        delivery_address: input.deliveryAddress,
        items:            input.items.map((item, i) => ({ id: `item-${i}`, ...item, confidence: null })),
      })
      if (error) throw error
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
