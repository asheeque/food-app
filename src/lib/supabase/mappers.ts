import type { Order, Restaurant, RestaurantAddress, Supplier, InventoryItem, InventoryBatch, WhatsAppMessage } from '@/types'

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
    taxAmount: r.tax_amount ?? 0,
    deliveryAddress: r.delivery_address ?? null,
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

export function mapRestaurantAddress(r: Row): RestaurantAddress {
  return {
    id: r.id,
    restaurantId: r.restaurant_id,
    label: r.label,
    addressLine: r.address_line,
    isDefault: r.is_default ?? false,
    createdAt: r.created_at,
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
    unitCost: r.unit_cost ?? null,
    sellPrice: r.sell_price ?? null,
    expiryDate: r.expiry_date ?? null,
    batchNumber: r.batch_number ?? null,
    updatedAt: r.updated_at,
  }
}

export function mapInventoryBatch(r: Row): InventoryBatch {
  return {
    id: r.id,
    inventoryId: r.inventory_id,
    supplierId: r.supplier_id,
    qty: r.qty,
    unitCost: r.unit_cost ?? null,
    expiryDate: r.expiry_date ?? null,
    batchNumber: r.batch_number ?? null,
    receivedAt: r.received_at,
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
