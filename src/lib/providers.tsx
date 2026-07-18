'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function AppProviders({ children }: { children: React.ReactNode }) {
  // One QueryClient per browser session — created once in state so it isn't
  // recreated on every render but also isn't shared across requests on the server.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,       // 30s — data stays fresh before a background refetch
            gcTime: 5 * 60_000,      // 5min — keep unused data in cache
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
