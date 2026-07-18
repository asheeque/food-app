// ─── Auth ────────────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'supplier' | 'restaurant'

export interface AppUser {
  id: string
  name: string
  email: string
  role: UserRole
  /** Restaurant or supplier ID this user belongs to. Null for admin. */
  entityId: string | null
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export type OrderStatus = 'Pending' | 'Confirmed' | 'Delivered' | 'Cancelled'
export type OrderSource = 'WhatsApp' | 'Portal'

export interface OrderItem {
  id: string
  name: string
  qty: number
  unit: string
  notes?: string
  /** AI confidence 0–1, present on WhatsApp voice orders */
  confidence?: number
  /** inventory.id this line was ordered from — used to decrement stock on confirm */
  itemId?: string
  /** AED sell price per unit, snapshotted at order time for the receipt */
  unitPrice?: number | null
}

export interface Order {
  id: string
  restaurantId: string
  restaurantName: string
  supplierId: string
  supplierName: string
  status: OrderStatus
  /** Amount in AED, inclusive of tax */
  amount: number
  /** AED VAT portion of amount */
  taxAmount: number
  /** Delivery address snapshotted at order time */
  deliveryAddress: string | null
  items: OrderItem[]
  source: OrderSource
  createdAt: string // ISO string
  updatedAt: string
}

export interface OrderFilters {
  restaurantId?: string
  supplierId?: string
  status?: OrderStatus
  source?: OrderSource
  dateFrom?: string
  dateTo?: string
}

// ─── Restaurants ─────────────────────────────────────────────────────────────

export interface Restaurant {
  id: string
  name: string
  brandGroup?: string
  zone: string
  contact: string
  whatsapp: string
  email: string
  cuisineType: string
  preferredTime: string
  primarySupplierId: string
  active: boolean
  /** Last 30 days */
  ordersCount: number
  /** AED, last 30 days */
  gmv: number
}

/** A saved delivery location a restaurant can pick from at checkout. */
export interface RestaurantAddress {
  id: string
  restaurantId: string
  label: string
  addressLine: string
  isDefault: boolean
  createdAt: string
}

// ─── Suppliers ───────────────────────────────────────────────────────────────

export interface Supplier {
  id: string
  businessName: string
  tradeLicense?: string
  trn?: string
  categories: string[]
  productsCount: number
  whatsapp: string
  email: string
  warehouseAddress: string
  /** Last 30 days */
  ordersCount: number
  /** 0–5 */
  rating: number
  /** 0–100 */
  onTimeRate: number
  active: boolean
}

// ─── Inventory ───────────────────────────────────────────────────────────────

export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock'

export interface InventoryItem {
  id: string
  supplierId: string
  name: string
  category: string
  stockQty: number
  unit: string
  reorderThreshold: number
  status: StockStatus
  /** AED purchase cost per unit */
  unitCost: number | null
  /** AED selling price per unit */
  sellPrice: number | null
  /** ISO date string, null if not perishable */
  expiryDate: string | null
  /** Lot / batch reference for traceability */
  batchNumber: string | null
  updatedAt: string
}

/** A single received lot of an inventory item — tracked separately so restocking never overwrites an earlier batch's expiry/cost. */
export interface InventoryBatch {
  id: string
  inventoryId: string
  supplierId: string
  qty: number
  unitCost: number | null
  expiryDate: string | null
  batchNumber: string | null
  receivedAt: string
}

// ─── WhatsApp Log ─────────────────────────────────────────────────────────────

export type MessageType = 'Voice' | 'Text'

/** Pending: awaiting restaurant CONFIRM/CANCEL. Confirmed: order created. Failed: transcription/parsing error. */
export type WhatsAppLogStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Failed'

export interface WhatsAppMessage {
  id: string
  restaurantId: string | null
  restaurantName: string
  type: MessageType
  transcriptPreview: string
  parsed: boolean
  status: WhatsAppLogStatus
  orderId?: string
  receivedAt: string
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface DailyRevenue {
  date: string // 'Jun 1'
  amount: number // AED
}

export interface AnalyticsSummary {
  gmvTotal: number
  gmvChange: number
  ordersTotal: number
  ordersChange: number
  activeRestaurants: number
  fulfillmentRate: number
  dailyRevenue: DailyRevenue[]
}
