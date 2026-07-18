'use client'

import { useOrders, useOrderStats } from '@/hooks/useOrders'
import { useInventoryStats } from '@/hooks/useInventory'
import { useRestaurantsBySupplier } from '@/hooks/useRestaurants'
import { useAppStore, selectEntityId } from '@/store/useAppStore'
import { formatAED, timeAgo } from '@/lib/utils'
import Link from 'next/link'

const STATUS_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  Delivered: { bg: 'rgba(74,124,92,0.10)',  text: '#2D6A4F', dot: '#2D6A4F' },
  Confirmed: { bg: 'rgba(29,58,80,0.08)',   text: '#1D3A50', dot: '#1D3A50' },
  Pending:   { bg: 'rgba(245,158,11,0.10)', text: '#92400E', dot: '#D97706' },
  Cancelled: { bg: 'rgba(239,68,68,0.10)',  text: '#991B1B', dot: '#EF4444' },
}

export default function SupplierHomePage() {
  const supplierId = useAppStore(selectEntityId) ?? undefined

  const { data: orders }       = useOrders({ supplierId })
  const { data: recentOrders } = useOrders({ supplierId })
  const orderStats             = useOrderStats({ supplierId })
  const invStats               = useInventoryStats(supplierId)
  const { data: restaurants }  = useRestaurantsBySupplier(supplierId ?? '')

  const revenueAED = orderStats.totalAED
  const pending    = orderStats.byStatus['Pending']    ?? 0
  const confirmed  = orderStats.byStatus['Confirmed']  ?? 0
  const delivered  = orderStats.byStatus['Delivered']  ?? 0

  return (
    <div className="flex flex-col gap-8 font-sans">

      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-1" style={{ color: '#C9943E' }}>
          Supplier Overview
        </p>
        <h1 className="font-display italic font-semibold leading-none" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#111827' }}>
          Good morning.
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#6B7280' }}>
          Here&apos;s your supply activity today.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Revenue (30d)',     value: formatAED(revenueAED, true), change: '+11%', up: true },
          { label: 'Orders Today',     value: String(orders.length),        change: '+3',   up: true },
          { label: 'Low / Out Stock',  value: `${invStats.lowStock + invStats.outOfStock}`, change: invStats.outOfStock > 0 ? '!' : 'OK', up: invStats.outOfStock === 0 },
          { label: 'Restaurants',      value: String(restaurants.length),   change: 'active', up: true },
        ].map(({ label, value, change, up }) => (
          <div
            key={label}
            className="rounded-xl p-5"
            style={{ backgroundColor: '#ffffff', border: '1px solid #E5E7EB' }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] mb-3" style={{ color: '#6B7280' }}>
              {label}
            </p>
            <p className="font-display font-semibold leading-none mb-3" style={{ fontSize: '2.2rem', color: '#1D3A50' }}>
              {value}
            </p>
            <span
              className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: up ? 'rgba(74,124,92,0.10)' : 'rgba(239,68,68,0.10)',
                color: up ? '#2D6A4F' : '#991B1B',
              }}
            >
              {change}
            </span>
          </div>
        ))}
      </div>

      {/* Order status pills */}
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
        <Link
          href="/supplier/dashboard/inventory"
          className="ml-auto px-4 py-2 rounded-lg text-sm font-semibold bg-creek-500 text-white transition-opacity hover:opacity-90"
        >
          Manage inventory
        </Link>
        <Link
          href="/supplier/dashboard/orders"
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-creek-500 text-white transition-opacity hover:opacity-90"
        >
          View all orders
        </Link>
      </div>

      {/* Recent incoming orders */}
      <section aria-label="Recent incoming orders">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold" style={{ color: '#111827' }}>Incoming Orders</h2>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
          </div>
          <Link href="/supplier/dashboard/orders" className="text-xs font-semibold uppercase tracking-[0.12em] hover:underline" style={{ color: '#C9943E' }}>
            View all →
          </Link>
        </div>

        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                {['Order', 'Restaurant', 'Amount', 'Time', 'Status'].map((col) => (
                  <th key={col} className="py-3 px-5 text-left text-xs font-semibold uppercase tracking-[0.1em]" style={{ color: '#6B7280' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, idx) => {
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
                    <td className="py-3.5 px-5" style={{ color: '#374151' }}>{order.restaurantName}</td>
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
      </section>

    </div>
  )
}
