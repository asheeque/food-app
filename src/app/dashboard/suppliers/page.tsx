'use client'

import { useSuppliers, useAddSupplier, useUpdateSupplier } from '@/hooks/useSuppliers'
import { useState, useCallback } from 'react'
import type { Supplier } from '@/types'

const CATEGORIES_ALL = ['Vegetables', 'Fruits', 'Herbs', 'Dairy', 'Eggs', 'Poultry', 'Seafood', 'Spices', 'Dry Goods', 'Condiments', 'Beverages']
const FILTER_CATS    = ['All categories', 'Fresh Produce', 'Meat & Poultry', 'Seafood', 'Dairy & Eggs', 'Bakery & Bread', 'Herbs & Spices', 'Dry Goods & Grains', 'Oils & Condiments', 'Beverages']

const inputStyle = { border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', color: '#111827' }
const inputCls   = 'w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-colors focus:border-creek-500 focus:bg-white'

// ── Modal shell ───────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl" style={{ border: '1px solid #E5E7EB' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
          <h2 className="text-sm font-semibold" style={{ color: '#111827' }}>{title}</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#F3F4F6]" style={{ color: '#6B7280' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

// ── Supplier form (shared by Add + Edit) ──────────────────────────────────────

type SupplierFormData = {
  businessName: string; whatsapp: string; email: string
  warehouseAddress: string; tradeLicense: string; trn: string
  categories: string[]; active: boolean; inviteEmail: string
}

function SupplierForm({
  initial, onSubmit, isPending, error, submitLabel, showInvite,
}: {
  initial: SupplierFormData
  onSubmit: (data: SupplierFormData) => void
  isPending: boolean
  error: Error | null
  submitLabel: string
  showInvite?: boolean
}) {
  const [form, setForm] = useState(initial)
  const set = (k: keyof SupplierFormData, v: string | boolean | string[]) => setForm((p) => ({ ...p, [k]: v }))

  const toggleCat = (cat: string) =>
    set('categories', form.categories.includes(cat) ? form.categories.filter((c) => c !== cat) : [...form.categories, cat])

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="flex flex-col gap-4">
      {error && <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#991B1B' }}>{error.message}</p>}

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Business name *</label>
          <input required value={form.businessName} onChange={(e) => set('businessName', e.target.value)} placeholder="Al Khaleej Fresh Produce" className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>WhatsApp</label>
          <input value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} placeholder="+971 50 123 4567" className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Email</label>
          <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="orders@supplier.ae" className={inputCls} style={inputStyle} />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Warehouse address</label>
          <input value={form.warehouseAddress} onChange={(e) => set('warehouseAddress', e.target.value)} placeholder="Warehouse 12, Al Quoz Industrial 3, Dubai" className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Trade license</label>
          <input value={form.tradeLicense} onChange={(e) => set('tradeLicense', e.target.value)} placeholder="TL-2024-XXXX" className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>TRN</label>
          <input value={form.trn} onChange={(e) => set('trn', e.target.value)} placeholder="TRN-XXXXXXXXX" className={inputCls} style={inputStyle} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-2" style={{ color: '#374151' }}>Categories</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES_ALL.map((cat) => (
            <button
              key={cat} type="button" onClick={() => toggleCat(cat)}
              className="text-xs px-3 py-1 rounded-full font-medium transition-colors"
              style={{
                backgroundColor: form.categories.includes(cat) ? '#1D3A50' : '#F3F4F6',
                color:           form.categories.includes(cat) ? '#ffffff' : '#374151',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: '#374151' }}>
        <input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} className="w-4 h-4 rounded" />
        Active
      </label>

      {showInvite && (
        <div className="rounded-lg p-4" style={{ backgroundColor: '#F0F7FF', border: '1px solid #BFDBFE' }}>
          <p className="text-xs font-semibold mb-2" style={{ color: '#1D3A50' }}>Send portal login invite (optional)</p>
          <input
            type="email"
            value={form.inviteEmail}
            onChange={(e) => set('inviteEmail', e.target.value)}
            placeholder="supplier@example.com — leave blank to skip"
            className={inputCls}
            style={inputStyle}
          />
          <p className="text-[11px] mt-1.5" style={{ color: '#6B7280' }}>They&apos;ll receive an email to set their password and log in.</p>
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={isPending} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-creek-500 hover:opacity-90 transition-opacity disabled:opacity-60">
          {isPending ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}

const EMPTY: SupplierFormData = { businessName: '', whatsapp: '', email: '', warehouseAddress: '', tradeLicense: '', trn: '', categories: [], active: true, inviteEmail: '' }

// ── Page ─────────────────────────────────────────────────────────────────────

export default function SuppliersPage() {
  const { data: suppliers } = useSuppliers()
  const { mutateAsync: addSupplierAsync, isPending: adding, error: addErr } = useAddSupplier()
  const { mutate: updateSupplier, isPending: updating, error: editErr } = useUpdateSupplier()

  const [search, setSearch]   = useState('')
  const [cat, setCat]         = useState('All categories')
  const [showAdd, setShowAdd] = useState(false)
  const [editTarget, setEditTarget] = useState<Supplier | null>(null)
  const [inviteStatus, setInviteStatus] = useState<string | null>(null)

  const handleAddSupplier = useCallback(async (data: SupplierFormData) => {
    const result = await addSupplierAsync(data)
    if (data.inviteEmail) {
      setInviteStatus('Sending invite…')
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.inviteEmail, role: 'supplier', entityId: result.id, name: data.businessName }),
      })
      const json = await res.json()
      if (!res.ok) { setInviteStatus(`Invite failed: ${json.error}`); return }
      setInviteStatus('Invite sent!')
    }
    setShowAdd(false)
    setTimeout(() => setInviteStatus(null), 3000)
  }, [addSupplierAsync])

  const filtered = suppliers.filter((s) => {
    const matchSearch = s.businessName.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase())
    const matchCat    = cat === 'All categories' || s.categories.includes(cat)
    return matchSearch && matchCat
  })

  return (
    <div className="flex flex-col gap-8 font-sans">

      {showAdd && (
        <Modal title="Add supplier" onClose={() => setShowAdd(false)}>
          {inviteStatus && (
            <div className="mb-3 px-3 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: 'rgba(29,58,80,0.08)', color: '#1D3A50' }}>{inviteStatus}</div>
          )}
          <SupplierForm
            initial={EMPTY}
            onSubmit={handleAddSupplier}
            isPending={adding}
            error={addErr as Error | null}
            submitLabel="Add supplier"
            showInvite
          />
        </Modal>
      )}

      {editTarget && (
        <Modal title="Edit supplier" onClose={() => setEditTarget(null)}>
          <SupplierForm
            initial={{
              businessName:     editTarget.businessName,
              whatsapp:         editTarget.whatsapp,
              email:            editTarget.email,
              warehouseAddress: editTarget.warehouseAddress,
              tradeLicense:     editTarget.tradeLicense ?? '',
              trn:              editTarget.trn ?? '',
              categories:       editTarget.categories,
              active:           editTarget.active,
              inviteEmail:      '',
            }}
            onSubmit={(data) => updateSupplier({ id: editTarget.id, ...data }, { onSuccess: () => setEditTarget(null) })}
            isPending={updating}
            error={editErr as Error | null}
            submitLabel="Save changes"
          />
        </Modal>
      )}

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-1" style={{ color: '#C9943E' }}>Suppliers</p>
          <h1 className="font-display italic font-semibold leading-none" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#111827' }}>Suppliers</h1>
          <p className="mt-1 text-sm" style={{ color: '#6B7280' }}>{suppliers.filter((s) => s.active).length} active · {suppliers.length} total</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="px-4 py-2 rounded-lg text-sm font-semibold bg-creek-500 text-white hover:opacity-90 transition-opacity" type="button">
          + Add supplier
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="Search suppliers…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none transition-colors focus:border-creek-500 focus:bg-white" style={inputStyle} />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="px-4 py-2.5 rounded-lg text-sm outline-none appearance-none" style={inputStyle}>
          {FILTER_CATS.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <section aria-label="Suppliers list">
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                {['Supplier', 'Categories', 'Products', 'WhatsApp', 'Orders', 'On-time', 'Rating', 'Status', ''].map((col) => (
                  <th key={col} className="py-3 px-5 text-left text-xs font-semibold uppercase tracking-[0.1em]" style={{ color: '#6B7280' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="py-12 text-center text-sm" style={{ color: '#6B7280' }}>No suppliers match your search.</td></tr>
              ) : filtered.map((s, idx) => (
                <tr key={s.id} className="hover:bg-[#F9FAFB] transition-colors" style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#FAFAF9', borderTop: '1px solid #E5E7EB' }}>
                  <td className="py-3.5 px-5">
                    <p className="font-semibold" style={{ color: '#111827' }}>{s.businessName}</p>
                    {s.warehouseAddress && <p className="text-xs mt-0.5 truncate max-w-[180px]" style={{ color: '#9CA3AF' }}>{s.warehouseAddress}</p>}
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="flex flex-wrap gap-1">
                      {s.categories.slice(0, 2).map((c) => (
                        <span key={c} className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'rgba(29,58,80,0.07)', color: '#1D3A50' }}>{c}</span>
                      ))}
                      {s.categories.length > 2 && <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>+{s.categories.length - 2}</span>}
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-sm" style={{ color: '#374151' }}>{s.productsCount}</td>
                  <td className="py-3.5 px-5 text-sm" style={{ color: '#374151' }}>{s.whatsapp}</td>
                  <td className="py-3.5 px-5 text-sm" style={{ color: '#374151' }}>{s.ordersCount}</td>
                  <td className="py-3.5 px-5"><span className="text-sm font-semibold" style={{ color: (s.onTimeRate ?? 0) >= 97 ? '#2D6A4F' : '#D97706' }}>{s.onTimeRate}%</span></td>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#C9943E" stroke="none"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
                      <span className="text-sm font-semibold" style={{ color: '#111827' }}>{s.rating}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: s.active ? 'rgba(74,124,92,0.10)' : 'rgba(156,163,175,0.15)', color: s.active ? '#2D6A4F' : '#6B7280' }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.active ? '#2D6A4F' : '#9CA3AF' }} />
                      {s.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    <button onClick={() => setEditTarget(s)} className="text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-[#F3F4F6] transition-colors" style={{ color: '#1D3A50', border: '1px solid #E5E7EB' }} type="button">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs" style={{ color: '#9CA3AF' }}>Showing {filtered.length} of {suppliers.length} suppliers</p>
      </section>
    </div>
  )
}
