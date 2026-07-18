'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { mapWhatsAppMessage } from '@/lib/supabase/mappers'

export function useWhatsAppLog() {
  const query = useQuery({
    queryKey: ['whatsapp_log'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('whatsapp_log')
        .select('*')
        .order('received_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map(mapWhatsAppMessage)
    },
  })
  return { ...query, data: query.data ?? [] }
}
