'use client'

import { useRestaurants, useAddRestaurant, useUpdateRestaurant } from '@/hooks/useRestaurants'
import { useSuppliers } from '@/hooks/useSuppliers'
import { formatAED, authedFetch } from '@/lib/utils'
import { useState, useCallback } from 'react'
import type { Restaurant } from '@/types'

const ZONES    = ['All zones', 'Deira', 'Bur Dubai', 'Downtown / Business Bay', 'Jumeirah', 'Al Quoz', 'Sharjah']
const ZONES_IN = ['Deira', 'Bur Dubai', 'Downtown / Business Bay', 'Jumeirah', 'Al Quoz', 'Sharjah', 'JBR', 'Marina', 'Mirdif', 'Other']
const CUISINES = ['Arabic', 'Emirati', 'Indian', 'Pakistani', 'Lebanese', 'Chinese', 'Japanese', 'Italian', 'American', 'Other']

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

// ── Restaurant form ───────────────────────────────────────────────────────────

type RestaurantFormData = {
  name: string; zone: string; contact: string; whatsapp: string; email: string
  cuisineType: string; preferredTime: string; primarySupplierId: string
  brandGroup: string; active: boolean; inviteEmail: string
}

function RestaurantForm({
  initial, suppliers, onSubmit, isPending, error, submitLabel, showInvite,
}: {
  initial: RestaurantFormData
  suppliers: { id: string; businessName: string }[]
  onSubmit: (data: RestaurantFormData) => void
  isPending: boolean
  error: Error | null
  submitLabel: string
  showInvite?: boolean
}) {
  const [form, setForm] = useState(initial)
  const set = (k: keyof RestaurantFormData, v: string | boolean) => setForm((p) => ({ ...p, [k]: v }))

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form) }} className="flex flex-col gap-4">
      {error && <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#991B1B' }}>{error.message}</p>}

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Restaurant name *</label>
          <input required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Taj Dubai Kitchen" className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Brand / Group</label>
          <input value={form.brandGroup} onChange={(e) => set('brandGroup', e.target.value)} placeholder="Optional" className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Zone *</label>
          <select required value={form.zone} onChange={(e) => set('zone', e.target.value)} className={inputCls + ' appearance-none'} style={inputStyle}>
            <option value="">Select zone…</option>
            {ZONES_IN.map((z) => <option key={z}>{z}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Contact person</label>
          <input value={form.contact} onChange={(e) => set('contact', e.target.value)} placeholder="Ahmed Hassan" className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>WhatsApp</label>
          <input value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} placeholder="+971 55 123 4567" className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Email</label>
          <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="kitchen@restaurant.ae" className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Cuisine type</label>
          <select value={form.cuisineType} onChange={(e) => set('cuisineType', e.target.value)} className={inputCls + ' appearance-none'} style={inputStyle}>
            <option value="">Select…</option>
            {CUISINES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Preferred delivery time</label>
          <input value={form.preferredTime} onChange={(e) => set('preferredTime', e.target.value)} placeholder="6:00 AM – 9:00 AM" className={inputCls} style={inputStyle} />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Primary supplier</label>
          <select value={form.primarySupplierId} onChange={(e) => set('primarySupplierId', e.target.value)} className={inputCls + ' appearance-none'} style={inputStyle}>
            <option value="">None</option>
            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.businessName}</option>)}
          </select>
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
            placeholder="manager@restaurant.ae — leave blank to skip"
            className={inputCls}
            style={inputStyle}
          />
          <p className="text-[11px] mt-1.5" style={{ color: '#6B7280' }}>They&apos;ll receive an email to set their password and log in.</p>
        </div>
      )}

      <button type="submit" disabled={isPending} className="py-2.5 rounded-lg text-sm font-semibold text-white bg-creek-500 hover:opacity-90 transition-opacity disabled:opacity-60">
        {isPending ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}

