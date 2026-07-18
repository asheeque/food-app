'use client'

import { BrandLogo } from '@/components/common/BrandLogo'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAppStore } from '@/store/useAppStore'
import type { UserRole } from '@/types'

const ROLE_DESTINATIONS: Record<string, string> = {
  admin:      '/dashboard',
  supplier:   '/supplier/dashboard',
  restaurant: '/restaurant/dashboard',
}

const PANEL_STATS = [
  { value: '200+',    label: 'Restaurants served' },
  { value: 'AED 2.4M', label: 'GMV processed' },
  { value: '99.2%',  label: 'On-time delivery' },
]

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setCurrentUser = useAppStore((s) => s.setCurrentUser)
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setAuthError(null)

    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError || !authData.user) {
      setAuthError(signInError?.message ?? 'Sign in failed.')
      setIsLoading(false)
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, entity_id, name')
      .eq('id', authData.user.id)
      .single()

    if (profileError || !profile) {
      setAuthError('Account not configured. Contact your administrator.')
      setIsLoading(false)
      return
    }

    setCurrentUser({
      id: authData.user.id,
      name: profile.name ?? email,
      email,
      role: profile.role as UserRole,
      entityId: profile.entity_id ?? null,
    })

    // Honor ?next= from middleware redirect, fall back to role's home
    const next = searchParams.get('next')
    router.push(next ?? ROLE_DESTINATIONS[profile.role] ?? '/dashboard')
  }

  return (
    <div className="min-h-screen flex font-sans">

      {/* ── Left panel ── */}
      <aside
        className="hidden md:flex md:w-2/5 flex-col justify-between px-12 py-14 relative bg-creek-500"
        aria-label="Deira Fresh portal"
      >
        <BrandLogo variant="light" href="/" />

        <div className="pb-2">
          <h1
            className="font-display italic font-semibold text-[#FAFAF9] leading-[1.1]"
            style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)' }}
          >
            Welcome<br />back.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[rgba(250,250,249,0.65)]">
            Dubai&apos;s food supply platform — built for restaurants and the people who feed them.
          </p>

          <ul className="mt-10 flex flex-col gap-6 list-none p-0" aria-label="Platform statistics">
            {PANEL_STATS.map(({ value, label }) => (
              <li key={label} className="flex items-baseline gap-3">
                <span className="font-display font-semibold text-[1.75rem] leading-none text-gold">
                  {value}
                </span>
                <span className="text-sm text-[rgba(250,250,249,0.55)]">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gold" aria-hidden="true" />
      </aside>

      {/* ── Right panel ── */}
      <section
        className="flex-1 flex flex-col justify-center px-8 py-14 md:px-16 bg-white"
        aria-label="Sign in"
      >
        <div className="mb-10 md:hidden">
          <BrandLogo variant="dark" size="sm" href="/" />
        </div>

        <div className="w-full max-w-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gold mb-4">
            Deira Fresh
          </p>
          <h2
            className="font-display font-semibold text-[2.25rem] leading-[1.1] mb-8"
            style={{ color: '#111827' }}
          >
            Sign in
          </h2>

          {authError && (
            <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#991B1B', border: '1px solid rgba(239,68,68,0.2)' }}>
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-1.5" style={{ color: '#111827' }}>
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.ae"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg text-sm border border-[#E5E7EB] bg-[#F9FAFB] focus:outline-none focus:border-creek-500 focus:bg-white transition-colors"
                style={{ color: '#111827' }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-semibold" style={{ color: '#111827' }}>
                  Password
                </label>
                <a href="#" className="text-xs font-medium text-gold hover:underline">
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg text-sm border border-[#E5E7EB] bg-[#F9FAFB] focus:outline-none focus:border-creek-500 focus:bg-white transition-colors"
                style={{ color: '#111827' }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 mt-2 rounded-lg text-sm font-semibold bg-creek-500 text-white border-b-[3px] border-b-gold transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isLoading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <footer className="mt-8 pt-6 flex flex-col gap-2 border-t border-[#E5E7EB]">
            <p className="text-sm" style={{ color: '#6B7280' }}>
              New restaurant or supplier?{' '}
              <Link href="/auth/signup" className="font-semibold text-creek-500 hover:underline">
                Request access
              </Link>
            </p>
          </footer>
        </div>
      </section>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
