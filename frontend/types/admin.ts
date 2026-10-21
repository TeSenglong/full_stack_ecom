export type AdminOrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"

export interface AdminOrderItem {
  id: number
  productId: number
  productName: string
  productSku: string
  productImageUrl?: string | null
  price: number
  quantity: number
  subtotal: number
}

export interface AdminOrder {
  id: number
  orderNumber: string
  status: AdminOrderStatus
  totalAmount: number
  customerId: number
  customerEmail: string
  recipientName: string
  recipientPhone: string
  shippingAddress: string
  paymentMethod: string
  items: AdminOrderItem[]
  createdAt: string
}

export interface AdminOrderPage {
  page: number
  content: AdminOrder[]
  size: number
  totalContents: number
  totalPages: number
  first: boolean
  last: boolean
}

export type AdminUserRole = "USER" | "STAFF" | "ADMIN"

export interface AdminUser {
  id: number
  email: string
  displayName: string
  role: AdminUserRole
  avatarUrl: string | null
  enabled: boolean
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface AdminUserPage {
  page: number
  content: AdminUser[]
  size: number
  totalContents: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface AdminRevenuePoint {
  date: string
  revenue: number
  orders: number
}

export interface AdminDashboardMetrics {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalCategories: number
  openOrders: number
  deliveredOrders: number
  cancelledOrders: number
}

export interface AdminDashboardData {
  metrics: AdminDashboardMetrics
  revenue: AdminRevenuePoint[]
  recentOrders: AdminOrder[]
}

export interface AdminOrderStatusActionState {
  status: "idle" | "success" | "error"
  message: string
}

export type AdminOrderStatusAction = (
  orderId: string,
  previousState: AdminOrderStatusActionState,
  formData: FormData,
) => Promise<AdminOrderStatusActionState>
