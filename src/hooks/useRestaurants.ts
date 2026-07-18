'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { authedFetch } from '@/lib/utils'
import { mapRestaurant } from '@/lib/supabase/mappers'
import type { Restaurant } from '@/types'

export function useRestaurants(activeOnly = false) {
  const query = useQuery({
    queryKey: ['restaurants', { activeOnly }],
    queryFn: async () => {
      const p = new URLSearchParams()
      if (activeOnly) p.set('active', 'true')
      const res = await authedFetch(`/api/restaurants?${p.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch restaurants')
      const data = await res.json()
      return (data as object[]).map(mapRestaurant)
    },
  })
  return { ...query, data: query.data ?? [] }
}

export function useRestaurant(id: string) {
  const query = useQuery({
    queryKey: ['restaurants', id],
    queryFn: async () => {
      const res = await authedFetch(`/api/restaurants?id=${encodeURIComponent(id)}`)
      if (!res.ok) throw new Error('Failed to fetch restaurant')
      return mapRestaurant(await res.json())
    },
    enabled: !!id,
  })
  return { ...query, data: query.data ?? null }
}

export function useRestaurantsBySupplier(supplierId: string) {
  const query = useQuery({
    queryKey: ['restaurants', { supplierId }],
    queryFn: async () => {
      const res = await authedFetch(`/api/restaurants?supplier_id=${encodeURIComponent(supplierId)}`)
      if (!res.ok) throw new Error('Failed to fetch restaurants')
      const data = await res.json()
      return (data as object[]).map(mapRestaurant)
    },
    enabled: !!supplierId,
  })
  return { ...query, data: query.data ?? [] }
}

type RestaurantInput = Pick<Restaurant, 'name' | 'zone' | 'contact' | 'whatsapp' | 'email' | 'cuisineType' | 'preferredTime' | 'primarySupplierId'> &
  Partial<Pick<Restaurant, 'brandGroup' | 'active'>>

export function useAddRestaurant() {
  const queryClient = useQueryClient()
  return useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: async (input: RestaurantInput) => {
      const { data, error } = await (supabase as any).from('restaurants').insert({
        name:                input.name,
        zone:                input.zone,
        contact:             input.contact,
        whatsapp:            input.whatsapp,
        email:               input.email,
        cuisine_type:        input.cuisineType,
        preferred_time:      input.preferredTime,
        primary_supplier_id: input.primarySupplierId || null,
        brand_group:         input.brandGroup ?? null,
        active:              input.active ?? true,
      }).select('id').single()
      if (error) throw error
      return data as { id: string }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['restaurants'] }) },
  })
}

export function useUpdateRestaurant() {
  const queryClient = useQueryClient()
  return useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: async ({ id, ...input }: RestaurantInput & { id: string }) => {
      const { error } = await (supabase as any).from('restaurants').update({
        name:                input.name,
        zone:                input.zone,
        contact:             input.contact,
        whatsapp:            input.whatsapp,
        email:               input.email,
        cuisine_type:        input.cuisineType,
        preferred_time:      input.preferredTime,
        primary_supplier_id: input.primarySupplierId || null,
        brand_group:         input.brandGroup ?? null,
        active:              input.active ?? true,
      }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['restaurants'] }) },
  })
}
