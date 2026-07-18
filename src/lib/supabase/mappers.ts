import type { Order, Restaurant, Supplier, InventoryItem, WhatsAppMessage } from '@/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>

export function mapOrder(r: Row): Order {
  return {
    id: r.id,
    restaurantId: r.restaurant_id,
    restaurantName: r.restaurant_name,
    supplierId: r.supplier_id,
    supplierName: r.supplier_name,
    status: r.status,
    amount: r.amount,
    source: r.source,
    items: r.items ?? [],
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

export function mapRestaurant(r: Row): Restaurant {
  return {
    id: r.id,
    name: r.name,
    brandGroup: r.brand_group,
    zone: r.zone,
    contact: r.contact,
    whatsapp: r.whatsapp,
    email: r.email,
    cuisineType: r.cuisine_type,
    preferredTime: r.preferred_time,
    primarySupplierId: r.primary_supplier_id,
    active: r.active,
    ordersCount: r.orders_count,
    gmv: r.gmv,
  }
}

export function mapSupplier(r: Row): Supplier {
  return {
    id: r.id,
    businessName: r.business_name,
    tradeLicense: r.trade_license,
    trn: r.trn,
    categories: r.categories ?? [],
    productsCount: r.products_count,
    whatsapp: r.whatsapp,
    email: r.email,
    warehouseAddress: r.warehouse_address,
    ordersCount: r.orders_count,
    rating: r.rating,
    onTimeRate: r.on_time_rate,
    active: r.active,
  }
}

export function mapInventoryItem(r: Row): InventoryItem {
  return {
    id: r.id,
    supplierId: r.supplier_id,
    name: r.name,
    category: r.category,
    stockQty: r.stock_qty,
    unit: r.unit,
    reorderThreshold: r.reorder_threshold,
    status: r.status,
    updatedAt: r.updated_at,
  }
}

export function mapWhatsAppMessage(r: Row): WhatsAppMessage {
  return {
    id: r.id,
    restaurantId: r.restaurant_id,
    restaurantName: r.restaurant_name,
    type: r.type,
    transcriptPreview: r.transcript ?? '',
    parsed: r.parsed,
    status: r.status,
    orderId: r.order_id,
    receivedAt: r.received_at,
  }
}
