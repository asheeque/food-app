'use client'

import { useOrder, useUpdateOrderStatus } from '@/hooks/useOrders'
import { useRestaurant } from '@/hooks/useRestaurants'
import { OrderReceipt } from '@/components/orders/OrderReceipt'
import Link from 'next/link'

export default function SupplierOrderDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const { data: order } = useOrder(id)
  const { data: restaurant } = useRestaurant(order?.restaurantId ?? '')
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus()

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-24 font-sans">
        <p className="text-sm font-semibold mb-2" style={{ color: '#111827' }}>Order not found</p>
        <Link href="/supplier/dashboard/orders" className="text-sm font-semibold hover:underline" style={{ color: '#1D3A50' }}>
          ← Back to orders
        </Link>
      </div>
    )
  }

  return (
    <OrderReceipt
      order={order}
      roleLabel="Supplier"
      backHref="/supplier/dashboard/orders"
      counterparty={restaurant ? { role: 'Restaurant', name: restaurant.name, contact: restaurant.contact, whatsapp: restaurant.whatsapp } : null}
      actions={
        order.status === 'Pending' ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateStatus({ id: order.id, status: 'Confirmed' })}
              disabled={isPending}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-creek-500 hover:opacity-90 transition-opacity disabled:opacity-60"
              type="button"
            >
              Confirm order
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
        ) : order.status === 'Confirmed' ? (
          <button
            onClick={() => updateStatus({ id: order.id, status: 'Delivered' })}
            disabled={isPending}
            className="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#F3F4F6] transition-colors disabled:opacity-60"
            style={{ color: '#2D6A4F', border: '1px solid #BBF7D0' }}
            type="button"
          >
            Mark delivered
          </button>
        ) : undefined
      }
    />
  )
}
