'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { mapSupplier } from '@/lib/supabase/mappers'
import type { Supplier } from '@/types'

async function fetchSuppliers(params: URLSearchParams) {
  const res = await fetch(`/api/suppliers?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to fetch suppliers')
  const data = await res.json()
  return Array.isArray(data) ? (data as object[]).map(mapSupplier) : [mapSupplier(data)]
}

export function useSuppliers(activeOnly = false) {
  const query = useQuery({
    queryKey: ['suppliers', { activeOnly }],
    queryFn: () => {
      const p = new URLSearchParams()
      if (activeOnly) p.set('active', 'true')
      return fetchSuppliers(p).then((rows) => rows)
    },
  })
  return { ...query, data: query.data ?? [] }
}

export function useSupplier(id: string) {
  const query = useQuery({
    queryKey: ['suppliers', id],
    queryFn: async () => {
      const res = await fetch(`/api/suppliers?id=${encodeURIComponent(id)}`)
      if (!res.ok) throw new Error('Failed to fetch supplier')
      return mapSupplier(await res.json())
    },
    enabled: !!id,
  })
  return { ...query, data: query.data ?? null }
}

type SupplierInput = Pick<Supplier, 'businessName' | 'whatsapp' | 'email' | 'warehouseAddress' | 'categories'> &
  Partial<Pick<Supplier, 'tradeLicense' | 'trn' | 'active'>>

export function useAddSupplier() {
  const queryClient = useQueryClient()
  return useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: async (input: SupplierInput) => {
      const { data, error } = await (supabase as any).from('suppliers').insert({
        business_name:     input.businessName,
        whatsapp:          input.whatsapp,
        email:             input.email,
        warehouse_address: input.warehouseAddress,
        categories:        input.categories,
        trade_license:     input.tradeLicense ?? null,
        trn:               input.trn ?? null,
        active:            input.active ?? true,
      }).select('id').single()
      if (error) throw error
      return data as { id: string }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['suppliers'] }) },
  })
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient()
  return useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: async ({ id, ...input }: SupplierInput & { id: string }) => {
      const { error } = await (supabase as any).from('suppliers').update({
        business_name:     input.businessName,
        whatsapp:          input.whatsapp,
        email:             input.email,
        warehouse_address: input.warehouseAddress,
        categories:        input.categories,
        trade_license:     input.tradeLicense ?? null,
        trn:               input.trn ?? null,
        active:            input.active ?? true,
      }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['suppliers'] }) },
  })
}
