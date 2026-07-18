'use client'

import { useSuppliers } from '@/hooks/useSuppliers'
import { useInventory } from '@/hooks/useInventory'
import { useCreateOrder, VAT_RATE } from '@/hooks/useOrders'
import { useAppStore } from '@/store/useAppStore'
import { useRestaurant } from '@/hooks/useRestaurants'
import { useRestaurantAddresses } from '@/hooks/useAddresses'
import { formatAED } from '@/lib/utils'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { InventoryItem } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CartLine { item: InventoryItem; qty: number }

type Mode = 'search' | 'supplier'

// ─── Supplier name lookup ─────────────────────────────────────────────────────

function useSupplierMap(suppliers: { id: string; businessName: string }[]) {
  return useMemo(() => Object.fromEntries(suppliers.map((s) => [s.id, s.businessName])), [suppliers])
}

// ─── Floating cart button ─────────────────────────────────────────────────────

function CartBadge({ count, onClick }: { count: number; onClick: () => void }) {
  if (count === 0) return null
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl text-white text-sm font-semibold shadow-lg hover:opacity-90 transition-opacity"
      style={{ backgroundColor: '#1D3A50', borderBottom: '3px solid #C9943E' }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
      View cart · {count} item{count !== 1 ? 's' : ''}
    </button>
  )
}

// ─── Item card ────────────────────────────────────────────────────────────────

