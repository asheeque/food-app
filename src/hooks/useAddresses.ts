'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { mapRestaurantAddress } from '@/lib/supabase/mappers'
import type { RestaurantAddress } from '@/types'

export function useRestaurantAddresses(restaurantId?: string) {
  const query = useQuery({
    queryKey: ['restaurant-addresses', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurant_addresses')
        .select('*')
        .eq('restaurant_id', restaurantId as string)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true })
      if (error) throw error
      return (data ?? []).map(mapRestaurantAddress)
    },
    enabled: !!restaurantId,
  })
  return { ...query, data: query.data ?? [] }
}

type AddressInput = { restaurantId: string; label: string; addressLine: string; isDefault?: boolean }

export function useAddAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: AddressInput) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('restaurant_addresses').insert({
        restaurant_id: input.restaurantId,
        label:         input.label,
        address_line:  input.addressLine,
        is_default:    input.isDefault ?? false,
      })
      if (error) throw error
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['restaurant-addresses'] }) },
  })
}

export function useUpdateAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: AddressInput & { id: string }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('restaurant_addresses').update({
        label:        input.label,
        address_line: input.addressLine,
        is_default:   input.isDefault ?? false,
      }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['restaurant-addresses'] }) },
  })
}

export function useDeleteAddress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('restaurant_addresses').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['restaurant-addresses'] }) },
  })
}

export type { RestaurantAddress }
