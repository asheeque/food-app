import type { Metadata } from 'next'
import { AppProviders } from '@/lib/providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Deira Fresh — Dubai Food Supply Portal',
  description: 'Voice-powered food supply platform for Dubai restaurants and suppliers.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  )
}
