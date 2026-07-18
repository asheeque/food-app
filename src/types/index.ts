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
}

export interface Order {
  id: string
  restaurantId: string
  restaurantName: string
  supplierId: string
  supplierName: string
  status: OrderStatus
  /** Amount in AED */
  amount: number
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
  /** Reorder below this qty */
  reorderThreshold: number
  status: StockStatus
  updatedAt: string
}

// ─── WhatsApp Log ─────────────────────────────────────────────────────────────

export type MessageType = 'Voice' | 'Text'

export interface WhatsAppMessage {
  id: string
  restaurantId: string
  restaurantName: string
  type: MessageType
  transcriptPreview: string
  parsed: boolean
  status: OrderStatus
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
