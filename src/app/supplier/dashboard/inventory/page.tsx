'use client'

import { useInventory, useInventoryStats, useAddInventoryItem, useUpdateInventoryItem } from '@/hooks/useInventory'
import { useAppStore, selectEntityId } from '@/store/useAppStore'
import { timeAgo } from '@/lib/utils'
import { useState } from 'react'
import type { InventoryItem, StockStatus } from '@/types'

const STATUS_STYLE: Record<StockStatus, { bg: string; text: string; dot: string }> = {
  'In Stock':     { bg: 'rgba(74,124,92,0.10)',  text: '#2D6A4F', dot: '#2D6A4F' },
  'Low Stock':    { bg: 'rgba(245,158,11,0.10)', text: '#92400E', dot: '#D97706' },
  'Out of Stock': { bg: 'rgba(239,68,68,0.10)',  text: '#991B1B', dot: '#EF4444' },
}

const UNITS       = ['kg', 'pcs', 'ltrs', 'boxes', 'bunches', 'bags']
const CATEGORIES  = ['Vegetables', 'Fruits', 'Herbs', 'Dairy', 'Eggs', 'Poultry', 'Seafood', 'Spices', 'Dry Goods', 'Beverages', 'Other']

const inputStyle  = { border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', color: '#111827' }
const inputCls    = 'w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-colors focus:border-creek-500 focus:bg-white'

// ── Shared modal shell ───────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl" style={{ border: '1px solid #E5E7EB' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
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

// ── Add item modal ───────────────────────────────────────────────────────────

function AddItemModal({ supplierId, onClose }: { supplierId: string; onClose: () => void }) {
  const { mutate: addItem, isPending, error } = useAddInventoryItem()
  const [form, setForm] = useState({ name: '', category: 'Vegetables', stockQty: '', unit: 'kg', reorderThreshold: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addItem(
      {
        supplierId,
        name:             form.name,
        category:         form.category,
        stockQty:         parseFloat(form.stockQty),
        unit:             form.unit,
        reorderThreshold: parseFloat(form.reorderThreshold),
      },
      { onSuccess: onClose }
    )
  }

  return (
    <Modal title="Add inventory item" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#991B1B' }}>{(error as Error).message}</p>}
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Item name</label>
            <input required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Tomatoes" className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Category</label>
            <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className={inputCls + ' appearance-none'} style={inputStyle}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Unit</label>
            <select value={form.unit} onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))} className={inputCls + ' appearance-none'} style={inputStyle}>
              {UNITS.map((u) => <option key={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Stock qty</label>
            <input required type="number" min="0" step="0.1" value={form.stockQty} onChange={(e) => setForm((p) => ({ ...p, stockQty: e.target.value }))} placeholder="0" className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Reorder at</label>
            <input required type="number" min="0" step="0.1" value={form.reorderThreshold} onChange={(e) => setForm((p) => ({ ...p, reorderThreshold: e.target.value }))} placeholder="0" className={inputCls} style={inputStyle} />
          </div>
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#F3F4F6] transition-colors" style={{ color: '#374151', border: '1px solid #E5E7EB' }}>Cancel</button>
          <button type="submit" disabled={isPending} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-creek-500 hover:opacity-90 transition-opacity disabled:opacity-60">{isPending ? 'Saving…' : 'Add item'}</button>
        </div>
      </form>
    </Modal>
  )
}

// ── Update stock modal ───────────────────────────────────────────────────────

function UpdateModal({ item, onClose }: { item: InventoryItem; onClose: () => void }) {
  const { mutate: updateItem, isPending, error } = useUpdateInventoryItem()
  const [stockQty, setStockQty]               = useState(String(item.stockQty))
  const [reorderThreshold, setReorderThreshold] = useState(String(item.reorderThreshold))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateItem(
      { id: item.id, stockQty: parseFloat(stockQty), reorderThreshold: parseFloat(reorderThreshold) },
      { onSuccess: onClose }
    )
  }

  return (
    <Modal title={`Update — ${item.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#991B1B' }}>{(error as Error).message}</p>}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Stock qty ({item.unit})</label>
            <input required type="number" min="0" step="0.1" value={stockQty} onChange={(e) => setStockQty(e.target.value)} className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#374151' }}>Reorder at ({item.unit})</label>
            <input required type="number" min="0" step="0.1" value={reorderThreshold} onChange={(e) => setReorderThreshold(e.target.value)} className={inputCls} style={inputStyle} />
          </div>
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#F3F4F6] transition-colors" style={{ color: '#374151', border: '1px solid #E5E7EB' }}>Cancel</button>
          <button type="submit" disabled={isPending} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-creek-500 hover:opacity-90 transition-opacity disabled:opacity-60">{isPending ? 'Saving…' : 'Update'}</button>
        </div>
      </form>
    </Modal>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function InventoryPage() {
  const supplierId       = useAppStore(selectEntityId) ?? undefined
  const { data: items }  = useInventory(supplierId)
  const stats            = useInventoryStats(supplierId)

  const [showAdd, setShowAdd]   = useState(false)
  const [editItem, setEditItem] = useState<InventoryItem | null>(null)

  return (
    <div className="flex flex-col gap-8 font-sans">

      {showAdd && supplierId && <AddItemModal supplierId={supplierId} onClose={() => setShowAdd(false)} />}
      {editItem && <UpdateModal item={editItem} onClose={() => setEditItem(null)} />}

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-1" style={{ color: '#C9943E' }}>Inventory</p>
          <h1 className="font-display italic font-semibold leading-none" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#111827' }}>
            Stock management
          </h1>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-creek-500 text-white hover:opacity-90 transition-opacity"
          type="button"
        >
          + Add item
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Items',  value: stats.total,      color: '#1D3A50' },
          { label: 'In Stock',     value: stats.inStock,    color: '#2D6A4F' },
          { label: 'Low Stock',    value: stats.lowStock,   color: '#D97706' },
          { label: 'Out of Stock', value: stats.outOfStock, color: '#EF4444' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl p-5" style={{ backgroundColor: '#ffffff', border: '1px solid #E5E7EB' }}>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] mb-3" style={{ color: '#6B7280' }}>{label}</p>
            <p className="font-display font-semibold leading-none" style={{ fontSize: '2.4rem', color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Alert banner */}
      {stats.outOfStock > 0 && (
        <div className="flex items-center gap-3 rounded-xl px-5 py-4 text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.25)', color: '#991B1B' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <strong>{stats.outOfStock} item{stats.outOfStock !== 1 ? 's' : ''} out of stock</strong> — update quantities or reorder to avoid order failures.
        </div>
      )}

      {/* Table */}
      <section aria-label="Inventory items">
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                {['Item', 'Category', 'Qty', 'Unit', 'Reorder at', 'Updated', 'Status', ''].map((col) => (
                  <th key={col} className="py-3 px-5 text-left text-xs font-semibold uppercase tracking-[0.1em]" style={{ color: '#6B7280' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-sm" style={{ color: '#6B7280' }}>No inventory items yet. Add your first item.</td></tr>
              ) : items.map((item, idx) => {
                const s = STATUS_STYLE[item.status]
                return (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-[#F9FAFB]"
                    style={{
                      backgroundColor: idx % 2 === 0 ? '#ffffff' : '#FAFAF9',
                      borderTop: '1px solid #E5E7EB',
                      borderLeft: item.status === 'Out of Stock' ? '3px solid #EF4444' : item.status === 'Low Stock' ? '3px solid #D97706' : '3px solid transparent',
                    }}
                  >
                    <td className="py-3.5 px-5 font-semibold" style={{ color: '#111827' }}>{item.name}</td>
                    <td className="py-3.5 px-5" style={{ color: '#6B7280' }}>{item.category}</td>
                    <td className="py-3.5 px-5">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold" style={{ color: item.stockQty === 0 ? '#EF4444' : '#111827' }}>{item.stockQty}</span>
                        <div className="w-16 h-1 rounded-full overflow-hidden" style={{ backgroundColor: '#E5E7EB' }}>
                          <div className="h-full rounded-full" style={{ width: `${Math.min(100, (item.stockQty / (item.reorderThreshold * 3)) * 100).toFixed(0)}%`, backgroundColor: item.stockQty === 0 ? '#EF4444' : item.stockQty <= item.reorderThreshold ? '#D97706' : '#2D6A4F' }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-xs" style={{ color: '#6B7280' }}>{item.unit}</td>
                    <td className="py-3.5 px-5 text-xs" style={{ color: '#6B7280' }}>{item.reorderThreshold}</td>
                    <td className="py-3.5 px-5 text-xs" style={{ color: '#6B7280' }}>{timeAgo(item.updatedAt)}</td>
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap" style={{ backgroundColor: s.bg, color: s.text }}>
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.dot }} />
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <button onClick={() => setEditItem(item)} className="text-xs font-semibold px-3 py-1.5 rounded-md transition-colors hover:bg-[#F3F4F6]" style={{ color: '#1D3A50', border: '1px solid #E5E7EB' }} type="button">
                        Update
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
