'use client'

import { useOrder } from '@/hooks/useOrders'
import { useSupplier } from '@/hooks/useSuppliers'
import { OrderReceipt } from '@/components/orders/OrderReceipt'
import Link from 'next/link'

export default function RestaurantOrderDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const { data: order } = useOrder(id)
  const { data: supplier } = useSupplier(order?.supplierId ?? '')

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-24 font-sans">
        <p className="text-sm font-semibold mb-2" style={{ color: '#111827' }}>Order not found</p>
        <Link href="/restaurant/dashboard/orders" className="text-sm font-semibold hover:underline" style={{ color: '#1D3A50' }}>
          ← Back to orders
        </Link>
      </div>
    )
  }

  return (
    <OrderReceipt
      order={order}
      roleLabel="Restaurant"
      backHref="/restaurant/dashboard/orders"
      counterparty={supplier ? { role: 'Supplier', name: supplier.businessName, whatsapp: supplier.whatsapp, rating: supplier.rating, onTimeRate: supplier.onTimeRate } : null}
    />
  )
}
