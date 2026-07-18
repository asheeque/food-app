'use client'

import { useInventory, useInventoryStats, useAddInventoryItem, useUpdateInventoryItem, useRestockItem, useInventoryBatches } from '@/hooks/useInventory'
import { useAppStore, selectEntityId } from '@/store/useAppStore'
import { timeAgo, formatAED } from '@/lib/utils'
import { useState, useMemo } from 'react'
import type { InventoryItem, StockStatus } from '@/types'

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<StockStatus, { bg: string; text: string; dot: string }> = {
  'In Stock':     { bg: 'rgba(74,124,92,0.10)',  text: '#2D6A4F', dot: '#2D6A4F' },
  'Low Stock':    { bg: 'rgba(245,158,11,0.10)', text: '#92400E', dot: '#D97706' },
  'Out of Stock': { bg: 'rgba(239,68,68,0.10)',  text: '#991B1B', dot: '#EF4444' },
}

const UNITS      = ['kg', 'pcs', 'ltrs', 'boxes', 'bunches', 'bags', 'crates', 'tons']
const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Herbs', 'Dairy', 'Eggs', 'Poultry', 'Seafood', 'Spices', 'Dry Goods', 'Beverages', 'Other']
const CATS_ADD   = CATEGORIES.slice(1)

const inputStyle = { border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', color: '#111827' }
const inputCls   = 'w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-colors focus:border-creek-500 focus:bg-white'

// ─── Expiry helpers ───────────────────────────────────────────────────────────

function daysUntilExpiry(iso: string | null): number | null {
  if (!iso) return null
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000)
}

