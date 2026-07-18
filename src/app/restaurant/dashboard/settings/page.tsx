'use client'

import { useAppStore, selectEntityId } from '@/store/useAppStore'
import { useRestaurant, useUpdateRestaurant } from '@/hooks/useRestaurants'
import { useRestaurantAddresses, useAddAddress, useUpdateAddress, useDeleteAddress } from '@/hooks/useAddresses'
import { useEffect, useState } from 'react'
import type { RestaurantAddress } from '@/types'

const ZONES = ['Deira', 'Bur Dubai', 'Downtown / Business Bay', 'Jumeirah', 'Al Quoz', 'Sharjah', 'Other']

const inputCls   = 'w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors focus:border-creek-500 focus:bg-white'
const inputStyle = { border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', color: '#111827' }

// ─── Delivery addresses ────────────────────────────────────────────────────────

function AddressForm({ restaurantId, address, onDone }: { restaurantId: string; address: RestaurantAddress | null; onDone: () => void }) {
  const { mutate: addAddress, isPending: adding, error: addError } = useAddAddress()
  const { mutate: updateAddress, isPending: updating, error: updateError } = useUpdateAddress()
  const [label, setLabel] = useState(address?.label ?? '')
  const [addressLine, setAddressLine] = useState(address?.addressLine ?? '')
  const [isDefault, setIsDefault] = useState(address?.isDefault ?? false)

  const isPending = adding || updating
  const error = addError ?? updateError

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const input = { restaurantId, label, addressLine, isDefault }
    if (address) {
      updateAddress({ id: address.id, ...input }, { onSuccess: onDone })
    } else {
      addAddress(input, { onSuccess: onDone })
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 p-4 rounded-lg" style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
      {error && <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#991B1B' }}>{(error as Error).message}</p>}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Label</label>
          <input required value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Main Kitchen" className={inputCls} style={inputStyle} />
        </div>
        <label className="flex items-center gap-2 mt-6 text-xs font-semibold" style={{ color: '#374151' }}>
          <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
          Set as default
        </label>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Address</label>
        <input required value={addressLine} onChange={(e) => setAddressLine(e.target.value)} placeholder="Street, area, city" className={inputCls} style={inputStyle} />
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onDone} className="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#F3F4F6] transition-colors" style={{ color: '#374151', border: '1px solid #E5E7EB' }}>Cancel</button>
        <button type="submit" disabled={isPending} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-creek-500 hover:opacity-90 transition-opacity disabled:opacity-60">
          {isPending ? 'Saving…' : 'Save address'}
        </button>
      </div>
    </form>
  )
}

function AddressesCard({ restaurantId }: { restaurantId: string }) {
  const { data: addresses } = useRestaurantAddresses(restaurantId)
  const { mutate: deleteAddress } = useDeleteAddress()
  const [editing, setEditing] = useState<RestaurantAddress | 'new' | null>(null)

  return (
    <div className="rounded-xl p-6 bg-white" style={{ border: '1px solid #E5E7EB' }}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.1em]" style={{ color: '#1D3A50' }}>Delivery addresses</h2>
        {editing === null && (
          <button type="button" onClick={() => setEditing('new')} className="text-xs font-semibold px-3 py-1.5 rounded-md text-white bg-creek-500 hover:opacity-90 transition-opacity">
            + Add address
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {addresses.length === 0 && editing !== 'new' && (
          <p className="text-sm" style={{ color: '#9CA3AF' }}>No saved addresses yet. Add one so it can be picked at checkout.</p>
        )}
        {addresses.map((a) =>
          editing !== 'new' && editing?.id === a.id ? (
            <AddressForm key={a.id} restaurantId={restaurantId} address={a} onDone={() => setEditing(null)} />
          ) : (
            <div key={a.id} className="flex items-center justify-between gap-3 py-2.5" style={{ borderBottom: '1px solid #F3F4F6' }}>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold truncate" style={{ color: '#111827' }}>{a.label}</p>
                  {a.isDefault && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(74,124,92,0.10)', color: '#2D6A4F' }}>Default</span>
                  )}
                </div>
                <p className="text-xs truncate" style={{ color: '#6B7280' }}>{a.addressLine}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button type="button" onClick={() => setEditing(a)} className="text-xs font-semibold px-2.5 py-1.5 rounded-md transition-colors hover:bg-[#F3F4F6]" style={{ color: '#1D3A50', border: '1px solid #E5E7EB' }}>Edit</button>
                <button type="button" onClick={() => deleteAddress(a.id)} className="text-xs font-semibold px-2.5 py-1.5 rounded-md transition-colors hover:bg-[#FEF2F2]" style={{ color: '#991B1B', border: '1px solid #FECACA' }}>Delete</button>
              </div>
            </div>
          )
        )}
        {editing === 'new' && <AddressForm restaurantId={restaurantId} address={null} onDone={() => setEditing(null)} />}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RestaurantSettingsPage() {
  const restaurantId = useAppStore(selectEntityId) ?? undefined
  const { data: restaurant } = useRestaurant(restaurantId ?? '')
  const { mutate: updateRestaurant, isPending, isSuccess, error } = useUpdateRestaurant()

  const [form, setForm] = useState({
    name: '', zone: '', contact: '', whatsapp: '', email: '',
    cuisineType: '', preferredTime: '', primarySupplierId: '', brandGroup: '', active: true,
  })

  useEffect(() => {
    if (restaurant) {
      setForm({
        name:              restaurant.name,
        zone:              restaurant.zone,
        contact:           restaurant.contact,
        whatsapp:          restaurant.whatsapp,
        email:             restaurant.email,
        cuisineType:       restaurant.cuisineType,
        preferredTime:     restaurant.preferredTime,
        primarySupplierId: restaurant.primarySupplierId ?? '',
        brandGroup:        restaurant.brandGroup ?? '',
        active:            restaurant.active,
      })
    }
  }, [restaurant])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!restaurantId) return
    updateRestaurant({ id: restaurantId, ...form })
  }

  return (
    <div className="flex flex-col gap-8 font-sans">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-1" style={{ color: '#C9943E' }}>Restaurant</p>
        <h1 className="font-display italic font-semibold leading-none" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#111827' }}>Settings</h1>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-2xl">

        {error && (
          <div className="px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#991B1B', border: '1px solid rgba(239,68,68,0.2)' }}>
            {(error as Error).message}
          </div>
        )}

        <div className="rounded-xl p-6 bg-white" style={{ border: '1px solid #E5E7EB' }}>
          <h2 className="text-sm font-semibold uppercase tracking-[0.1em] mb-5" style={{ color: '#1D3A50' }}>Restaurant profile</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#111827' }}>Restaurant name</label>
              <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className={inputCls} style={inputStyle} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#111827' }}>WhatsApp</label>
                <input type="tel" value={form.whatsapp} onChange={(e) => setForm((p) => ({ ...p, whatsapp: e.target.value }))} className={inputCls} style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#111827' }}>Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className={inputCls} style={inputStyle} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#111827' }}>Delivery zone</label>
                <select value={form.zone} onChange={(e) => setForm((p) => ({ ...p, zone: e.target.value }))} className={inputCls + ' appearance-none'} style={inputStyle}>
                  {ZONES.map((z) => <option key={z}>{z}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#111827' }}>Preferred delivery time</label>
                <input type="text" value={form.preferredTime} onChange={(e) => setForm((p) => ({ ...p, preferredTime: e.target.value }))} placeholder="6:00 AM – 9:00 AM" className={inputCls} style={inputStyle} />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-6 bg-white" style={{ border: '1px solid #E5E7EB' }}>
          <h2 className="text-sm font-semibold uppercase tracking-[0.1em] mb-5" style={{ color: '#1D3A50' }}>Notifications</h2>
          <div className="flex flex-col gap-3">
            {['Order confirmed by supplier', 'Delivery on the way', 'Order delivered'].map((label) => (
              <label key={label} className="flex items-center justify-between py-2 cursor-pointer">
                <span className="text-sm" style={{ color: '#374151' }}>{label}</span>
                <div className="w-10 h-5 rounded-full relative" style={{ backgroundColor: '#1D3A50' }}>
                  <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" />
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={isPending || !restaurantId} className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-creek-500 hover:opacity-90 transition-opacity disabled:opacity-60">
            {isPending ? 'Saving…' : isSuccess ? 'Saved ✓' : 'Save changes'}
          </button>
        </div>
      </form>

      {/* Outside the profile <form> — has its own independent save actions, and forms can't nest */}
      <div className="max-w-2xl">
        {restaurantId && <AddressesCard restaurantId={restaurantId} />}
      </div>
    </div>
  )
}
