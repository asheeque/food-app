'use client'

import { useOrders, useOrderStats } from '@/hooks/useOrders'
import { useAppStore, selectEntityId } from '@/store/useAppStore'
import { formatAED, timeAgo } from '@/lib/utils'
import Link from 'next/link'

const STATUS_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  Delivered: { bg: 'rgba(74,124,92,0.10)',  text: '#2D6A4F', dot: '#2D6A4F' },
  Confirmed: { bg: 'rgba(29,58,80,0.08)',   text: '#1D3A50', dot: '#1D3A50' },
  Pending:   { bg: 'rgba(245,158,11,0.10)', text: '#92400E', dot: '#D97706' },
  Cancelled: { bg: 'rgba(239,68,68,0.10)',  text: '#991B1B', dot: '#EF4444' },
}

export default function RestaurantHomePage() {
  const restaurantId    = useAppStore(selectEntityId) ?? 'res-001'
  const { data: orders} = useOrders({ restaurantId })
  const stats           = useOrderStats({ restaurantId })

  const pending   = stats.byStatus['Pending']   ?? 0
  const confirmed = stats.byStatus['Confirmed'] ?? 0
  const delivered = stats.byStatus['Delivered'] ?? 0

  return (
    <div className="flex flex-col gap-8 font-sans">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-1" style={{ color: '#C9943E' }}>
            Restaurant Overview
          </p>
          <h1 className="font-display italic font-semibold leading-none" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#111827' }}>
            Good morning.
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#6B7280' }}>
            Track your orders and manage daily supply requests.
          </p>
        </div>
        <Link
          href="/restaurant/dashboard/place-order"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-creek-500 text-white hover:opacity-90 transition-opacity"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New order
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Spend',  value: formatAED(stats.totalAED, true), sub: 'all time' },
          { label: 'Orders',       value: String(stats.count),              sub: 'all time' },
          { label: 'Pending',      value: String(pending),                  sub: 'awaiting confirmation' },
          { label: 'Delivered',    value: String(delivered),                sub: 'completed' },
        ].map(({ label, value, sub }) => (
          <div
            key={label}
            className="rounded-xl p-5"
            style={{ backgroundColor: '#ffffff', border: '1px solid #E5E7EB' }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] mb-3" style={{ color: '#6B7280' }}>
              {label}
            </p>
            <p className="font-display font-semibold leading-none mb-1" style={{ fontSize: '2.2rem', color: '#1D3A50' }}>
              {value}
            </p>
            <p className="text-[11px]" style={{ color: '#9CA3AF' }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Order status summary */}
      <div className="flex items-center gap-3 flex-wrap">
        {[
          { label: 'Pending',   count: pending,   color: '#D97706' },
          { label: 'Confirmed', count: confirmed, color: '#1D3A50' },
          { label: 'Delivered', count: delivered, color: '#2D6A4F' },
        ].map(({ label, count, color }) => (
          <div
            key={label}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
            style={{ backgroundColor: '#ffffff', border: '1px solid #E5E7EB', color }}
          >
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
            {count} {label}
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <section aria-label="Recent orders">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold" style={{ color: '#111827' }}>Recent Orders</h2>
          <Link
            href="/restaurant/dashboard/orders"
            className="text-xs font-semibold uppercase tracking-[0.12em] hover:underline"
            style={{ color: '#C9943E' }}
          >
            View all →
          </Link>
        </div>

        {orders.length === 0 ? (
          <div
            className="rounded-xl p-10 text-center"
            style={{ backgroundColor: '#ffffff', border: '1px solid #E5E7EB' }}
          >
            <p className="text-sm" style={{ color: '#6B7280' }}>No orders yet. Place your first order to get started.</p>
            <Link
              href="/restaurant/dashboard/place-order"
              className="inline-block mt-4 px-5 py-2.5 rounded-lg text-sm font-semibold bg-creek-500 text-white hover:opacity-90 transition-opacity"
            >
              Place order
            </Link>
          </div>
        ) : (
          <div className="rounded-xl overflow-x-auto" style={{ border: '1px solid #E5E7EB' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  {['Order', 'Supplier', 'Amount', 'Time', 'Status'].map((col) => (
                    <th key={col} className="py-3 px-5 text-left text-xs font-semibold uppercase tracking-[0.1em]" style={{ color: '#6B7280' }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => {
                  const s = STATUS_STYLE[order.status] ?? STATUS_STYLE.Pending
                  return (
                    <tr
                      key={order.id}
                      className="transition-colors hover:bg-[#F9FAFB]"
                      style={{
                        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#FAFAF9',
                        borderTop: '1px solid #E5E7EB',
                        borderLeft: '3px solid #C9943E',
                      }}
                    >
                      <td className="py-3.5 px-5 font-semibold" style={{ color: '#111827' }}>#{order.id}</td>
                      <td className="py-3.5 px-5" style={{ color: '#374151' }}>{order.supplierName}</td>
                      <td className="py-3.5 px-5 font-semibold" style={{ color: '#111827' }}>{formatAED(order.amount)}</td>
                      <td className="py-3.5 px-5 text-xs" style={{ color: '#6B7280' }}>{timeAgo(order.createdAt)}</td>
                      <td className="py-3.5 px-5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: s.bg, color: s.text }}>
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.dot }} />
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* WhatsApp order tip */}
      <div
        className="flex items-start gap-4 rounded-xl p-5"
        style={{ backgroundColor: 'rgba(74,124,92,0.06)', border: '1px solid rgba(74,124,92,0.20)' }}
      >
        <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center" style={{ backgroundColor: '#2D6A4F' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold mb-0.5" style={{ color: '#2D6A4F' }}>Order via WhatsApp</p>
          <p className="text-sm" style={{ color: '#374151' }}>
            Send your order as a voice note or text to our WhatsApp line — our AI will parse it and confirm back within minutes.
          </p>
        </div>
      </div>

    </div>
  )
}
