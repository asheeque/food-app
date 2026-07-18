'use client'

import { useAppStore, selectEntityId } from '@/store/useAppStore'
import { useRestaurantsBySupplier } from '@/hooks/useRestaurants'
import { useOrders } from '@/hooks/useOrders'
import { formatAED } from '@/lib/utils'

export default function SupplierRestaurantsPage() {
  const supplierId              = useAppStore(selectEntityId) ?? ''
  const { data: restaurants, isLoading } = useRestaurantsBySupplier(supplierId)
  const { data: allOrders }     = useOrders({ supplierId })

  // Per-restaurant order count and GMV from live orders
  const statsByRestaurant = allOrders.reduce<Record<string, { count: number; gmv: number }>>((acc, o) => {
    const s = acc[o.restaurantId] ?? { count: 0, gmv: 0 }
    acc[o.restaurantId] = { count: s.count + 1, gmv: s.gmv + o.amount }
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-8 font-sans">

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] mb-1" style={{ color: '#C9943E' }}>
          Supplier
        </p>
        <h1 className="font-display italic font-semibold leading-none" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#111827' }}>
          My Restaurants
        </h1>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Linked restaurants', value: String(restaurants.length) },
          { label: 'Active',             value: String(restaurants.filter((r) => r.active).length) },
          { label: 'Total orders',       value: String(allOrders.length) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl p-5 bg-white" style={{ border: '1px solid #E5E7EB' }}>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] mb-2" style={{ color: '#6B7280' }}>{label}</p>
            <p className="font-display font-semibold leading-none" style={{ fontSize: '2rem', color: '#1D3A50' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Restaurant list */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              {['Restaurant', 'Zone', 'WhatsApp', 'Orders', 'GMV', 'Status'].map((col) => (
                <th key={col} className="py-3 px-5 text-left text-xs font-semibold uppercase tracking-[0.1em]" style={{ color: '#6B7280' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm" style={{ color: '#9CA3AF' }}>Loading…</td>
              </tr>
            ) : restaurants.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm" style={{ color: '#9CA3AF' }}>
                  No restaurants linked to your account yet.
                </td>
              </tr>
            ) : restaurants.map((r, idx) => {
              const stats = statsByRestaurant[r.id] ?? { count: 0, gmv: 0 }
              return (
                <tr
                  key={r.id}
                  className="hover:bg-[#F9FAFB] transition-colors"
                  style={{
                    backgroundColor: idx % 2 === 0 ? '#ffffff' : '#FAFAF9',
                    borderTop: '1px solid #E5E7EB',
                  }}
                >
                  <td className="py-3.5 px-5">
                    <p className="font-semibold" style={{ color: '#111827' }}>{r.name}</p>
                    {r.cuisineType && (
                      <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{r.cuisineType}</p>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-xs" style={{ color: '#6B7280' }}>{r.zone}</td>
                  <td className="py-3.5 px-5 text-xs font-mono" style={{ color: '#374151' }}>{r.whatsapp || '—'}</td>
                  <td className="py-3.5 px-5 font-semibold" style={{ color: '#111827' }}>{stats.count}</td>
                  <td className="py-3.5 px-5 font-semibold" style={{ color: '#111827' }}>{formatAED(stats.gmv, true)}</td>
                  <td className="py-3.5 px-5">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: r.active ? 'rgba(74,124,92,0.10)' : 'rgba(156,163,175,0.15)',
                        color: r.active ? '#2D6A4F' : '#6B7280',
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: r.active ? '#2D6A4F' : '#9CA3AF' }}
                      />
                      {r.active ? 'Active' : 'Inactive'}
                    </span>
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
