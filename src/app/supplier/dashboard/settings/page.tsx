'use client'

import { useAppStore, selectEntityId } from '@/store/useAppStore'
import { useSupplier, useUpdateSupplier } from '@/hooks/useSuppliers'
import { useEffect, useState } from 'react'

export default function SupplierSettingsPage() {
  const supplierId                          = useAppStore(selectEntityId) ?? undefined
  const { data: supplier }                  = useSupplier(supplierId ?? '')
  const { mutate: updateSupplier, isPending, isSuccess, error } = useUpdateSupplier()

  const inputCls   = 'w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors focus:border-creek-500 focus:bg-white'
  const inputStyle = { border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', color: '#111827' }

  const [form, setForm] = useState({
    businessName: '', whatsapp: '', email: '', warehouseAddress: '',
    tradeLicense: '', trn: '', categories: [] as string[], active: true,
  })

  useEffect(() => {
    if (supplier) {
      setForm({
        businessName:     supplier.businessName,
        whatsapp:         supplier.whatsapp,
        email:            supplier.email,
        warehouseAddress: supplier.warehouseAddress,
        tradeLicense:     supplier.tradeLicense ?? '',
        trn:              supplier.trn ?? '',
        categories:       supplier.categories,
        active:           supplier.active,
      })
    }
  }, [supplier])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!supplierId) return
    updateSupplier({ id: supplierId, ...form })
  }

  return (
    <div className="flex flex-col gap-8 font-sans">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-1" style={{ color: '#C9943E' }}>Supplier</p>
        <h1 className="font-display italic font-semibold leading-none" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#111827' }}>Settings</h1>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-2xl">

        {error && (
          <div className="px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#991B1B', border: '1px solid rgba(239,68,68,0.2)' }}>
            {(error as Error).message}
          </div>
        )}

        <div className="rounded-xl p-6 bg-white" style={{ border: '1px solid #E5E7EB' }}>
          <h2 className="text-sm font-semibold uppercase tracking-[0.1em] mb-5" style={{ color: '#1D3A50' }}>Business profile</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#111827' }}>Business name</label>
              <input type="text" value={form.businessName} onChange={(e) => setForm((p) => ({ ...p, businessName: e.target.value }))} className={inputCls} style={inputStyle} />
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
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#111827' }}>Warehouse address</label>
              <input type="text" value={form.warehouseAddress} onChange={(e) => setForm((p) => ({ ...p, warehouseAddress: e.target.value }))} className={inputCls} style={inputStyle} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#111827' }}>Trade license</label>
                <input type="text" value={form.tradeLicense} onChange={(e) => setForm((p) => ({ ...p, tradeLicense: e.target.value }))} className={inputCls} style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#111827' }}>TRN</label>
                <input type="text" value={form.trn} onChange={(e) => setForm((p) => ({ ...p, trn: e.target.value }))} className={inputCls} style={inputStyle} />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-6 bg-white" style={{ border: '1px solid #E5E7EB' }}>
          <h2 className="text-sm font-semibold uppercase tracking-[0.1em] mb-5" style={{ color: '#1D3A50' }}>Notifications</h2>
          <div className="flex flex-col gap-3">
            {['New order received', 'Order confirmed by restaurant', 'Low inventory alert'].map((label) => (
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
          <button type="submit" disabled={isPending || !supplierId} className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-creek-500 hover:opacity-90 transition-opacity disabled:opacity-60">
            {isPending ? 'Saving…' : isSuccess ? 'Saved ✓' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
