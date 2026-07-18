'use client'

import { useOrders } from '@/hooks/useOrders'
import { formatAED, timeAgo } from '@/lib/utils'
import Link from 'next/link'
import type { OrderStatus } from '@/types'

const STAGES: { key: OrderStatus; dot: string; colBg: string }[] = [
  { key: 'Pending',   dot: 'bg-amber-400',   colBg: 'bg-amber-50/60'   },
  { key: 'Confirmed', dot: 'bg-blue-400',    colBg: 'bg-blue-50/60'    },
  { key: 'Delivered', dot: 'bg-emerald-400', colBg: 'bg-emerald-50/60' },
  { key: 'Cancelled', dot: 'bg-stone-300',   colBg: 'bg-stone-50/60'   },
]

export default function LiveOrdersPage() {
  const { data: orders, isLoading } = useOrders()

  const columns = STAGES.map((s) => ({
    ...s,
    orders: orders.filter((o) => o.status === s.key),
  }))

  return (
    <div className="h-full flex flex-col gap-6 font-sans">

      {/* Header */}
      <div className="flex items-end justify-between pb-5 border-b" style={{ borderColor: '#E5E7EB' }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: '#6B7280' }}>Live Orders</p>
            <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#22c55e' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
              LIVE
            </span>
          </div>
          <h1 className="font-display italic font-semibold leading-none" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: '#111827' }}>
            Order Pipeline
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#6B7280' }}>
            {isLoading ? 'Loading…' : `${orders.length} total orders`}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {STAGES.map((s) => (
            <div key={s.key} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: '#F3F4F6', color: '#374151' }}>
              <span className={`w-2 h-2 rounded-full ${s.dot}`} />
              {columns.find((c) => c.key === s.key)?.orders.length ?? 0} {s.key}
            </div>
          ))}
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4 min-h-0">
        {columns.map((col) => (
          <div key={col.key} className="flex flex-col rounded-xl overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>

            {/* Column header */}
            <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#111827' }}>{col.key}</span>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'white', color: '#1D3A50', border: '1px solid #E5E7EB' }}>
                {col.orders.length}
              </span>
            </div>

            {/* Cards */}
            <div className={`flex-1 overflow-y-auto p-3 space-y-3 ${col.colBg}`} style={{ minHeight: 0 }}>
              {col.orders.length === 0 ? (
                <p className="text-center text-xs py-8" style={{ color: '#9CA3AF' }}>No orders</p>
              ) : col.orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/dashboard/live-orders/${order.id}`}
                  className="block bg-white rounded-lg p-4 space-y-2 hover:shadow-sm transition-shadow"
                  style={{ border: '1px solid #E5E7EB', borderLeftWidth: 3, borderLeftColor: '#1D3A50' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold" style={{ color: '#9CA3AF' }}>#{order.id}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(29,58,80,0.08)', color: '#1D3A50' }}>
                      {order.source}
                    </span>
                  </div>

                  <p className="text-sm font-semibold" style={{ color: '#111827' }}>{order.restaurantName}</p>

                  <p className="text-xs leading-relaxed truncate" style={{ color: '#6B7280' }}>
                    {order.items.map((i) => `${i.qty} ${i.unit} ${i.name}`).join(', ')}
                  </p>

                  <div className="flex items-center justify-between pt-1" style={{ borderTop: '1px solid #F3F4F6' }}>
                    <span className="text-xs" style={{ color: '#9CA3AF' }}>{timeAgo(order.createdAt)}</span>
                    <span className="text-xs font-semibold" style={{ color: '#1D3A50' }}>
                      {order.amount > 0 ? formatAED(order.amount, true) : '—'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