const EMPTY: RestaurantFormData = {
  name: '', zone: '', contact: '', whatsapp: '', email: '',
  cuisineType: '', preferredTime: '', primarySupplierId: '', brandGroup: '', active: true, inviteEmail: '',
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function RestaurantsPage() {
  const { data: restaurants } = useRestaurants()
  const { data: suppliers }   = useSuppliers()
  const { mutateAsync: addRestaurantAsync, isPending: adding,   error: addErr } = useAddRestaurant()
  const { mutate: updateRestaurant,        isPending: updating, error: editErr } = useUpdateRestaurant()

  const [search, setSearch]   = useState('')
  const [zone, setZone]       = useState('All zones')
  const [showAdd, setShowAdd] = useState(false)
  const [editTarget, setEditTarget] = useState<Restaurant | null>(null)
  const [inviteStatus, setInviteStatus] = useState<string | null>(null)

  const handleAddRestaurant = useCallback(async (data: RestaurantFormData) => {
    const result = await addRestaurantAsync(data)
    if (data.inviteEmail) {
      setInviteStatus('Sending invite…')
      const res = await authedFetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.inviteEmail, role: 'restaurant', entityId: result.id, name: data.name }),
      })
      const json = await res.json()
      if (!res.ok) { setInviteStatus(`Invite failed: ${json.error}`); return }
      setInviteStatus('Invite sent!')
    }
    setShowAdd(false)
    setTimeout(() => setInviteStatus(null), 3000)
  }, [addRestaurantAsync])

  const filtered = restaurants.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.contact.toLowerCase().includes(search.toLowerCase())
    const matchZone   = zone === 'All zones' || r.zone === zone
    return matchSearch && matchZone
  })

  return (
    <div className="flex flex-col gap-8 font-sans">

      {showAdd && (
        <Modal title="Add restaurant" onClose={() => setShowAdd(false)}>
          {inviteStatus && (
            <div className="mb-3 px-3 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: 'rgba(29,58,80,0.08)', color: '#1D3A50' }}>{inviteStatus}</div>
          )}
          <RestaurantForm
            initial={EMPTY}
            suppliers={suppliers}
            onSubmit={handleAddRestaurant}
            isPending={adding}
            error={addErr as Error | null}
            submitLabel="Add restaurant"
            showInvite
          />
        </Modal>
      )}

      {editTarget && (
        <Modal title="Edit restaurant" onClose={() => setEditTarget(null)}>
          <RestaurantForm
            initial={{
              name:              editTarget.name,
              zone:              editTarget.zone,
              contact:           editTarget.contact,
              whatsapp:          editTarget.whatsapp,
              email:             editTarget.email,
              cuisineType:       editTarget.cuisineType,
              preferredTime:     editTarget.preferredTime,
              primarySupplierId: editTarget.primarySupplierId ?? '',
              brandGroup:        editTarget.brandGroup ?? '',
              active:            editTarget.active,
              inviteEmail:       '',
            }}
            suppliers={suppliers}
            onSubmit={(data) => updateRestaurant({ id: editTarget.id, ...data }, { onSuccess: () => setEditTarget(null) })}
            isPending={updating}
            error={editErr as Error | null}
            submitLabel="Save changes"
          />
        </Modal>
      )}

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-1" style={{ color: '#C9943E' }}>Restaurants</p>
          <h1 className="font-display italic font-semibold leading-none" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#111827' }}>Restaurants</h1>
          <p className="mt-1 text-sm" style={{ color: '#6B7280' }}>{restaurants.filter((r) => r.active).length} active · {restaurants.length} total</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="px-4 py-2 rounded-lg text-sm font-semibold bg-creek-500 text-white hover:opacity-90 transition-opacity" type="button">
          + Add restaurant
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="Search restaurants…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none transition-colors focus:border-creek-500 focus:bg-white" style={inputStyle} />
        </div>
        <select value={zone} onChange={(e) => setZone(e.target.value)} className="px-4 py-2.5 rounded-lg text-sm outline-none appearance-none" style={inputStyle}>
          {ZONES.map((z) => <option key={z}>{z}</option>)}
        </select>
      </div>

      {/* Table */}
      <section aria-label="Restaurants list">
        <div className="rounded-xl overflow-x-auto" style={{ border: '1px solid #E5E7EB' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                {['Restaurant', 'Zone', 'Contact', 'Primary Supplier', 'GMV (30d)', 'Orders', 'Status', ''].map((col) => (
                  <th key={col} className="py-3 px-5 text-left text-xs font-semibold uppercase tracking-[0.1em]" style={{ color: '#6B7280' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-sm" style={{ color: '#6B7280' }}>No restaurants match your search.</td></tr>
              ) : filtered.map((r, idx) => {
                const supplier = suppliers.find((s) => s.id === r.primarySupplierId)
                return (
                  <tr key={r.id} className="hover:bg-[#F9FAFB] transition-colors" style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#FAFAF9', borderTop: '1px solid #E5E7EB' }}>
                    <td className="py-3.5 px-5">
                      <p className="font-semibold" style={{ color: '#111827' }}>{r.name}</p>
                      {r.brandGroup && <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{r.brandGroup}</p>}
                    </td>
                    <td className="py-3.5 px-5 text-xs" style={{ color: '#6B7280' }}>{r.zone}</td>
                    <td className="py-3.5 px-5">
                      <p className="text-sm" style={{ color: '#374151' }}>{r.contact}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{r.whatsapp}</p>
                    </td>
                    <td className="py-3.5 px-5 text-sm" style={{ color: '#374151' }}>{supplier?.businessName ?? '—'}</td>
                    <td className="py-3.5 px-5 font-semibold text-sm" style={{ color: '#111827' }}>{r.gmv ? formatAED(r.gmv, true) : '—'}</td>
                    <td className="py-3.5 px-5 text-sm" style={{ color: '#374151' }}>{r.ordersCount}</td>
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: r.active ? 'rgba(74,124,92,0.10)' : 'rgba(156,163,175,0.15)', color: r.active ? '#2D6A4F' : '#6B7280' }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: r.active ? '#2D6A4F' : '#9CA3AF' }} />
                        {r.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <button onClick={() => setEditTarget(r)} className="text-xs font-semibold px-3 py-1.5 rounded-md transition-colors hover:bg-[#F3F4F6]" style={{ color: '#1D3A50', border: '1px solid #E5E7EB' }} type="button">
                        Edit
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs" style={{ color: '#9CA3AF' }}>Showing {filtered.length} of {restaurants.length} restaurants</p>
      </section>
    </div>
  )
}