function ExpiryBadge({ date }: { date: string | null }) {
  if (!date) return <span className="text-xs" style={{ color: '#9CA3AF' }}>—</span>
  const days = daysUntilExpiry(date)!
  const expired = days < 0
  const critical = days >= 0 && days <= 2
  const warning  = days > 2 && days <= 7
  const color  = expired ? '#991B1B' : critical ? '#D97706' : warning ? '#92400E' : '#2D6A4F'
  const bg     = expired ? 'rgba(239,68,68,0.10)' : critical ? 'rgba(239,68,68,0.10)' : warning ? 'rgba(245,158,11,0.10)' : 'transparent'
  const label  = expired ? 'Expired' : days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d`
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: bg, color }}>
      {(expired || critical) && '⚠ '}
      {label}
    </span>
  )
}

function MarginBadge({ unitCost, sellPrice }: { unitCost: number | null; sellPrice: number | null }) {
  if (!unitCost || !sellPrice) return <span className="text-xs" style={{ color: '#9CA3AF' }}>—</span>
  const pct = ((sellPrice - unitCost) / sellPrice * 100)
  const color = pct >= 30 ? '#2D6A4F' : pct >= 15 ? '#D97706' : '#EF4444'
  return <span className="text-xs font-semibold" style={{ color }}>{pct.toFixed(0)}%</span>
}

// ─── Modal shell ──────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl overflow-y-auto max-h-[90vh]" style={{ border: '1px solid #E5E7EB' }}>
        <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-white" style={{ borderBottom: '1px solid #E5E7EB' }}>
          <h2 className="text-sm font-semibold" style={{ color: '#111827' }}>{title}</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#F3F4F6]" style={{ color: '#6B7280' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

function ModalActions({ onClose, isPending, submitLabel }: { onClose: () => void; isPending: boolean; submitLabel: string }) {
  return (
    <div className="flex gap-3 pt-2">
      <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#F3F4F6] transition-colors" style={{ color: '#374151', border: '1px solid #E5E7EB' }}>Cancel</button>
      <button type="submit" disabled={isPending} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-creek-500 hover:opacity-90 transition-opacity disabled:opacity-60">
        {isPending ? 'Saving…' : submitLabel}
      </button>
    </div>
  )
}

// ─── Add item modal ───────────────────────────────────────────────────────────

function AddItemModal({ supplierId, onClose }: { supplierId: string; onClose: () => void }) {
  const { mutate, isPending, error } = useAddInventoryItem()
  const [form, setForm] = useState({
    name: '', category: 'Vegetables', stockQty: '', unit: 'kg',
    reorderThreshold: '', unitCost: '', sellPrice: '', expiryDate: '', batchNumber: '',
  })

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    mutate({
      supplierId,
      name:             form.name,
      category:         form.category,
      stockQty:         parseFloat(form.stockQty),
      unit:             form.unit,
      reorderThreshold: parseFloat(form.reorderThreshold),
      unitCost:         form.unitCost  ? parseFloat(form.unitCost)  : null,
      sellPrice:        form.sellPrice ? parseFloat(form.sellPrice) : null,
      expiryDate:       form.expiryDate || null,
      batchNumber:      form.batchNumber || null,
    }, { onSuccess: onClose })
  }

  return (
    <Modal title="Add inventory item" onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-5">
        {error && <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#991B1B' }}>{(error as Error).message}</p>}

        <fieldset className="flex flex-col gap-3">
          <legend className="text-xs font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: '#6B7280' }}>Item details</legend>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Item name *</label>
            <input required value={form.name} onChange={f('name')} placeholder="e.g. Tomatoes" className={inputCls} style={inputStyle} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Category</label>
              <select value={form.category} onChange={f('category')} className={inputCls + ' appearance-none'} style={inputStyle}>
                {CATS_ADD.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Unit</label>
              <select value={form.unit} onChange={f('unit')} className={inputCls + ' appearance-none'} style={inputStyle}>
                {UNITS.map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="text-xs font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: '#6B7280' }}>Stock levels</legend>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Opening qty *</label>
              <input required type="number" min="0" step="0.1" value={form.stockQty} onChange={f('stockQty')} placeholder="0" className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Reorder at *</label>
              <input required type="number" min="0" step="0.1" value={form.reorderThreshold} onChange={f('reorderThreshold')} placeholder="0" className={inputCls} style={inputStyle} />
            </div>
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="text-xs font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: '#6B7280' }}>Pricing (AED)</legend>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Cost per unit</label>
              <input type="number" min="0" step="0.01" value={form.unitCost} onChange={f('unitCost')} placeholder="0.00" className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Sell price per unit</label>
              <input type="number" min="0" step="0.01" value={form.sellPrice} onChange={f('sellPrice')} placeholder="0.00" className={inputCls} style={inputStyle} />
            </div>
          </div>
          {form.unitCost && form.sellPrice && (
            <p className="text-xs" style={{ color: '#6B7280' }}>
              Margin: <strong style={{ color: '#111827' }}>
                {((parseFloat(form.sellPrice) - parseFloat(form.unitCost)) / parseFloat(form.sellPrice) * 100).toFixed(1)}%
              </strong>
            </p>
          )}
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="text-xs font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: '#6B7280' }}>Traceability</legend>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Expiry date</label>
              <input type="date" value={form.expiryDate} onChange={f('expiryDate')} className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Batch / lot #</label>
              <input type="text" value={form.batchNumber} onChange={f('batchNumber')} placeholder="e.g. LOT-2026-07" className={inputCls} style={inputStyle} />
            </div>
          </div>
        </fieldset>

        <ModalActions onClose={onClose} isPending={isPending} submitLabel="Add item" />
      </form>
    </Modal>
  )
}

// ─── Edit modal ───────────────────────────────────────────────────────────────

function EditModal({ item, onClose }: { item: InventoryItem; onClose: () => void }) {
  const { mutate, isPending, error } = useUpdateInventoryItem()
  const [form, setForm] = useState({
    reorderThreshold: String(item.reorderThreshold),
    unitCost:         item.unitCost  != null ? String(item.unitCost)  : '',
    sellPrice:        item.sellPrice != null ? String(item.sellPrice) : '',
  })

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    mutate({
      id: item.id,
      // Stock qty / expiry / batch# are derived from batches (see "Batches" panel) — not edited here
      stockQty:         item.stockQty,
      reorderThreshold: parseFloat(form.reorderThreshold),
      unitCost:         form.unitCost  ? parseFloat(form.unitCost)  : null,
      sellPrice:        form.sellPrice ? parseFloat(form.sellPrice) : null,
      expiryDate:       item.expiryDate,
      batchNumber:      item.batchNumber,
    }, { onSuccess: onClose })
  }

  return (
    <Modal title={`Edit — ${item.name}`} onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-5">
        {error && <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#991B1B' }}>{(error as Error).message}</p>}

        <fieldset className="flex flex-col gap-3">
          <legend className="text-xs font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: '#6B7280' }}>Stock levels</legend>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Reorder at ({item.unit})</label>
            <input required type="number" min="0" step="0.1" value={form.reorderThreshold} onChange={f('reorderThreshold')} className={inputCls} style={inputStyle} />
          </div>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>
            Stock qty ({item.stockQty} {item.unit}) is the total across batches — use Restock to add stock, or Batches to view lots.
          </p>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="text-xs font-semibold uppercase tracking-[0.1em] mb-1" style={{ color: '#6B7280' }}>Pricing (AED)</legend>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Cost per unit</label>
              <input type="number" min="0" step="0.01" value={form.unitCost} onChange={f('unitCost')} placeholder="0.00" className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Sell price per unit</label>
              <input type="number" min="0" step="0.01" value={form.sellPrice} onChange={f('sellPrice')} placeholder="0.00" className={inputCls} style={inputStyle} />
            </div>
          </div>
          {form.unitCost && form.sellPrice && (
            <p className="text-xs" style={{ color: '#6B7280' }}>
              Margin: <strong style={{ color: '#111827' }}>
                {((parseFloat(form.sellPrice) - parseFloat(form.unitCost)) / parseFloat(form.sellPrice) * 100).toFixed(1)}%
              </strong>
            </p>
          )}
        </fieldset>

        <ModalActions onClose={onClose} isPending={isPending} submitLabel="Save changes" />
      </form>
    </Modal>
  )
}

// ─── Restock modal ────────────────────────────────────────────────────────────

function RestockModal({ item, onClose }: { item: InventoryItem; onClose: () => void }) {
  const { mutate, isPending, error } = useRestockItem()
  const [form, setForm] = useState({
    addQty: '', unitCost: item.unitCost != null ? String(item.unitCost) : '',
    expiryDate: '', batchNumber: '',
  })

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    mutate({
      id:               item.id,
      addQty:           parseFloat(form.addQty),
      reorderThreshold: item.reorderThreshold,
      unitCost:         form.unitCost   ? parseFloat(form.unitCost)  : null,
      expiryDate:       form.expiryDate  || null,
      batchNumber:      form.batchNumber || null,
    }, { onSuccess: onClose })
  }

  return (
    <Modal title={`Restock — ${item.name}`} onClose={onClose}>
      <p className="text-xs mb-4" style={{ color: '#6B7280' }}>
        Current stock: <strong style={{ color: '#111827' }}>{item.stockQty} {item.unit}</strong>
      </p>
      <form onSubmit={submit} className="flex flex-col gap-4">
        {error && <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#991B1B' }}>{(error as Error).message}</p>}
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Qty received ({item.unit}) *</label>
          <input required type="number" min="0.1" step="0.1" value={form.addQty} onChange={f('addQty')} placeholder="0" className={inputCls} style={inputStyle} />
          {form.addQty && <p className="text-xs mt-1" style={{ color: '#6B7280' }}>New total: <strong style={{ color: '#111827' }}>{(item.stockQty + parseFloat(form.addQty || '0')).toFixed(1)} {item.unit}</strong></p>}
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>New cost per unit (AED)</label>
          <input type="number" min="0" step="0.01" value={form.unitCost} onChange={f('unitCost')} placeholder="0.00" className={inputCls} style={inputStyle} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>New expiry date</label>
            <input type="date" value={form.expiryDate} onChange={f('expiryDate')} className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Batch / lot #</label>
            <input type="text" value={form.batchNumber} onChange={f('batchNumber')} placeholder="LOT-2026-07" className={inputCls} style={inputStyle} />
          </div>
        </div>
        <ModalActions onClose={onClose} isPending={isPending} submitLabel="Confirm restock" />
      </form>
    </Modal>
  )
}

// ─── Batches modal ────────────────────────────────────────────────────────────

function BatchesModal({ item, onClose }: { item: InventoryItem; onClose: () => void }) {
  const { data: batches, isLoading } = useInventoryBatches(item.id)

  return (
    <Modal title={`Batches — ${item.name}`} onClose={onClose}>
      <p className="text-xs mb-4" style={{ color: '#6B7280' }}>
        Each restock is tracked as its own lot, consumed oldest-expiry-first (FEFO) when orders are confirmed.
      </p>
      {isLoading ? (
        <p className="text-sm text-center py-8" style={{ color: '#9CA3AF' }}>Loading…</p>
      ) : batches.length === 0 ? (
        <p className="text-sm text-center py-8" style={{ color: '#9CA3AF' }}>No batches with remaining stock.</p>
      ) : (
        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                {['Qty', 'Expiry', 'Batch #', 'Cost', 'Received'].map((col) => (
                  <th key={col} className="py-2 px-3 text-left text-xs font-semibold uppercase tracking-[0.1em]" style={{ color: '#6B7280' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {batches.map((b, idx) => (
                <tr key={b.id} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#FAFAF9', borderTop: '1px solid #E5E7EB' }}>
                  <td className="py-2 px-3 font-semibold" style={{ color: '#111827' }}>{b.qty} {item.unit}</td>
                  <td className="py-2 px-3"><ExpiryBadge date={b.expiryDate} /></td>
                  <td className="py-2 px-3 text-xs font-mono" style={{ color: '#6B7280' }}>{b.batchNumber ?? '—'}</td>
                  <td className="py-2 px-3 text-xs" style={{ color: '#374151' }}>{b.unitCost != null ? `AED ${b.unitCost}` : '—'}</td>
                  <td className="py-2 px-3 text-xs" style={{ color: '#9CA3AF' }}>{timeAgo(b.receivedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex justify-end pt-5">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#F3F4F6] transition-colors" style={{ color: '#374151', border: '1px solid #E5E7EB' }}>Close</button>
      </div>
    </Modal>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type SortKey = 'name' | 'stockQty' | 'expiryDate' | 'value'

export default function InventoryPage() {
  const supplierId       = useAppStore(selectEntityId) ?? undefined
  const { data: items }  = useInventory(supplierId)
  const stats            = useInventoryStats(supplierId)

  const [showAdd, setShowAdd]         = useState(false)
  const [editItem, setEditItem]       = useState<InventoryItem | null>(null)
  const [restockItem, setRestockItem] = useState<InventoryItem | null>(null)
  const [batchesItem, setBatchesItem] = useState<InventoryItem | null>(null)
  const [search, setSearch]           = useState('')
  const [category, setCategory]       = useState('All')
  const [sortKey, setSortKey]         = useState<SortKey>('expiryDate')

  // Derived stats
  const totalCostValue = items.reduce((s, i) => s + (i.unitCost ?? 0) * i.stockQty, 0)
  const expiringCount  = items.filter((i) => { const d = daysUntilExpiry(i.expiryDate); return d !== null && d <= 3 }).length

  const filtered = useMemo(() => {
    let list = items
    if (search)       list = list.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()) || (i.batchNumber ?? '').toLowerCase().includes(search.toLowerCase()))
    if (category !== 'All') list = list.filter((i) => i.category === category)
    return [...list].sort((a, b) => {
      switch (sortKey) {
        case 'name':       return a.name.localeCompare(b.name)
        case 'stockQty':   return b.stockQty - a.stockQty
        case 'value':      return ((b.unitCost ?? 0) * b.stockQty) - ((a.unitCost ?? 0) * a.stockQty)
        case 'expiryDate': {
          if (!a.expiryDate && !b.expiryDate) return 0
          if (!a.expiryDate) return 1
          if (!b.expiryDate) return -1
          return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
        }
      }
    })
  }, [items, search, category, sortKey])

  return (
    <div className="flex flex-col gap-8 font-sans">

      {showAdd && supplierId && <AddItemModal supplierId={supplierId} onClose={() => setShowAdd(false)} />}
      {editItem    && <EditModal    item={editItem}    onClose={() => setEditItem(null)} />}
      {restockItem && <RestockModal item={restockItem} onClose={() => setRestockItem(null)} />}
      {batchesItem && <BatchesModal item={batchesItem} onClose={() => setBatchesItem(null)} />}

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-1" style={{ color: '#C9943E' }}>Inventory</p>
          <h1 className="font-display italic font-semibold leading-none" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#111827' }}>
            Stock management
          </h1>
        </div>
        <button onClick={() => setShowAdd(true)} className="px-4 py-2 rounded-lg text-sm font-semibold bg-creek-500 text-white hover:opacity-90 transition-opacity" type="button">
          + Add item
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total SKUs',      value: String(stats.total),                  color: '#1D3A50' },
          { label: 'In Stock',        value: String(stats.inStock),                color: '#2D6A4F' },
          { label: 'Low Stock',       value: String(stats.lowStock),               color: '#D97706' },
          { label: 'Out of Stock',    value: String(stats.outOfStock),             color: '#EF4444' },
          { label: 'Inventory Value', value: formatAED(totalCostValue, true),      color: '#1D3A50' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl p-5 bg-white" style={{ border: '1px solid #E5E7EB' }}>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] mb-2" style={{ color: '#6B7280' }}>{label}</p>
            <p className="font-display font-semibold leading-none" style={{ fontSize: '1.8rem', color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Alert banners */}
      {expiringCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl px-5 py-4 text-sm" style={{ backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', color: '#92400E' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <strong>{expiringCount} item{expiringCount !== 1 ? 's' : ''} expiring within 3 days</strong> — prioritise these for dispatch (FEFO).
        </div>
      )}
      {stats.outOfStock > 0 && (
        <div className="flex items-center gap-3 rounded-xl px-5 py-4 text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.25)', color: '#991B1B' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <strong>{stats.outOfStock} item{stats.outOfStock !== 1 ? 's' : ''} out of stock</strong> — restock to avoid order failures.
        </div>
      )}

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search items or batch…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
            style={{ border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', color: '#111827', width: '220px' }}
          />
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              type="button"
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
              style={{
                backgroundColor: category === c ? '#1D3A50' : '#ffffff',
                color: category === c ? '#ffffff' : '#6B7280',
                border: '1px solid #E5E7EB',
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: '#6B7280' }}>Sort:</span>
          {([['expiryDate', 'Expiry (FEFO)'], ['stockQty', 'Qty'], ['value', 'Value'], ['name', 'Name']] as [SortKey, string][]).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setSortKey(k)}
              type="button"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              style={{
                backgroundColor: sortKey === k ? 'rgba(29,58,80,0.08)' : 'transparent',
                color: sortKey === k ? '#1D3A50' : '#9CA3AF',
                border: sortKey === k ? '1px solid rgba(29,58,80,0.2)' : '1px solid transparent',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <section aria-label="Inventory items">
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                {['Item', 'Category', 'Stock', 'Cost / Sell (AED)', 'Margin', 'Stock Value', 'Expiry', 'Batch', 'Status', ''].map((col) => (
                  <th key={col} className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-[0.1em] whitespace-nowrap" style={{ color: '#6B7280' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="py-12 text-center text-sm" style={{ color: '#6B7280' }}>
                  {items.length === 0 ? 'No inventory items yet. Add your first item.' : 'No items match your filters.'}
                </td></tr>
              ) : filtered.map((item, idx) => {
                const s        = STATUS_STYLE[item.status]
                const value    = (item.unitCost ?? 0) * item.stockQty
                const days     = daysUntilExpiry(item.expiryDate)
                const expiring = days !== null && days <= 2
                return (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-[#F9FAFB]"
                    style={{
                      backgroundColor: expiring ? 'rgba(245,158,11,0.03)' : idx % 2 === 0 ? '#ffffff' : '#FAFAF9',
                      borderTop: '1px solid #E5E7EB',
                      borderLeft: item.status === 'Out of Stock' ? '3px solid #EF4444'
                        : item.status === 'Low Stock' ? '3px solid #D97706'
                        : expiring ? '3px solid #D97706'
                        : '3px solid transparent',
                    }}
                  >
                    <td className="py-3 px-4 font-semibold" style={{ color: '#111827' }}>{item.name}</td>
                    <td className="py-3 px-4 text-xs" style={{ color: '#6B7280' }}>{item.category}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1 min-w-[60px]">
                        <span className="font-semibold text-xs" style={{ color: item.stockQty === 0 ? '#EF4444' : '#111827' }}>
                          {item.stockQty} {item.unit}
                        </span>
                        <div className="w-14 h-1 rounded-full overflow-hidden" style={{ backgroundColor: '#E5E7EB' }}>
                          <div className="h-full rounded-full" style={{
                            width: `${Math.min(100, (item.stockQty / Math.max(item.reorderThreshold * 3, 1)) * 100).toFixed(0)}%`,
                            backgroundColor: item.stockQty === 0 ? '#EF4444' : item.stockQty <= item.reorderThreshold ? '#D97706' : '#2D6A4F',
                          }} />
                        </div>
                        <span className="text-[10px]" style={{ color: '#9CA3AF' }}>reorder &lt; {item.reorderThreshold}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {item.unitCost != null || item.sellPrice != null ? (
                        <div className="flex flex-col gap-0.5">
                          <span style={{ color: '#374151' }}>{item.unitCost != null ? `AED ${item.unitCost}` : '—'}</span>
                          <span style={{ color: '#9CA3AF' }}>{item.sellPrice != null ? `AED ${item.sellPrice}` : '—'}</span>
                        </div>
                      ) : (
                        <span style={{ color: '#9CA3AF' }}>—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <MarginBadge unitCost={item.unitCost} sellPrice={item.sellPrice} />
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold" style={{ color: value > 0 ? '#111827' : '#9CA3AF' }}>
                      {value > 0 ? formatAED(value, true) : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <ExpiryBadge date={item.expiryDate} />
                    </td>
                    <td className="py-3 px-4 text-xs font-mono" style={{ color: '#6B7280' }}>
                      {item.batchNumber ?? '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap" style={{ backgroundColor: s.bg, color: s.text }}>
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.dot }} />
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setRestockItem(item)}
                          type="button"
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-md text-white bg-creek-500 hover:opacity-90 transition-opacity whitespace-nowrap"
                        >
                          + Restock
                        </button>
                        <button
                          onClick={() => setBatchesItem(item)}
                          type="button"
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-md transition-colors hover:bg-[#F3F4F6] whitespace-nowrap"
                          style={{ color: '#1D3A50', border: '1px solid #E5E7EB' }}
                        >
                          Batches
                        </button>
                        <button
                          onClick={() => setEditItem(item)}
                          type="button"
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-md transition-colors hover:bg-[#F3F4F6] whitespace-nowrap"
                          style={{ color: '#1D3A50', border: '1px solid #E5E7EB' }}
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr style={{ backgroundColor: '#F9FAFB', borderTop: '2px solid #E5E7EB' }}>
                  <td colSpan={5} className="py-3 px-4 text-xs font-semibold text-right" style={{ color: '#6B7280' }}>Total inventory value</td>
                  <td className="py-3 px-4 text-xs font-bold" style={{ color: '#1D3A50' }}>{formatAED(totalCostValue, true)}</td>
                  <td colSpan={4} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        <p className="mt-2 text-xs" style={{ color: '#9CA3AF' }}>
          {filtered.length} of {items.length} items · sorted by {sortKey === 'expiryDate' ? 'expiry (FEFO)' : sortKey}
        </p>
      </section>
    </div>
  )
}
