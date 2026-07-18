'use client'

import { useOrders, useOrderStats } from '@/hooks/useOrders'
import { useRestaurants } from '@/hooks/useRestaurants'
import { useSuppliers } from '@/hooks/useSuppliers'
import { formatAED, barWidth } from '@/lib/utils'

export default function AnalyticsPage() {
  const { data: orders }      = useOrders()
  const { data: restaurants } = useRestaurants(true)
  const { data: suppliers }   = useSuppliers(true)
  const stats                 = useOrderStats()

  // Daily revenue — group orders by date
  const dailyMap = orders.reduce<Record<string, number>>((acc, o) => {
    const d = new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    acc[d] = (acc[d] ?? 0) + o.amount
    return acc
  }, {})
  const dailyRevenue  = Object.entries(dailyMap).map(([date, amount]) => ({ date, amount }))
  const maxRevenue    = Math.max(...dailyRevenue.map((d) => d.amount), 1)

  // Order status breakdown
  const total = orders.length || 1
  const orderBreakdown = [
    { label: 'Delivered', count: stats.byStatus['Delivered'] ?? 0, color: '#2D6A4F' },
    { label: 'Confirmed', count: stats.byStatus['Confirmed'] ?? 0, color: '#1D3A50' },
    { label: 'Pending',   count: stats.byStatus['Pending']   ?? 0, color: '#D97706' },
    { label: 'Cancelled', count: stats.byStatus['Cancelled'] ?? 0, color: '#EF4444' },
  ].map((s) => ({ ...s, pct: Math.round((s.count / total) * 100) }))

  // Top restaurants by GMV
  const topRestaurants = [...restaurants]
    .sort((a, b) => (b.gmv ?? 0) - (a.gmv ?? 0))
    .slice(0, 5)

  // Fulfillment rate
  const fulfilled      = (stats.byStatus['Delivered'] ?? 0) + (stats.byStatus['Confirmed'] ?? 0)
  const fulfillmentPct = orders.length ? ((fulfilled / orders.length) * 100).toFixed(1) : '—'

  const kpis = [
    { label: 'Total GMV',         value: formatAED(stats.totalAED, true), up: true  },
    { label: 'Total Orders',      value: String(orders.length),           up: true  },
    { label: 'Active Restaurants',value: String(restaurants.length),      up: true  },
    { label: 'Fulfillment Rate',  value: orders.length ? `${fulfillmentPct}%` : '—', up: true },
  ]

  return (
    <div className="flex flex-col gap-8 font-sans">

      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-1" style={{ color: '#C9943E' }}>Analytics</p>
        <h1 className="font-display italic font-semibold leading-none" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#111827' }}>
          Metrics & Analytics
        </h1>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value }) => (
          <div key={label} className="rounded-xl p-5 bg-white" style={{ border: '1px solid #E5E7EB' }}>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] mb-3" style={{ color: '#6B7280' }}>{label}</p>
            <p className="font-display font-semibold leading-none" style={{ fontSize: '2.2rem', color: '#1D3A50' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Revenue bar chart */}
      <section className="rounded-xl p-6 bg-white" style={{ border: '1px solid #E5E7EB' }} aria-label="Daily revenue chart">
        <h2 className="text-sm font-semibold mb-1" style={{ color: '#111827' }}>Revenue by Day (AED)</h2>
        <p className="text-xs mb-6" style={{ color: '#6B7280' }}>Based on order totals · peak day highlighted</p>
        {dailyRevenue.length === 0 ? (
          <p className="text-sm py-8 text-center" style={{ color: '#9CA3AF' }}>No revenue data yet.</p>
        ) : (
          <>
            <div className="flex items-end gap-2 h-36" aria-hidden="true">
              {dailyRevenue.map((d) => {
                const isPeak = d.amount === maxRevenue
                const height = barWidth(d.amount, maxRevenue)
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-sm"
                      style={{ height, backgroundColor: isPeak ? '#C9943E' : '#1D3A50', opacity: isPeak ? 1 : 0.55, minHeight: '4px' }}
                      title={`${d.date}: ${formatAED(d.amount)}`}
                    />
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[10px]" style={{ color: '#9CA3AF' }}>{dailyRevenue[0]?.date}</span>
              <span className="text-[10px]" style={{ color: '#9CA3AF' }}>{dailyRevenue[dailyRevenue.length - 1]?.date}</span>
            </div>
          </>
        )}
      </section>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Orders by status */}
        <section className="rounded-xl p-6 bg-white" style={{ border: '1px solid #E5E7EB' }} aria-label="Orders by status">
          <h2 className="text-sm font-semibold mb-5" style={{ color: '#111827' }}>Orders by Status</h2>
          <div className="flex flex-col gap-4">
            {orderBreakdown.map(({ label, pct, color }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium" style={{ color: '#374151' }}>{label}</span>
                  <span className="text-sm font-semibold" style={{ color }}>{pct}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#F3F4F6' }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Top restaurants */}
        <section className="rounded-xl p-6 bg-white" style={{ border: '1px solid #E5E7EB' }} aria-label="Top restaurants by GMV">
          <h2 className="text-sm font-semibold mb-5" style={{ color: '#111827' }}>Top Restaurants by GMV</h2>
          {topRestaurants.length === 0 ? (
            <p className="text-sm" style={{ color: '#9CA3AF' }}>No restaurant data yet.</p>
          ) : (
            <div className="flex flex-col gap-0">
              {topRestaurants.map(({ id, name, gmv }, idx) => (
                <div key={id} className="flex items-center justify-between py-3" style={{ borderTop: idx > 0 ? '1px solid #F3F4F6' : 'none' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold w-5 text-right shrink-0" style={{ color: '#9CA3AF' }}>{idx + 1}</span>
                    <span className="text-sm font-medium" style={{ color: '#111827' }}>{name}</span>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: '#111827' }}>{formatAED(gmv ?? 0, true)}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Supplier performance */}
      <section className="rounded-xl p-6 bg-white" style={{ border: '1px solid #E5E7EB' }} aria-label="Supplier performance">
        <h2 className="text-sm font-semibold mb-5" style={{ color: '#111827' }}>Supplier Performance</h2>
        {suppliers.length === 0 ? (
          <p className="text-sm" style={{ color: '#9CA3AF' }}>No suppliers yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {suppliers.map((s) => (
              <div key={s.id} className="rounded-lg p-4" style={{ backgroundColor: '#FAFAF9', border: '1px solid #F3F4F6' }}>
                <p className="text-sm font-semibold mb-1 truncate" style={{ color: '#111827' }}>{s.businessName}</p>
                <div className="flex items-center gap-1 mb-2">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="#C9943E" stroke="none">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                  </svg>
                  <span className="text-xs font-semibold" style={{ color: '#111827' }}>{s.rating}</span>
                </div>
                <p className="text-xs" style={{ color: '#6B7280' }}>
                  On-time: <span className="font-semibold" style={{ color: (s.onTimeRate ?? 0) >= 97 ? '#2D6A4F' : '#D97706' }}>{s.onTimeRate}%</span>
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{s.ordersCount} orders</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
