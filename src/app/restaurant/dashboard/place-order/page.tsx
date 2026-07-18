'use client'

import { useSuppliers } from '@/hooks/useSuppliers'
import { useCreateOrder } from '@/hooks/useOrders'
import { useAppStore } from '@/store/useAppStore'
import { useRestaurant } from '@/hooks/useRestaurants'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PlaceOrderPage() {
  const router              = useRouter()
  const { data: suppliers } = useSuppliers(true)
  const { mutate: createOrder, isPending, error: orderError } = useCreateOrder()

  const entityId = useAppStore((s) => s.currentUser.entityId)
  const { data: restaurant } = useRestaurant(entityId ?? '')

  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ supplierId: '' })
  const [items, setItems] = useState([{ name: '', qty: '', unit: 'kg' }])

  const addItem    = () => setItems((prev) => [...prev, { name: '', qty: '', unit: 'kg' }])
  const removeItem = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i))
  const updateItem = (i: number, field: string, value: string) =>
    setItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!entityId || !restaurant) return

    const supplier = suppliers.find((s) => s.id === form.supplierId)
    if (!supplier) return

    createOrder(
      {
        restaurantId:   entityId,
        restaurantName: restaurant.name,
        supplierId:     supplier.id,
        supplierName:   supplier.businessName,
        items: items.map((item) => ({
          name: item.name,
          qty:  parseFloat(item.qty),
          unit: item.unit,
        })),
      },
      {
        onSuccess: () => setSubmitted(true),
      }
    )
  }

  const inputCls   = 'w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors focus:border-creek-500 focus:bg-white'
  const inputStyle = { border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', color: '#111827' }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-24 font-sans gap-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(74,124,92,0.10)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <p className="font-display italic font-semibold text-3xl" style={{ color: '#111827' }}>Order placed.</p>
        <p className="text-sm text-center max-w-xs" style={{ color: '#6B7280' }}>
          Your supplier will confirm shortly. You can track it in My Orders.
        </p>
        <div className="flex gap-3 mt-2">
          <button onClick={() => router.push('/restaurant/dashboard/orders')} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-creek-500 hover:opacity-90 transition-opacity" type="button">
            View orders
          </button>
          <button onClick={() => { setSubmitted(false); setItems([{ name: '', qty: '', unit: 'kg' }]); setForm({ supplierId: '' }) }} className="px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#F3F4F6] transition-colors" style={{ color: '#1D3A50', border: '1px solid #E5E7EB' }} type="button">
            Place another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 font-sans">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-1" style={{ color: '#C9943E' }}>Restaurant</p>
        <h1 className="font-display italic font-semibold leading-none" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#111827' }}>
          Place Order
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#6B7280' }}>
          Prefer WhatsApp? Just send a voice note or text — it&apos;s faster.
        </p>
      </div>

      {orderError && (
        <div className="px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#991B1B', border: '1px solid rgba(239,68,68,0.2)' }}>
          {(orderError as Error).message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl">

        {/* Supplier */}
        <div className="rounded-xl p-6 bg-white" style={{ border: '1px solid #E5E7EB' }}>
          <h2 className="text-sm font-semibold uppercase tracking-[0.1em] mb-4" style={{ color: '#1D3A50' }}>Supplier</h2>
          <select
            required
            value={form.supplierId}
            onChange={(e) => setForm((p) => ({ ...p, supplierId: e.target.value }))}
            className={inputCls + ' appearance-none'}
            style={inputStyle}
          >
            <option value="">Choose a supplier…</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.businessName}</option>
            ))}
          </select>
        </div>

        {/* Items */}
        <div className="rounded-xl p-6 bg-white" style={{ border: '1px solid #E5E7EB' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.1em]" style={{ color: '#1D3A50' }}>Items</h2>
            <button type="button" onClick={addItem} className="text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-[#F3F4F6] transition-colors" style={{ color: '#1D3A50', border: '1px solid #E5E7EB' }}>
              + Add item
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Item name (e.g. Tomatoes)"
                  value={item.name}
                  onChange={(e) => updateItem(i, 'name', e.target.value)}
                  required
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm outline-none transition-colors focus:border-creek-500 focus:bg-white"
                  style={inputStyle}
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.qty}
                  onChange={(e) => updateItem(i, 'qty', e.target.value)}
                  required
                  min="0.1"
                  step="0.1"
                  className="w-20 px-3 py-2.5 rounded-lg text-sm outline-none transition-colors focus:border-creek-500 focus:bg-white"
                  style={inputStyle}
                />
                <select
                  value={item.unit}
                  onChange={(e) => updateItem(i, 'unit', e.target.value)}
                  className="w-20 px-3 py-2.5 rounded-lg text-sm outline-none appearance-none"
                  style={inputStyle}
                >
                  {['kg', 'pcs', 'ltrs', 'boxes', 'bunches'].map((u) => <option key={u}>{u}</option>)}
                </select>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(i)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#FEF2F2] transition-colors" style={{ color: '#EF4444' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending || !entityId}
          className="w-full max-w-2xl py-3.5 rounded-lg text-sm font-semibold text-white bg-creek-500 hover:opacity-90 transition-opacity disabled:opacity-60"
          style={{ borderBottom: '3px solid #C9943E' }}
        >
          {isPending ? 'Placing order…' : 'Place order'}
        </button>
      </form>
    </div>
  )
}
