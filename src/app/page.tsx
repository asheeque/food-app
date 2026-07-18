import { BrandLogo } from '@/components/common/BrandLogo'
import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ fontFamily: 'var(--font-family)' }}>
      {/* Top nav — sits over the dark hero */}
      <nav className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-8 py-6 md:px-14">
        <BrandLogo variant="light" size="sm" href="/" />

        <div className="flex items-center gap-6">
          <Link
            href="/auth/login"
            className="text-sm transition-opacity hover:opacity-100"
            style={{ color: 'rgba(237,231,217,0.70)' }}
          >
            Sign in
          </Link>
          <Link
            href="/auth/signup"
            className="text-sm px-4 py-2 rounded-lg font-semibold transition-opacity hover:opacity-90"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
            }}
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero — full-height navy */}
      <section
        className="relative min-h-screen flex flex-col justify-end px-8 pb-16 md:px-14 md:pb-24 overflow-hidden"
        style={{ backgroundColor: 'var(--color-creek)' }}
      >
        <h1
          className="animate-hero-up leading-none tracking-tight max-w-5xl"
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 600,
            color: 'var(--color-linen)',
            fontSize: 'clamp(3.2rem, 9vw, 8.5rem)',
          }}
        >
          Fresh produce,<br />
          ordered in<br className="md:hidden" /> a voice.
        </h1>

        <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <p
            className="text-base md:text-lg max-w-md leading-relaxed"
            style={{ color: 'rgba(237,231,217,0.70)' }}
          >
            Dubai's food supply platform — connecting restaurants and suppliers
            across Deira through WhatsApp voice ordering and real-time tracking.
          </p>

          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/auth/login"
              className="px-6 py-3 rounded-lg text-sm font-semibold border transition-colors hover:bg-white/10"
              style={{
                color: 'var(--color-linen)',
                borderColor: 'rgba(237,231,217,0.35)',
              }}
            >
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="px-6 py-3 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: '#ffffff',
              }}
            >
              Get started
            </Link>
          </div>
        </div>

        {/* Gold 3px hairline at hero bottom */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{ height: '3px', backgroundColor: 'var(--color-primary)' }}
        />
      </section>

      {/* Stats section */}
      <section
        className="px-8 py-20 md:px-14 md:py-28"
        style={{ backgroundColor: 'var(--color-bg, #FAFAF9)' }}
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 md:gap-24 items-start">
          {/* Left copy */}
          <div>
            <span
              className="text-xs font-semibold uppercase"
              style={{
                color: 'var(--color-primary)',
                letterSpacing: '0.15em',
              }}
            >
              The portal
            </span>
            <p
              className="mt-5 text-xl leading-relaxed"
              style={{ color: 'var(--color-text-pri, #111827)' }}
            >
              One platform for the produce chain —
              from Al Khaleej Farms calling in a morning order
              to Taj Hotel&apos;s kitchen confirming delivery by noon.
              No spreadsheets, no lost WhatsApps.
            </p>
            <p
              className="mt-4 text-base leading-relaxed"
              style={{ color: 'var(--color-text-sec, #6B7280)' }}
            >
              Voice-powered ordering with live status, supplier inventory,
              and a full audit trail. Works on mobile and desktop alike.
            </p>
          </div>

          {/* Right stats grid */}
          <div
            className="grid grid-cols-2 divide-x divide-y"
            style={{ borderColor: 'var(--color-border-v2, #E5E7EB)' }}
          >
            {[
              { n: '200+', label: 'Active restaurants' },
              { n: 'AED 2.4M', label: 'GMV processed' },
              { n: '99.2%', label: 'On-time delivery' },
              { n: '3 min', label: 'Avg. voice order' },
            ].map(({ n, label }) => (
              <div
                key={label}
                className="px-8 py-8"
                style={{ borderColor: 'var(--color-border-v2, #E5E7EB)' }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '2.5rem',
                    fontWeight: 600,
                    lineHeight: 1,
                    color: 'var(--color-creek)',
                  }}
                >
                  {n}
                </div>
                <div
                  className="mt-2 text-sm"
                  style={{ color: 'var(--color-text-sec, #6B7280)' }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature strip — 3-column */}
      <section
        className="px-8 py-16 md:px-14 border-t"
        style={{
          backgroundColor: 'var(--color-bg, #FAFAF9)',
          borderColor: 'var(--color-border-v2, #E5E7EB)',
        }}
      >
        <div
          className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10 md:gap-0 md:divide-x"
          style={{ borderColor: 'var(--color-border-v2, #E5E7EB)' }}
        >
          {[
            {
              label: 'Voice Orders',
              desc: 'Place orders in seconds by speaking — no typing required. AI parses and confirms instantly.',
            },
            {
              label: 'WhatsApp Ready',
              desc: 'Receive order confirmations, updates, and invoices directly in WhatsApp chat.',
            },
            {
              label: 'Real-time Dashboard',
              desc: 'Live order status, inventory levels, and delivery tracking across all your restaurants.',
            },
          ].map(({ label, desc }) => (
            <div key={label} className="md:px-10 first:pl-0 last:pr-0">
              <div
                className="text-xs font-semibold uppercase mb-3"
                style={{
                  color: 'var(--color-primary)',
                  letterSpacing: '0.15em',
                }}
              >
                {label}
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--color-text-sec, #6B7280)' }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-8 py-8 md:px-14 flex items-center justify-between text-xs"
        style={{
          backgroundColor: 'var(--color-bg, #FAFAF9)',
          borderTop: '1px solid var(--color-border-v2, #E5E7EB)',
          color: 'var(--color-text-sec, #6B7280)',
        }}
      >
        <BrandLogo variant="dark" size="sm" href="/" />
        <span>© 2026 · Deira, Dubai</span>
      </footer>
    </div>
  )
}
