'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { mapOrder } from '@/lib/supabase/mappers'
import type { Order, OrderFilters, OrderStatus } from '@/types'

export function useOrders(filters?: OrderFilters) {
  const query = useQuery({
    queryKey: ['orders', filters],
    queryFn: async () => {
      let q = supabase.from('orders').select('*')
      if (filters?.restaurantId) q = q.eq('restaurant_id', filters.restaurantId)
      if (filters?.supplierId) q = q.eq('supplier_id', filters.supplierId)
      if (filters?.status) q = q.eq('status', filters.status)
      if (filters?.source) q = q.eq('source', filters.source)
      const { data, error } = await q.order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map(mapOrder)
    },
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
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
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
      items: { name: string; qty: number; unit: string }[]
    }) => {
      const id = `DF-${Date.now().toString().slice(-5)}`
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('orders').insert({
        id,
        restaurant_id:   input.restaurantId,
        restaurant_name: input.restaurantName,
        supplier_id:     input.supplierId,
        supplier_name:   input.supplierName,
        status:          'Pending',
        source:          'Portal',
        amount:          0,
        items:           input.items.map((item, i) => ({ id: `item-${i}`, ...item, confidence: null })),
      })
      if (error) throw error
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
