'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'

/**
 * Mount once per dashboard layout. Opens a single Supabase Realtime channel
 * that invalidates TanStack Query caches when orders or inventory rows change.
 */
export function useRealtimeSync() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel('deira-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => { queryClient.invalidateQueries({ queryKey: ['orders'] }) }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory' },
        () => { queryClient.invalidateQueries({ queryKey: ['inventory'] }) }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [queryClient])
}
