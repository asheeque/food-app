'use client'

import { BrandLogo } from '@/components/common/BrandLogo'
import { useRealtimeSync } from '@/hooks/useRealtimeSync'
import { supabase } from '@/lib/supabase/client'
import { useAppStore } from '@/store/useAppStore'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'
import type { UserRole } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NavItem {
  href: string
  label: string
  /** Match exactly (for root dashboard pages like /dashboard) */
  exact?: boolean
  icon: ReactNode
}

interface DashboardShellProps {
  navItems: NavItem[]
  /** e.g. "Admin Portal", "Supplier Portal", "Restaurant Portal" */
  portalLabel: string
  children: ReactNode
}

// ─── SVG icon helper ─────────────────────────────────────────────────────────

function Icon({ d, viewBox = '0 0 24 24' }: { d: string; viewBox?: string }) {
  return (
    <svg
      width="16" height="16"
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardShell({ navItems, portalLabel, children }: DashboardShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { currentUser, setCurrentUser, clearUser, notificationCount, setMobileNavOpen, mobileNavOpen } = useAppStore()

  // Sync Supabase session → store on hard refresh (store starts as mock user)
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, entity_id, name')
        .eq('id', session.user.id)
        .single()
      if (profile) {
        setCurrentUser({
          id: session.user.id,
          name: profile.name ?? session.user.email ?? '',
          email: session.user.email ?? '',
          role: profile.role as UserRole,
          entityId: profile.entity_id ?? null,
        })
      }
    })
  }, [setCurrentUser])

  // Live order + inventory updates
  useRealtimeSync()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    clearUser()
    router.push('/auth/login')
  }

  const initials = currentUser.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)

  const currentLabel =
    navItems.find((item) => isActive(item))?.label ?? 'Dashboard'

  return (
    <div className="flex h-screen font-sans bg-[#FAFAF9]">

      {/* ── Sidebar ── */}
      <aside
        className="hidden md:flex w-56 shrink-0 flex-col bg-creek-500"
        style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}
        aria-label={`${portalLabel} navigation`}
      >
        {/* Brand */}
        <div className="px-5 py-5 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <BrandLogo variant="light" size="sm" href="/" />
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[rgba(250,250,249,0.40)]">
            {portalLabel}
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {navItems.map((item) => {
            const active = isActive(item)
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md mb-0.5 text-sm font-medium transition-colors hover:bg-white/10"
                style={{
                  color: active ? '#C9943E' : 'rgba(250,250,249,0.70)',
                  backgroundColor: active ? 'rgba(255,255,255,0.10)' : 'transparent',
                  borderLeft: active ? '3px solid #C9943E' : '3px solid transparent',
                }}
              >
                <span className="shrink-0" style={{ opacity: active ? 1 : 0.55 }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User footer */}
        <div
          className="px-4 py-4 shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-xs font-bold text-white shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#FAFAF9] truncate">{currentUser.name}</p>
              <p className="text-[11px] text-[rgba(250,250,249,0.45)] truncate">{currentUser.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors hover:bg-white/10"
            style={{ color: 'rgba(250,250,249,0.55)' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header
          className="flex items-center justify-between px-6 py-4 shrink-0 bg-[#FAFAF9]"
          style={{ borderBottom: '1px solid #E5E7EB' }}
        >
          <div className="flex items-center gap-2">
            {/* Mobile menu toggle */}
            <button
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-md text-creek-500 hover:bg-[#F3F4F6] transition-colors"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              aria-label="Toggle menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <p className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: '#6B7280' }}>
              {currentLabel}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <button
              className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F3F4F6] transition-colors"
              aria-label={`${notificationCount} notifications`}
              style={{ color: '#6B7280' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-gold" aria-hidden="true" />
              )}
            </button>

            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-xs font-bold text-white cursor-pointer"
              title={currentUser.name}
            >
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
