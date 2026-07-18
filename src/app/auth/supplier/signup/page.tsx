'use client'

import { BrandLogo } from '@/components/common/BrandLogo'
import Link from 'next/link'
import { useState } from 'react'

const PRODUCT_CATEGORIES = [
  'Fresh Produce', 'Meat & Poultry', 'Seafood', 'Dairy & Eggs',
  'Dry Goods & Grains', 'Bakery & Bread', 'Frozen Foods',
  'Oils & Condiments', 'Beverages', 'Herbs & Spices',
]

const inputStyle = { border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', color: '#111827' }

const focusHandlers = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#1D3A50'
    e.target.style.backgroundColor = '#ffffff'
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#E5E7EB'
    e.target.style.backgroundColor = '#F9FAFB'
  },
}

export default function SupplierSignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const [form, setForm] = useState({
    businessName: '', tradeLicense: '', trn: '',
    contactName: '', whatsapp: '', email: '', password: '',
    warehouseAddress: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role:             'supplier',
          email:            form.email,
          password:         form.password,
          name:             form.businessName,
          whatsapp:         form.whatsapp,
          warehouseAddress: form.warehouseAddress,
          tradeLicense:     form.tradeLicense || null,
          trn:              form.trn || null,
          categories:       selectedCategories,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Signup failed')
      setSubmitted(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 font-sans" style={{ backgroundColor: '#FAFAF9' }}>
        <div className="w-full max-w-md text-center p-10 rounded-xl bg-white" style={{ border: '1px solid #E5E7EB' }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgba(74,124,92,0.10)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="font-display italic font-semibold mb-3" style={{ fontSize: '2rem', color: '#1D3A50', lineHeight: 1.1 }}>
            Account created
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>
            Your account is ready. Sign in with{' '}
            <strong style={{ color: '#111827' }}>{form.email}</strong>{' '}
            and the password you just set.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/auth/login"
              className="block w-full py-3 rounded-lg text-sm font-semibold text-center text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#1D3A50', borderBottom: '3px solid #C9943E' }}
            >
              Go to login
            </Link>
            <Link href="/" className="block text-sm font-semibold text-center hover:underline" style={{ color: '#6B7280' }}>
              Back to home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#FAFAF9' }}>

      <div className="px-8 py-5 md:px-14 flex items-center justify-between bg-white" style={{ borderBottom: '1px solid #E5E7EB' }}>
        <BrandLogo variant="dark" size="sm" href="/" />
        <Link href="/auth/login" className="text-sm hover:underline" style={{ color: '#6B7280' }}>
          Already registered? Sign in
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-10">
          <span className="text-xs font-semibold uppercase block mb-3" style={{ color: '#C9943E', letterSpacing: '0.15em' }}>
            Supplier Portal
          </span>
          <h1 className="font-display italic font-semibold mb-3" style={{ fontSize: '2.5rem', color: '#111827', lineHeight: 1.1 }}>
            Register as a supplier
          </h1>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            Create your account to start receiving orders from restaurants on Deira Fresh.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">

          {error && (
            <div className="px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#991B1B', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          {/* Business details */}
          <div className="rounded-xl p-7 bg-white" style={{ border: '1px solid #E5E7EB' }}>
            <h3 className="text-sm font-semibold uppercase mb-5" style={{ color: '#1D3A50', letterSpacing: '0.1em' }}>
              Business details
            </h3>
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="businessName" className="block text-sm font-semibold mb-1.5" style={{ color: '#111827' }}>
                  Business name <span style={{ color: '#C9943E' }}>*</span>
                </label>
                <input id="businessName" name="businessName" type="text" placeholder="Al Khaleej Fresh Produce LLC" value={form.businessName} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors" style={inputStyle} {...focusHandlers} />
              </div>
              <div>
                <label htmlFor="warehouseAddress" className="block text-sm font-semibold mb-1.5" style={{ color: '#111827' }}>Warehouse address</label>
                <input id="warehouseAddress" name="warehouseAddress" type="text" placeholder="Warehouse 12, Al Quoz Industrial 3, Dubai" value={form.warehouseAddress} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors" style={inputStyle} {...focusHandlers} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tradeLicense" className="block text-sm font-semibold mb-1.5" style={{ color: '#111827' }}>Trade license</label>
                  <input id="tradeLicense" name="tradeLicense" type="text" placeholder="TL-2024-XXXX" value={form.tradeLicense} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors" style={inputStyle} {...focusHandlers} />
                </div>
                <div>
                  <label htmlFor="trn" className="block text-sm font-semibold mb-1.5" style={{ color: '#111827' }}>TRN</label>
                  <input id="trn" name="trn" type="text" placeholder="TRN-XXXXXXXXX" value={form.trn} onChange={handleChange} className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors" style={inputStyle} {...focusHandlers} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#111827' }}>Product categories</label>
                <div className="flex flex-wrap gap-2">
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className="text-sm px-3 py-1.5 rounded-full font-medium transition-colors"
                      style={{
                        backgroundColor: selectedCategories.includes(cat) ? '#1D3A50' : '#F3F4F6',
                        color:           selectedCategories.includes(cat) ? '#ffffff' : '#374151',
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact & credentials */}
          <div className="rounded-xl p-7 bg-white" style={{ border: '1px solid #E5E7EB' }}>
            <h3 className="text-sm font-semibold uppercase mb-5" style={{ color: '#1D3A50', letterSpacing: '0.1em' }}>
              Contact & credentials
            </h3>
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="contactName" className="block text-sm font-semibold mb-1.5" style={{ color: '#111827' }}>
                  Your name <span style={{ color: '#C9943E' }}>*</span>
                </label>
                <input id="contactName" name="contactName" type="text" placeholder="Mohammed Al Farsi" value={form.contactName} onChange={handleChange} required autoComplete="name" className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors" style={inputStyle} {...focusHandlers} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="whatsapp" className="block text-sm font-semibold mb-1.5" style={{ color: '#111827' }}>
                    WhatsApp <span style={{ color: '#C9943E' }}>*</span>
                  </label>
                  <input id="whatsapp" name="whatsapp" type="tel" placeholder="+971 50 123 4567" value={form.whatsapp} onChange={handleChange} required autoComplete="tel" className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors" style={inputStyle} {...focusHandlers} />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold mb-1.5" style={{ color: '#111827' }}>
                    Email <span style={{ color: '#C9943E' }}>*</span>
                  </label>
                  <input id="email" name="email" type="email" placeholder="orders@supplier.ae" value={form.email} onChange={handleChange} required autoComplete="email" className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors" style={inputStyle} {...focusHandlers} />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-semibold mb-1.5" style={{ color: '#111827' }}>
                  Password <span style={{ color: '#C9943E' }}>*</span>
                </label>
                <input id="password" name="password" type="password" placeholder="Minimum 8 characters" value={form.password} onChange={handleChange} required minLength={8} autoComplete="new-password" className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors" style={inputStyle} {...focusHandlers} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#1D3A50', borderBottom: '3px solid #C9943E' }}
            >
              {isLoading ? 'Creating account…' : 'Create account'}
            </button>
            <p className="text-xs text-center" style={{ color: '#6B7280' }}>
              No email verification required — your account activates immediately.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
