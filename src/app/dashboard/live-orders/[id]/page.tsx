'use client'

import { useOrder, useUpdateOrderStatus } from '@/hooks/useOrders'
import { useRestaurant } from '@/hooks/useRestaurants'
import { useSupplier } from '@/hooks/useSuppliers'
import { formatAED, formatDateTime } from '@/lib/utils'
import Link from 'next/link'

const STATUS_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  Delivered: { bg: 'rgba(74,124,92,0.10)',  text: '#2D6A4F', dot: '#2D6A4F' },
  Confirmed: { bg: 'rgba(29,58,80,0.08)',   text: '#1D3A50', dot: '#1D3A50' },
  Pending:   { bg: 'rgba(245,158,11,0.10)', text: '#92400E', dot: '#D97706' },
  Cancelled: { bg: 'rgba(239,68,68,0.10)',  text: '#991B1B', dot: '#EF4444' },
}

const TIMELINE = [
  { label: 'Received',         done: true  },
  { label: 'AI Parsed',        done: true  },
  { label: 'Awaiting Confirm', done: false },
  { label: 'Forwarded',        done: false },
  { label: 'Delivered',        done: false },
]

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const { data: order }          = useOrder(id)
  const { data: restaurant }     = useRestaurant(order?.restaurantId ?? '')
  const { data: supplier }       = useSupplier(order?.supplierId ?? '')
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus()

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-24 font-sans">
        <p className="text-sm font-semibold mb-2" style={{ color: '#111827' }}>Order not found</p>
        <Link href="/dashboard/live-orders" className="text-sm font-semibold hover:underline" style={{ color: '#1D3A50' }}>
          ← Back to orders
        </Link>
      </div>
    )
  }

  const s = STATUS_STYLE[order.status] ?? STATUS_STYLE.Pending
  const timelineDone = order.status === 'Delivered' ? 5
    : order.status === 'Confirmed' ? 3
    : order.status === 'Pending' ? 2 : 1

  return (
    <div className="flex flex-col gap-6 font-sans">

      {/* Back + header */}
      <div>
        <Link
          href="/dashboard/live-orders"
          className="inline-flex items-center gap-1.5 text-sm font-semibold mb-4 hover:underline"
          style={{ color: '#6B7280' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back to orders
        </Link>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-display italic font-semibold leading-none" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', color: '#111827' }}>
                #{order.id}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: s.bg, color: s.text }}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.dot }} />
                {order.status}
              </span>
            </div>
            <p className="text-sm" style={{ color: '#6B7280' }}>
              {order.restaurantName} · {formatDateTime(order.createdAt)}
            </p>
          </div>
          {order.status === 'Pending' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateStatus({ id: order.id, status: 'Confirmed' })}
                disabled={isPending}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-creek-500 hover:opacity-90 transition-opacity disabled:opacity-60"
                type="button"
              >
                {isPending ? 'Saving…' : 'Confirm order'}
              </button>
              <button
                onClick={() => updateStatus({ id: order.id, status: 'Cancelled' })}
                disabled={isPending}
                className="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#FEF2F2] transition-colors disabled:opacity-60"
                style={{ color: '#991B1B', border: '1px solid #FECACA' }}
                type="button"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">

        {/* Left — 3 cols */}
        <div className="lg:col-span-3 flex flex-col gap-6">

          {/* AI-parsed items */}
          <section className="rounded-xl overflow-hidden bg-white" style={{ border: '1px solid #E5E7EB' }} aria-label="Order items">
            <div className="px-5 py-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold" style={{ color: '#111827' }}>AI-Parsed Items</h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(29,58,80,0.08)', color: '#1D3A50' }}>
                  {order.source}
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  {['Item', 'Qty', 'Unit', 'Confidence'].map((col) => (
                    <th key={col} className="py-2.5 px-5 text-left text-xs font-semibold uppercase tracking-[0.1em]" style={{ color: '#6B7280' }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={item.id} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#FAFAF9', borderTop: '1px solid #E5E7EB' }}>
                    <td className="py-3 px-5 font-medium" style={{ color: '#111827' }}>{item.name}</td>
                    <td className="py-3 px-5" style={{ color: '#374151' }}>{item.qty}</td>
                    <td className="py-3 px-5 text-xs" style={{ color: '#6B7280' }}>{item.unit}</td>
                    <td className="py-3 px-5">
                      {item.confidence != null ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#E5E7EB' }}>
                            <div className="h-full rounded-full" style={{ width: `${(item.confidence * 100).toFixed(0)}%`, backgroundColor: item.confidence >= 0.9 ? '#2D6A4F' : '#D97706' }} />
                          </div>
                          <span className="text-xs font-semibold" style={{ color: item.confidence >= 0.9 ? '#2D6A4F' : '#D97706' }}>
                            {(item.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: '#9CA3AF' }}>Manual</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid #E5E7EB' }}>
                  <td colSpan={3} className="py-3 px-5 text-sm font-semibold text-right" style={{ color: '#6B7280' }}>Total</td>
                  <td className="py-3 px-5 font-semibold" style={{ color: '#1D3A50' }}>{formatAED(order.amount)}</td>
                </tr>
              </tfoot>
            </table>
            </div>
          </section>

          {/* Timeline */}
          <section className="rounded-xl p-6 bg-white" style={{ border: '1px solid #E5E7EB' }} aria-label="Order timeline">
            <h2 className="text-sm font-semibold mb-5" style={{ color: '#111827' }}>Order Timeline</h2>
            <ol className="relative flex flex-col gap-0">
              {TIMELINE.map(({ label }, i) => {
                const done = i < timelineDone
                const current = i === timelineDone - 1
                return (
                  <li key={label} className="flex items-start gap-4 pb-5 last:pb-0">
                    <div className="flex flex-col items-center shrink-0">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10"
                        style={{
                          backgroundColor: done ? '#1D3A50' : '#F3F4F6',
                          border: current ? '2px solid #C9943E' : 'none',
                        }}
                      >
                        {done && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </div>
                      {i < TIMELINE.length - 1 && (
                        <div className="w-0.5 flex-1 mt-1" style={{ backgroundColor: done ? '#1D3A50' : '#E5E7EB', minHeight: '20px' }} />
                      )}
                    </div>
                    <div className="pt-1">
                      <p className="text-sm font-semibold" style={{ color: done ? '#111827' : '#9CA3AF' }}>{label}</p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </section>

        </div>

        {/* Right — 2 cols */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* WhatsApp voice note */}
          <section className="rounded-xl p-5 bg-white" style={{ border: '1px solid #E5E7EB' }} aria-label="WhatsApp message">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold" style={{ color: '#111827' }}>WhatsApp {order.source}</h2>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'rgba(74,124,92,0.10)', color: '#2D6A4F' }}
              >
                Parsed
              </span>
            </div>
            {order.source === 'WhatsApp' && (
              <div className="flex items-center gap-1 mb-4" aria-label="Voice waveform" aria-hidden="true">
                {Array.from({ length: 28 }).map((_, i) => {
                  const h = [3, 5, 8, 12, 16, 20, 18, 14, 10, 7, 12, 18, 22, 18, 14, 10, 16, 20, 15, 11, 8, 14, 18, 12, 8, 5, 3, 2][i] ?? 6
                  return (
                    <div key={i} className="flex-1 rounded-full" style={{ height: `${h * 2}px`, backgroundColor: i < 14 ? '#1D3A50' : '#E5E7EB' }} />
                  )
                })}
              </div>
            )}
            <p className="text-sm leading-relaxed p-3 rounded-lg italic" style={{ backgroundColor: '#F9FAFB', color: '#374151', border: '1px solid #E5E7EB' }}>
              &ldquo;{order.items.map((i) => `${i.qty} ${i.unit} ${i.name}`).join(', ')}&rdquo;
            </p>
          </section>

          {/* Supplier */}
          {supplier && (
            <section className="rounded-xl p-5 bg-white" style={{ border: '1px solid #E5E7EB' }} aria-label="Assigned supplier">
              <h2 className="text-sm font-semibold mb-4" style={{ color: '#111827' }}>Assigned Supplier</h2>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-creek-500 shrink-0 flex items-center justify-center text-white text-xs font-bold">
                  {supplier.businessName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#111827' }}>{supplier.businessName}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{supplier.whatsapp}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="#C9943E" stroke="none">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                    <span className="text-xs font-semibold" style={{ color: '#111827' }}>{supplier.rating}</span>
                    <span className="text-xs" style={{ color: '#9CA3AF' }}>· {supplier.onTimeRate}% on-time</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Restaurant */}
          {restaurant && (
            <section className="rounded-xl p-5 bg-white" style={{ border: '1px solid #E5E7EB' }} aria-label="Restaurant">
              <h2 className="text-sm font-semibold mb-4" style={{ color: '#111827' }}>Restaurant</h2>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-gold shrink-0 flex items-center justify-center text-white text-xs font-bold">
                  {restaurant.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#111827' }}>{restaurant.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{restaurant.zone}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{restaurant.ordersCount} orders total</p>
                </div>
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  )
}
