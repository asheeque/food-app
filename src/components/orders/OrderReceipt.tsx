'use client'

import { formatAED, formatDateTime } from '@/lib/utils'
import { VAT_RATE } from '@/hooks/useOrders'
import Link from 'next/link'
import type { Order } from '@/types'

export const ORDER_STATUS_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  Delivered: { bg: 'rgba(74,124,92,0.10)',  text: '#2D6A4F', dot: '#2D6A4F' },
  Confirmed: { bg: 'rgba(29,58,80,0.08)',   text: '#1D3A50', dot: '#1D3A50' },
  Pending:   { bg: 'rgba(245,158,11,0.10)', text: '#92400E', dot: '#D97706' },
  Cancelled: { bg: 'rgba(239,68,68,0.10)',  text: '#991B1B', dot: '#EF4444' },
}

interface Counterparty {
  role: string
  name: string
  contact?: string | null
  whatsapp?: string | null
  rating?: number
  onTimeRate?: number
}

export function OrderReceipt({
  order,
  roleLabel,
  backHref,
  counterparty,
  actions,
}: {
  order: Order
  roleLabel: string
  backHref: string
  counterparty: Counterparty | null
  actions?: React.ReactNode
}) {
  const s = ORDER_STATUS_STYLE[order.status] ?? ORDER_STATUS_STYLE.Pending
  const subtotal = order.amount - order.taxAmount

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div>
        <Link
          href={backHref}
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
            <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-1" style={{ color: '#C9943E' }}>{roleLabel}</p>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-display italic font-semibold leading-none" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', color: '#111827' }}>
                #{order.id}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: s.bg, color: s.text }}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.dot }} />
                {order.status}
              </span>
            </div>
            <p className="text-sm" style={{ color: '#6B7280' }}>{formatDateTime(order.createdAt)}</p>
          </div>
          {actions}
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Items + totals — 3 cols */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <section className="rounded-xl overflow-hidden bg-white" style={{ border: '1px solid #E5E7EB' }} aria-label="Order items">
            <div className="px-5 py-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
              <h2 className="text-sm font-semibold" style={{ color: '#111827' }}>Items</h2>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  {['Item', 'Qty', 'Unit price', 'Line total'].map((col) => (
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
                    <td className="py-3 px-5 text-xs" style={{ color: '#374151' }}>{item.qty} {item.unit}</td>
                    <td className="py-3 px-5 text-xs" style={{ color: '#6B7280' }}>
                      {item.unitPrice != null ? formatAED(item.unitPrice) : '—'}
                    </td>
                    <td className="py-3 px-5 text-xs font-semibold" style={{ color: '#111827' }}>
                      {item.unitPrice != null ? formatAED(item.unitPrice * item.qty) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid #E5E7EB' }}>
                  <td colSpan={3} className="py-2 px-5 text-xs font-semibold text-right" style={{ color: '#6B7280' }}>Subtotal</td>
                  <td className="py-2 px-5 text-xs font-semibold" style={{ color: '#374151' }}>{formatAED(subtotal)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="py-2 px-5 text-xs font-semibold text-right" style={{ color: '#6B7280' }}>VAT ({(VAT_RATE * 100).toFixed(0)}%)</td>
                  <td className="py-2 px-5 text-xs font-semibold" style={{ color: '#374151' }}>{formatAED(order.taxAmount)}</td>
                </tr>
                <tr style={{ borderTop: '1px solid #E5E7EB' }}>
                  <td colSpan={3} className="py-3 px-5 text-sm font-semibold text-right" style={{ color: '#111827' }}>Total</td>
                  <td className="py-3 px-5 font-bold" style={{ color: '#1D3A50' }}>{formatAED(order.amount)}</td>
                </tr>
              </tfoot>
            </table>
            </div>
          </section>
        </div>

        {/* Delivery + counterparty — 2 cols */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <section className="rounded-xl p-5 bg-white" style={{ border: '1px solid #E5E7EB' }} aria-label="Delivery address">
            <h2 className="text-sm font-semibold mb-3" style={{ color: '#111827' }}>Deliver to</h2>
            <p className="text-sm" style={{ color: '#374151' }}>{order.deliveryAddress ?? '—'}</p>
          </section>

          {counterparty && (
            <section className="rounded-xl p-5 bg-white" style={{ border: '1px solid #E5E7EB' }} aria-label={counterparty.role}>
              <h2 className="text-sm font-semibold mb-4" style={{ color: '#111827' }}>{counterparty.role}</h2>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-creek-500 shrink-0 flex items-center justify-center text-white text-xs font-bold">
                  {counterparty.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#111827' }}>{counterparty.name}</p>
                  {counterparty.whatsapp && <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{counterparty.whatsapp}</p>}
                  {counterparty.rating != null && (
                    <div className="flex items-center gap-1 mt-1">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="#C9943E" stroke="none">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                      </svg>
                      <span className="text-xs font-semibold" style={{ color: '#111827' }}>{counterparty.rating}</span>
                      {counterparty.onTimeRate != null && <span className="text-xs" style={{ color: '#9CA3AF' }}>· {counterparty.onTimeRate}% on-time</span>}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          <section className="rounded-xl p-5 bg-white" style={{ border: '1px solid #E5E7EB' }} aria-label="Order info">
            <h2 className="text-sm font-semibold mb-3" style={{ color: '#111827' }}>Order info</h2>
            <dl className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between"><dt style={{ color: '#9CA3AF' }}>Source</dt><dd style={{ color: '#374151' }}>{order.source}</dd></div>
              <div className="flex justify-between"><dt style={{ color: '#9CA3AF' }}>Placed</dt><dd style={{ color: '#374151' }}>{formatDateTime(order.createdAt)}</dd></div>
              <div className="flex justify-between"><dt style={{ color: '#9CA3AF' }}>Last updated</dt><dd style={{ color: '#374151' }}>{formatDateTime(order.updatedAt)}</dd></div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  )
}