function ItemCard({
  item, supplierName, qty, onAdd, onRemove, onQtyChange, lockedSupplierId, onSwitchSupplier,
}: {
  item: InventoryItem
  supplierName: string
  qty: number
  onAdd: () => void
  onRemove: () => void
  onQtyChange: (q: number) => void
  lockedSupplierId: string
  onSwitchSupplier: (newSupplierId: string, itemToAdd: InventoryItem) => void
}) {
  const outOfStock    = item.status === 'Out of Stock'
  const inCart        = qty > 0
  const differentSup  = !!(lockedSupplierId && lockedSupplierId !== item.supplierId)

  return (
    <div
      className="rounded-xl p-4 bg-white transition-all flex flex-col gap-2"
      style={{ border: inCart ? '2px solid #1D3A50' : '1px solid #E5E7EB', opacity: outOfStock ? 0.5 : 1 }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight" style={{ color: '#111827' }}>{item.name}</p>
          <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{item.category}</p>
        </div>
        {item.sellPrice && (
          <p className="text-sm font-bold shrink-0" style={{ color: '#1D3A50' }}>
            AED {item.sellPrice}<span className="text-xs font-normal text-gray-400">/{item.unit}</span>
          </p>
        )}
      </div>

      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium w-fit" style={{ backgroundColor: 'rgba(29,58,80,0.06)', color: '#1D3A50' }}>
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        </svg>
        {supplierName}
      </div>

      <div className="flex items-center justify-between mt-1">
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: item.status === 'In Stock' ? 'rgba(74,124,92,0.10)' : 'rgba(245,158,11,0.10)',
            color: item.status === 'In Stock' ? '#2D6A4F' : '#92400E',
          }}
        >
          {item.stockQty} {item.unit}
        </span>

        {outOfStock ? (
          <span className="text-xs" style={{ color: '#9CA3AF' }}>Out of stock</span>
        ) : differentSup ? (
          <button
            type="button"
            onClick={() => onSwitchSupplier(item.supplierId, item)}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg border hover:bg-[#FFF7ED] transition-colors"
            style={{ color: '#C9943E', borderColor: '#C9943E' }}
          >
            Switch
          </button>
        ) : inCart ? (
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={onRemove} className="w-6 h-6 rounded-full flex items-center justify-center font-bold border hover:bg-[#F3F4F6] transition-colors" style={{ color: '#1D3A50', borderColor: '#E5E7EB' }}>−</button>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={qty}
              onChange={(e) => onQtyChange(parseFloat(e.target.value) || 0)}
              className="w-11 text-center rounded text-sm font-bold outline-none"
              style={{ border: '1px solid #E5E7EB', color: '#1D3A50' }}
            />
            <button type="button" onClick={onAdd} className="w-6 h-6 rounded-full flex items-center justify-center font-bold bg-creek-500 text-white hover:opacity-90">+</button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-creek-500 text-white hover:opacity-90 transition-opacity"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Switch-supplier confirmation dialog ──────────────────────────────────────

function SwitchSupplierDialog({ fromName, toName, onConfirm, onCancel }: {
  fromName: string; toName: string; onConfirm: () => void; onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <p className="font-semibold text-lg mb-2" style={{ color: '#111827' }}>Switch supplier?</p>
        <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
          Your cart has items from <strong>{fromName}</strong>. Switching to <strong>{toName}</strong> will clear your current cart.
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-lg text-sm font-semibold border hover:bg-[#F3F4F6] transition-colors" style={{ color: '#374151', borderColor: '#E5E7EB' }}>Keep cart</button>
          <button type="button" onClick={onConfirm} className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity" style={{ backgroundColor: '#C9943E' }}>Clear & switch</button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PlaceOrderPage() {
  const router = useRouter()
  const { data: suppliers }  = useSuppliers(true)
  const { mutate: createOrder, isPending, error: orderError } = useCreateOrder()

  const entityId           = useAppStore((s) => s.currentUser.entityId)
  const { data: restaurant } = useRestaurant(entityId ?? '')
  const { data: addresses } = useRestaurantAddresses(entityId ?? undefined)
  const [addressId, setAddressId] = useState('')

  const { data: allItems }    = useInventory()           // all suppliers — for search mode
  const supplierMap           = useSupplierMap(suppliers)

  const [mode, setMode]                         = useState<Mode>('search')
  const [search, setSearch]                     = useState('')
  const [categoryFilter, setCategoryFilter]     = useState('All')
  const [browseSupplierId, setBrowseSupplierId] = useState('')
  const { data: supplierItems }                 = useInventory(browseSupplierId || undefined)

  const [cart, setCart]                   = useState<Record<string, number>>({})
  const [lockedSupplierId, setLockedSupplierId] = useState('')
  const [switchPending, setSwitchPending]       = useState<{ toSupplierId: string; itemToAdd: InventoryItem } | null>(null)
  const [showCart, setShowCart]           = useState(false)
  const [submitted, setSubmitted]         = useState(false)

  const cartLines: CartLine[] = allItems
    .filter((i) => (cart[i.id] ?? 0) > 0)
    .map((i) => ({ item: i, qty: cart[i.id] }))

  const cartTotal = cartLines.reduce((s, l) => s + (l.item.sellPrice ?? 0) * l.qty, 0)
  const vatAmount = Math.round(cartTotal * VAT_RATE * 100) / 100
  const grandTotal = Math.round((cartTotal + vatAmount) * 100) / 100
  const lockedSupplierName = supplierMap[lockedSupplierId] ?? ''

  const effectiveAddressId = useMemo(() => {
    if (addressId && addresses.some((a) => a.id === addressId)) return addressId
    return addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? ''
  }, [addressId, addresses])
  const selectedAddress = addresses.find((a) => a.id === effectiveAddressId) ?? null

  const allCategories = useMemo(() => {
    const src = mode === 'search' ? allItems : supplierItems
    return ['All', ...Array.from(new Set(src.map((i) => i.category)))]
  }, [mode, allItems, supplierItems])

  const displayItems = useMemo(() => {
    const src = mode === 'search' ? allItems : supplierItems
    return src
      .filter((i) => !search || i.name.toLowerCase().includes(search.toLowerCase()))
      .filter((i) => categoryFilter === 'All' || i.category === categoryFilter)
      .filter((i) => i.status !== 'Out of Stock' || !!cart[i.id])
  }, [mode, allItems, supplierItems, search, categoryFilter, cart])

  const addToCart = (item: InventoryItem) => {
    if (lockedSupplierId && lockedSupplierId !== item.supplierId) {
      setSwitchPending({ toSupplierId: item.supplierId, itemToAdd: item })
      return
    }
    setLockedSupplierId(item.supplierId)
    setCart((p) => ({ ...p, [item.id]: (p[item.id] ?? 0) + 1 }))
  }

  const removeFromCart = (id: string) => {
    setCart((p) => {
      const next = { ...p }
      next[id] = Math.max(0, (next[id] ?? 1) - 1)
      if (next[id] === 0) delete next[id]
      if (Object.keys(next).length === 0) setLockedSupplierId('')
      return next
    })
  }

  const setCartQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setCart((p) => { const n = { ...p }; delete n[id]; return n })
      if (Object.keys(cart).filter((k) => k !== id).length === 0) setLockedSupplierId('')
    } else {
      setCart((p) => ({ ...p, [id]: qty }))
    }
  }

  const handleSwitchConfirm = () => {
    if (!switchPending) return
    const { toSupplierId, itemToAdd } = switchPending
    setCart({ [itemToAdd.id]: 1 })
    setLockedSupplierId(toSupplierId)
    setSwitchPending(null)
  }

  const handleSubmit = () => {
    if (!entityId || !restaurant || !lockedSupplierId || cartLines.length === 0 || !selectedAddress) return
    createOrder(
      {
        restaurantId:   entityId,
        restaurantName: restaurant.name,
        supplierId:     lockedSupplierId,
        supplierName:   lockedSupplierName,
        deliveryAddress: `${selectedAddress.label} — ${selectedAddress.addressLine}`,
        items: cartLines.map((l) => ({ name: l.item.name, qty: l.qty, unit: l.item.unit, itemId: l.item.id, unitPrice: l.item.sellPrice ?? null })),
      },
      { onSuccess: () => setSubmitted(true) },
    )
  }

  // ── Success ─────────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-24 font-sans gap-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(74,124,92,0.10)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <p className="font-display italic font-semibold text-3xl" style={{ color: '#111827' }}>Order placed.</p>
        <p className="text-sm text-center max-w-xs" style={{ color: '#6B7280' }}>
          {lockedSupplierName} will confirm shortly. Track it in My Orders.
        </p>
        <div className="flex gap-3 mt-2">
          <button onClick={() => router.push('/restaurant/dashboard/orders')} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-creek-500 hover:opacity-90 transition-opacity" type="button">View orders</button>
          <button
            onClick={() => { setSubmitted(false); setCart({}); setLockedSupplierId(''); setBrowseSupplierId(''); setShowCart(false) }}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#F3F4F6] transition-colors"
            style={{ color: '#1D3A50', border: '1px solid #E5E7EB' }}
            type="button"
          >
            Place another
          </button>
        </div>
      </div>
    )
  }

  // ── Main layout ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 font-sans pb-24">

      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-1" style={{ color: '#C9943E' }}>Restaurant</p>
        <h1 className="font-display italic font-semibold leading-none" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#111827' }}>Place Order</h1>
        <p className="mt-1 text-sm" style={{ color: '#6B7280' }}>Search items from any supplier, or browse by supplier.</p>
      </div>

      {orderError && (
        <div className="px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#991B1B', border: '1px solid rgba(239,68,68,0.2)' }}>
          {(orderError as Error).message}
        </div>
      )}

      {/* Mode toggle */}
      <div className="flex rounded-xl p-1 gap-1 w-fit" style={{ backgroundColor: '#F3F4F6' }}>
        {(['search', 'supplier'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setSearch(''); setCategoryFilter('All') }}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{
              backgroundColor: mode === m ? '#ffffff' : 'transparent',
              color: mode === m ? '#1D3A50' : '#9CA3AF',
              boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.10)' : 'none',
            }}
          >
            {m === 'search' ? (
              <span className="flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                Search items
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                </svg>
                Browse by supplier
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Cart locked banner */}
      {lockedSupplierId && cartLines.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: 'rgba(29,58,80,0.06)', border: '1px solid rgba(29,58,80,0.15)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1D3A50" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span style={{ color: '#1D3A50' }}>Cart from <strong>{lockedSupplierName}</strong> · {cartLines.length} item{cartLines.length !== 1 ? 's' : ''}</span>
          <button
            type="button"
            onClick={() => { setCart({}); setLockedSupplierId('') }}
            className="ml-auto text-xs font-semibold hover:underline"
            style={{ color: '#EF4444' }}
          >
            Clear cart
          </button>
        </div>
      )}

      {/* ── SEARCH MODE ─────────────────────────────────────────────────────── */}
      {mode === 'search' && (
        <div className="flex flex-col gap-4">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search tomatoes, chicken, olive oil…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-10 py-3.5 rounded-xl text-sm outline-none transition-colors"
              style={{ border: '2px solid #E5E7EB', backgroundColor: '#ffffff', color: '#111827', fontSize: '15px' }}
              autoFocus
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {allCategories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategoryFilter(c)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
                style={{
                  backgroundColor: categoryFilter === c ? '#1D3A50' : '#ffffff',
                  color: categoryFilter === c ? '#ffffff' : '#6B7280',
                  border: '1px solid #E5E7EB',
                }}
              >
                {c}
              </button>
            ))}
          </div>

          {displayItems.length === 0 ? (
            <p className="text-sm text-center py-10" style={{ color: '#9CA3AF' }}>No items found. Try a different search or category.</p>
          ) : (
            <>
              <p className="text-xs font-semibold" style={{ color: '#9CA3AF' }}>
                {displayItems.length} result{displayItems.length !== 1 ? 's' : ''}
                {search ? ` for "${search}"` : ''}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {displayItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    supplierName={supplierMap[item.supplierId] ?? 'Unknown'}
                    qty={cart[item.id] ?? 0}
                    onAdd={() => addToCart(item)}
                    onRemove={() => removeFromCart(item.id)}
                    onQtyChange={(q) => setCartQty(item.id, q)}
                    lockedSupplierId={lockedSupplierId}
                    onSwitchSupplier={(toId, i) => setSwitchPending({ toSupplierId: toId, itemToAdd: i })}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── SUPPLIER MODE ────────────────────────────────────────────────────── */}
      {mode === 'supplier' && (
        <div className="flex flex-col gap-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {suppliers.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => { setBrowseSupplierId(s.id); setSearch(''); setCategoryFilter('All') }}
                className="text-left rounded-xl p-4 transition-all"
                style={{
                  border: browseSupplierId === s.id ? '2px solid #1D3A50' : '1px solid #E5E7EB',
                  backgroundColor: browseSupplierId === s.id ? 'rgba(29,58,80,0.04)' : '#F9FAFB',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: '#1D3A50' }}>
                    {s.businessName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate" style={{ color: '#111827' }}>{s.businessName}</p>
                    <p className="text-xs truncate" style={{ color: '#9CA3AF' }}>{s.categories.slice(0, 3).join(', ')}</p>
                  </div>
                  {browseSupplierId === s.id && (
                    <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1D3A50" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  )}
                </div>
              </button>
            ))}
          </div>

          {browseSupplierId && (
            <div className="rounded-xl p-5 bg-white" style={{ border: '1px solid #E5E7EB' }}>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Filter items…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
                    style={{ border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', color: '#111827', width: '180px' }}
                  />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {allCategories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategoryFilter(c)}
                      className="px-3 py-1 rounded-full text-xs font-semibold transition-colors"
                      style={{
                        backgroundColor: categoryFilter === c ? '#1D3A50' : '#ffffff',
                        color: categoryFilter === c ? '#ffffff' : '#6B7280',
                        border: '1px solid #E5E7EB',
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {supplierItems.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: '#9CA3AF' }}>This supplier has no inventory listed yet.</p>
              ) : displayItems.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: '#9CA3AF' }}>No items match your filter.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {displayItems.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      supplierName={supplierMap[item.supplierId] ?? ''}
                      qty={cart[item.id] ?? 0}
                      onAdd={() => addToCart(item)}
                      onRemove={() => removeFromCart(item.id)}
                      onQtyChange={(q) => setCartQty(item.id, q)}
                      lockedSupplierId={lockedSupplierId}
                      onSwitchSupplier={(toId, i) => setSwitchPending({ toSupplierId: toId, itemToAdd: i })}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── CART REVIEW DRAWER ───────────────────────────────────────────────── */}
      {showCart && cartLines.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-5 pt-5 pb-3 flex items-center justify-between" style={{ borderBottom: '1px solid #F3F4F6' }}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Order from</p>
                <p className="text-base font-bold" style={{ color: '#111827' }}>{lockedSupplierName}</p>
              </div>
              <button type="button" onClick={() => setShowCart(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F3F4F6]" style={{ color: '#6B7280' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="px-5 py-2 max-h-72 overflow-y-auto">
              {cartLines.map((line, idx) => (
                <div key={line.item.id} className="flex items-center gap-3 py-2.5" style={{ borderTop: idx > 0 ? '1px solid #F3F4F6' : 'none' }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: '#111827' }}>{line.item.name}</p>
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>{line.item.unit}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button type="button" onClick={() => removeFromCart(line.item.id)} className="w-6 h-6 rounded-full flex items-center justify-center text-xs border hover:bg-[#F3F4F6]" style={{ color: '#6B7280', borderColor: '#E5E7EB' }}>−</button>
                    <span className="text-sm font-bold w-6 text-center" style={{ color: '#111827' }}>{line.qty}</span>
                    <button type="button" onClick={() => addToCart(line.item)} className="w-6 h-6 rounded-full flex items-center justify-center text-xs bg-creek-500 text-white hover:opacity-90">+</button>
                  </div>
                  {line.item.sellPrice && (
                    <p className="text-sm font-semibold w-16 text-right" style={{ color: '#1D3A50' }}>{formatAED(line.item.sellPrice * line.qty)}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="px-5 pt-3" style={{ borderTop: '1px solid #F3F4F6' }}>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#374151' }}>Deliver to</label>
              {addresses.length === 0 ? (
                <p className="text-xs px-3 py-2.5 rounded-lg" style={{ backgroundColor: 'rgba(245,158,11,0.08)', color: '#92400E' }}>
                  No saved address yet — add one in Settings before placing an order.
                </p>
              ) : (
                <select
                  value={effectiveAddressId}
                  onChange={(e) => setAddressId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none appearance-none"
                  style={{ border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', color: '#111827' }}
                >
                  {addresses.map((a) => (
                    <option key={a.id} value={a.id}>{a.label} — {a.addressLine}</option>
                  ))}
                </select>
              )}
            </div>

            {cartTotal > 0 && (
              <div className="px-5 py-3 flex flex-col gap-1.5" style={{ borderTop: '1px solid #F3F4F6', marginTop: '0.5rem' }}>
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: '#6B7280' }}>Subtotal</span>
                  <span style={{ color: '#374151' }}>{formatAED(cartTotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: '#6B7280' }}>VAT (5%)</span>
                  <span style={{ color: '#374151' }}>{formatAED(vatAmount)}</span>
                </div>
                <div className="flex items-center justify-between pt-1" style={{ borderTop: '1px solid #F3F4F6' }}>
                  <p className="text-sm font-semibold" style={{ color: '#6B7280' }}>Total</p>
                  <p className="text-xl font-bold" style={{ color: '#1D3A50' }}>{formatAED(grandTotal)}</p>
                </div>
              </div>
            )}

            <div className="px-5 pb-5 pt-2">
              <button
                type="button"
                disabled={isPending || !selectedAddress}
                onClick={handleSubmit}
                className="w-full py-3.5 rounded-xl text-sm font-semibold text-white bg-creek-500 hover:opacity-90 transition-opacity disabled:opacity-60"
                style={{ borderBottom: '3px solid #C9943E' }}
              >
                {isPending ? 'Placing order…' : `Place order · ${cartLines.length} item${cartLines.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Switch supplier confirmation */}
      {switchPending && (
        <SwitchSupplierDialog
          fromName={lockedSupplierName}
          toName={supplierMap[switchPending.toSupplierId] ?? 'new supplier'}
          onConfirm={handleSwitchConfirm}
          onCancel={() => setSwitchPending(null)}
        />
      )}

      {/* Floating cart button */}
      <CartBadge count={cartLines.length} onClick={() => setShowCart(true)} />
    </div>
  )
}
