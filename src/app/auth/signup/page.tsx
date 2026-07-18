'use client'

import { BrandLogo } from '@/components/common/BrandLogo'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
      style={{
        backgroundColor: 'var(--color-bg, #FAFAF9)',
        fontFamily: 'var(--font-family)',
      }}
    >
      {/* Logo */}
      <div className="mb-12">
        <BrandLogo variant="dark" href="/" />
      </div>

      {/* Heading */}
      <div className="text-center mb-10">
        <span
          className="text-xs font-semibold uppercase block mb-3"
          style={{ color: 'var(--color-primary)', letterSpacing: '0.15em' }}
        >
          Get started
        </span>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: '2.5rem',
            color: 'var(--color-text-pri, #111827)',
            lineHeight: 1.1,
          }}
        >
          Choose your role
        </h1>
        <p
          className="mt-3 text-sm"
          style={{ color: 'var(--color-text-sec, #6B7280)' }}
        >
          Select how you&apos;ll be using Deira Fresh.
        </p>
      </div>

      {/* Role cards */}
      <div className="w-full max-w-2xl grid md:grid-cols-2 gap-5">
        {/* Admin card */}
        <button
          onClick={() => router.push('/auth/restaurant/signup')}
          className="text-left p-8 rounded-xl border transition-all hover:shadow-md group"
          style={{
            backgroundColor: 'var(--color-card, #ffffff)',
            border: '1px solid var(--color-border-v2, #E5E7EB)',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLElement).style.borderColor =
              'var(--color-creek)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLElement).style.borderColor =
              'var(--color-border-v2, #E5E7EB)'
          }}
        >
          {/* Icon */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
            style={{ backgroundColor: 'rgba(29,58,80,0.08)' }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-creek)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9,22 9,12 15,12 15,22" />
            </svg>
          </div>

          <div
            className="text-xs font-semibold uppercase mb-2"
            style={{ color: 'var(--color-primary)', letterSpacing: '0.12em' }}
          >
            Restaurant / Admin
          </div>
          <h2
            className="text-lg font-semibold mb-2"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--color-creek)',
              fontWeight: 600,
            }}
          >
            I manage a restaurant
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-text-sec, #6B7280)' }}
          >
            Place voice orders, track deliveries, and manage your supply chain
            from one dashboard.
          </p>

          <div
            className="mt-6 flex items-center text-sm font-semibold gap-1"
            style={{ color: 'var(--color-creek)' }}
          >
            Get admin access
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        {/* Supplier card */}
        <button
          onClick={() => router.push('/auth/supplier/signup')}
          className="text-left p-8 rounded-xl border transition-all hover:shadow-md group"
          style={{
            backgroundColor: 'var(--color-card, #ffffff)',
            border: '1px solid var(--color-border-v2, #E5E7EB)',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLElement).style.borderColor =
              'var(--color-primary)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLElement).style.borderColor =
              'var(--color-border-v2, #E5E7EB)'
          }}
        >
          {/* Icon */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
            style={{ backgroundColor: 'rgba(201,148,62,0.10)' }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="1" y="3" width="15" height="13" rx="1" />
              <path d="M16 8h4l3 3v5h-7V8z" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>

          <div
            className="text-xs font-semibold uppercase mb-2"
            style={{ color: 'var(--color-primary)', letterSpacing: '0.12em' }}
          >
            Supplier
          </div>
          <h2
            className="text-lg font-semibold mb-2"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--color-creek)',
              fontWeight: 600,
            }}
          >
            I supply ingredients
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-text-sec, #6B7280)' }}
          >
            List your products, receive orders from Deira restaurants, and
            manage deliveries through your supplier portal.
          </p>

          <div
            className="mt-6 flex items-center text-sm font-semibold gap-1"
            style={{ color: 'var(--color-primary)' }}
          >
            Register as supplier
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>

      {/* Sign-in link */}
      <p
        className="mt-10 text-sm"
        style={{ color: 'var(--color-text-sec, #6B7280)' }}
      >
        Already have an account?{' '}
        <Link
          href="/auth/login"
          className="font-semibold hover:underline"
          style={{ color: 'var(--color-creek)' }}
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
