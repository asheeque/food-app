'use client'

import { useOrders, useOrderStats } from '@/hooks/useOrders'
import { useRestaurants } from '@/hooks/useRestaurants'
import { formatAED } from '@/lib/utils'
import Link from 'next/link'

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  Delivered: { bg: 'rgba(74,124,92,0.10)',  text: '#2D6A4F', dot: '#2D6A4F' },
  Confirmed: { bg: 'rgba(29,58,80,0.08)',   text: '#1D3A50', dot: '#1D3A50' },
  Pending:   { bg: 'rgba(245,158,11,0.10)', text: '#92400E', dot: '#D97706' },
  Cancelled: { bg: 'rgba(239,68,68,0.10)',  text: '#991B1B', dot: '#EF4444' },
}

export default function DashboardPage() {
  const { data: orders }      = useOrders()
  const { data: restaurants } = useRestaurants(true)
  const stats                 = useOrderStats()

  const fulfillmentRate = orders.length > 0
    ? (((stats.byStatus['Delivered'] ?? 0) + (stats.byStatus['Confirmed'] ?? 0)) / orders.length * 100).toFixed(1)
    : '—'

  const kpis = [
    { label: 'Total Orders',       value: String(orders.length),            change: null },
    { label: 'GMV (all time)',      value: formatAED(stats.totalAED, true),  change: null },
    { label: 'Active Restaurants',  value: String(restaurants.length),       change: null },
    { label: 'Fulfillment Rate',    value: orders.length ? `${fulfillmentRate}%` : '—', change: null },
  ]

  const recentOrders = orders.slice(0, 5)

  return (
    <div className="flex flex-col gap-8 font-sans">

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-1" style={{ color: '#C9943E' }}>Overview</p>
        <h1 className="font-display italic font-semibold leading-none" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#111827' }}>
          Good morning.
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#6B7280' }}>
          Here&apos;s what&apos;s moving across the supply chain today.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value }) => (
          <div key={label} className="rounded-xl p-5" style={{ backgroundColor: '#ffffff', border: '1px solid #E5E7EB' }}>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] mb-3" style={{ color: '#6B7280' }}>{label}</p>
            <p className="font-display font-semibold leading-none" style={{ fontSize: '2.2rem', color: '#1D3A50' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Order status pills */}
      <div className="flex items-center gap-3 flex-wrap">
        {[
          { label: 'Pending',   count: stats.byStatus['Pending']   ?? 0, color: '#D97706' },
          { label: 'Confirmed', count: stats.byStatus['Confirmed'] ?? 0, color: '#1D3A50' },
          { label: 'Delivered', count: stats.byStatus['Delivered'] ?? 0, color: '#2D6A4F' },
          { label: 'Cancelled', count: stats.byStatus['Cancelled'] ?? 0, color: '#EF4444' },
        ].map(({ label, count, color }) => (
          <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold" style={{ backgroundColor: '#ffffff', border: '1px solid #E5E7EB', color }}>
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
            {count} {label}
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/dashboard/live-orders" className="px-4 py-2 rounded-lg text-sm font-semibold bg-creek-500 text-white transition-opacity hover:opacity-90">
          View live orders
        </Link>
        <Link href="/dashboard/restaurants" className="px-4 py-2 rounded-lg text-sm font-semibold bg-creek-500 text-white transition-opacity hover:opacity-90">
          Add restaurant
        </Link>
        <Link href="/dashboard/suppliers" className="px-4 py-2 rounded-lg text-sm font-semibold bg-creek-500 text-white transition-opacity hover:opacity-90">
          Add supplier
        </Link>
      </div>

      {/* Recent orders table */}
      <section aria-label="Recent orders">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold" style={{ color: '#111827' }}>Recent Orders</h2>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
          </div>
          <Link href="/dashboard/live-orders" className="text-xs font-semibold uppercase tracking-[0.12em] hover:underline" style={{ color: '#C9943E' }}>
            View all →
          </Link>
        </div>

        <div className="rounded-xl overflow-x-auto" style={{ border: '1px solid #E5E7EB' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                {['Order', 'Restaurant', 'Supplier', 'Status', 'Amount'].map((col) => (
                  <th key={col} className="py-3 px-5 text-left text-xs font-semibold uppercase tracking-[0.1em]" style={{ color: '#6B7280' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-sm" style={{ color: '#6B7280' }}>No orders yet.</td></tr>
              ) : recentOrders.map((order, idx) => {
                const s = STATUS_STYLES[order.status] ?? STATUS_STYLES.Pending
                return (
                  <tr key={order.id} className="transition-colors hover:bg-[#F9FAFB]" style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#FAFAF9', borderTop: '1px solid #E5E7EB', borderLeft: '3px solid #C9943E' }}>
                    <td className="py-3.5 px-5 font-semibold" style={{ color: '#111827' }}>
                      <Link href={`/dashboard/live-orders/${order.id}`} className="hover:underline">#{order.id}</Link>
                    </td>
                    <td className="py-3.5 px-5" style={{ color: '#374151' }}>{order.restaurantName}</td>
                    <td className="py-3.5 px-5 hidden md:table-cell" style={{ color: '#6B7280' }}>{order.supplierName}</td>
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: s.bg, color: s.text }}>
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.dot }} />
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-semibold" style={{ color: '#111827' }}>
                      {order.amount > 0 ? formatAED(order.amount) : '—'}
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
