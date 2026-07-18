'use client'

import { useOrders, useUpdateOrderStatus } from '@/hooks/useOrders'
import { useAppStore, selectEntityId } from '@/store/useAppStore'
import { formatAED, timeAgo } from '@/lib/utils'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { OrderStatus } from '@/types'

const STATUS_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  Delivered: { bg: 'rgba(74,124,92,0.10)',  text: '#2D6A4F', dot: '#2D6A4F' },
  Confirmed: { bg: 'rgba(29,58,80,0.08)',   text: '#1D3A50', dot: '#1D3A50' },
  Pending:   { bg: 'rgba(245,158,11,0.10)', text: '#92400E', dot: '#D97706' },
  Cancelled: { bg: 'rgba(239,68,68,0.10)',  text: '#991B1B', dot: '#EF4444' },
}

const FILTERS: (OrderStatus | 'All')[] = ['All', 'Pending', 'Confirmed', 'Delivered', 'Cancelled']

export default function SupplierOrdersPage() {
  const router                  = useRouter()
  const supplierId              = useAppStore(selectEntityId) ?? undefined
  const { data: allOrders }     = useOrders({ supplierId })
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus()
  const [filter, setFilter]     = useState<OrderStatus | 'All'>('All')

  const orders = filter === 'All' ? allOrders : allOrders.filter((o) => o.status === filter)

  const counts = FILTERS.reduce<Record<string, number>>((acc, f) => {
    acc[f] = f === 'All' ? allOrders.length : allOrders.filter((o) => o.status === f).length
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-8 font-sans">

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-1" style={{ color: '#C9943E' }}>
          Supplier
        </p>
        <h1 className="font-display italic font-semibold leading-none" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#111827' }}>
          Incoming Orders
        </h1>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-1.5 rounded-full text-sm font-semibold transition-colors"
            style={{
              backgroundColor: filter === f ? '#1D3A50' : '#ffffff',
              color: filter === f ? '#ffffff' : '#6B7280',
              border: '1px solid #E5E7EB',
            }}
          >
            {f} <span style={{ opacity: 0.6 }}>({counts[f]})</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-x-auto" style={{ border: '1px solid #E5E7EB' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              {['Order', 'Restaurant', 'Items', 'Amount', 'Received', 'Status', ''].map((col) => (
                <th key={col} className="py-3 px-5 text-left text-xs font-semibold uppercase tracking-[0.1em]" style={{ color: '#6B7280' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-sm" style={{ color: '#6B7280' }}>
                  No orders in this status.
                </td>
              </tr>
            ) : orders.map((order, idx) => {
              const s = STATUS_STYLE[order.status] ?? STATUS_STYLE.Pending
              return (
                <tr
                  key={order.id}
                  onClick={() => router.push(`/supplier/dashboard/orders/${order.id}`)}
                  className="hover:bg-[#F9FAFB] transition-colors cursor-pointer"
                  style={{
                    backgroundColor: idx % 2 === 0 ? '#ffffff' : '#FAFAF9',
                    borderTop: '1px solid #E5E7EB',
                    borderLeft: order.status === 'Pending' ? '3px solid #D97706' : '3px solid transparent',
                  }}
                >
                  <td className="py-3.5 px-5 font-semibold" style={{ color: '#111827' }}>#{order.id}</td>
                  <td className="py-3.5 px-5" style={{ color: '#374151' }}>{order.restaurantName}</td>
                  <td className="py-3.5 px-5 text-xs" style={{ color: '#6B7280' }}>
                    {order.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}
                  </td>
                  <td className="py-3.5 px-5 font-semibold" style={{ color: '#111827' }}>{formatAED(order.amount)}</td>
                  <td className="py-3.5 px-5 text-xs" style={{ color: '#6B7280' }}>{timeAgo(order.createdAt)}</td>
                  <td className="py-3.5 px-5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: s.bg, color: s.text }}>
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.dot }} />
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5" onClick={(e) => e.stopPropagation()}>
                    {order.status === 'Pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateStatus({ id: order.id, status: 'Confirmed' })}
                          disabled={isPending}
                          className="text-xs font-semibold px-3 py-1.5 rounded-md text-white bg-creek-500 hover:opacity-90 transition-opacity disabled:opacity-60"
                          type="button"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => updateStatus({ id: order.id, status: 'Cancelled' })}
                          disabled={isPending}
                          className="text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-[#FEF2F2] transition-colors disabled:opacity-60"
                          style={{ color: '#991B1B', border: '1px solid #FECACA' }}
                          type="button"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    {order.status === 'Confirmed' && (
                      <button
                        onClick={() => updateStatus({ id: order.id, status: 'Delivered' })}
                        disabled={isPending}
                        className="text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-[#F3F4F6] transition-colors disabled:opacity-60"
                        style={{ color: '#2D6A4F', border: '1px solid #BBF7D0' }}
                        type="button"
                      >
                        Mark delivered
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
