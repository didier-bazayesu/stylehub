// ─── Enums ─────────────────────────────────────────────────────────────────

export enum Role {
  GUEST = 'GUEST',
  CUSTOMER = 'CUSTOMER',
  VENDOR = 'VENDOR',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum VendorStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum ProductStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export enum NotificationType {
  ORDER_UPDATE = 'ORDER_UPDATE',
  REVIEW = 'REVIEW',
  NEW_PRODUCT = 'NEW_PRODUCT',
  PROMOTION = 'PROMOTION',
  SYSTEM = 'SYSTEM',
}

// ─── API Response Envelope ─────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: PaginationMeta | null
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
  }
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface CursorPaginationMeta {
  nextCursor: string | null
  hasMore: boolean
  limit: number
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export interface AuthTokens {
  access_token: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  first_name: string
  last_name: string
  email: string
  password: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  token: string
  password: string
}

// ─── User ──────────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  avatar_url: string | null
  phone: string | null
  role: Role
  is_verified: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  vendor?: Vendor | null
}

export interface UpdateProfilePayload {
  first_name?: string
  last_name?: string
  phone?: string
}

export interface ChangePasswordPayload {
  current_password: string
  new_password: string
}

// ─── Address ───────────────────────────────────────────────────────────────

export interface Address {
  id: string
  user_id: string
  full_name: string
  phone: string
  line1: string
  line2: string | null
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
}

export interface CreateAddressPayload {
  full_name: string
  phone: string
  line1: string
  line2?: string
  city: string
  state: string
  postal_code: string
  country: string
  is_default?: boolean
}

// ─── Vendor ────────────────────────────────────────────────────────────────

export interface Vendor {
  id: string
  user_id: string
  status: VendorStatus
  business_name: string
  business_email: string
  description: string | null
  rejection_reason: string | null
  created_at: string
    user?: {
    id: string
    first_name: string
    last_name: string
    email: string
  }
  store?: Store | null
}

export interface VendorStats {
  total_revenue: number
  total_orders: number
  total_products: number
  total_customers: number
}

export interface ApplyVendorPayload {
  business_name: string
  business_email: string
  description?: string
}

// ─── Store ─────────────────────────────────────────────────────────────────

export interface Store {
  id: string
  vendor_id: string
  name: string
  slug: string
  logo_url: string | null
  banner_url: string | null
  description: string | null
  is_active: boolean
  created_at: string
  vendor?: Vendor
}

export interface CreateStorePayload {
  name: string
  slug: string
  description?: string
}

// ─── Category ──────────────────────────────────────────────────────────────

export interface Category {
  id: string
  name: string
  slug: string
  image_url: string | null
  parent_id: string | null
  children?: Category[]
}

// ─── Product ───────────────────────────────────────────────────────────────

export interface Product {
  id: string
  vendor_id: string
  category_id: string
  name: string
  slug: string
  description: string
  base_price: number
  status: ProductStatus
  is_featured: boolean
  total_stock: number
  avg_rating: number
  review_count: number
  created_at: string
  updated_at: string
  vendor?: Vendor
  category?: Category
  variants?: ProductVariant[]
  images?: ProductImage[]
  reviews?: Review[]
}
export interface ProductListItem {
  id: string
  name: string
  slug: string
  base_price: number
  avg_rating: number
  review_count: number
  is_featured: boolean
  image?: string  | undefined        // single pre-resolved URL
  category: Category
  vendor?: Vendor
   variants?: ProductVariant[]
}
export interface ProductListItem {
  id: string
  name: string
  slug: string
  base_price: number
  avg_rating: number
  review_count: number
  is_featured: boolean
  image?: string | undefined        // single pre-resolved URL
  category: Category
  vendor?: Vendor
}

export interface ProductVariant {
  id: string
  product_id: string
  sku: string
  size: string | null
  color: string | null
  price: number
  stock: number
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  public_id: string
  is_primary: boolean
  display_order: number
}

export interface ProductFilters {
  category?: string
  vendor?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'popular'
  page?: number
  limit?: number
  cursor?: string
  status?: ProductStatus
}

export interface CreateProductPayload {
  name: string
  category_id: string
  description: string
  base_price: number
  status?: ProductStatus
  is_featured?: boolean
}

export interface CreateVariantPayload {
  sku: string
  size?: string
  color?: string
  price: number
  stock: number
}

// ─── Cart ──────────────────────────────────────────────────────────────────

export interface Cart {
  id: string
  user_id: string | null  // ← null not string
  items: CartItem[]
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: string
  cart_id: string
  product_id: string
  variant_id: string
  quantity: number
  added_at: string
  product: Product
  variant: ProductVariant
}

export interface AddToCartPayload {
  variant_id: string
  quantity: number
}

// ─── Wishlist ──────────────────────────────────────────────────────────────

export interface Wishlist {
  id: string
  user_id: string
  items: WishlistItem[]
}

export interface WishlistItem {
  id: string
  wishlist_id: string
  product_id: string
  added_at: string
  product: Product
}

// ─── Order ─────────────────────────────────────────────────────────────────

export interface Order {
  id: string
  user_id: string
  address_id: string
  status: OrderStatus
  subtotal: number
  shipping_cost: number
  discount: number
  total: number
  coupon_code: string | null
  notes: string | null
  created_at: string
  updated_at: string
  items: OrderItem[]
  address?: Address
  payment?: Payment
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  variant_id: string
  vendor_id: string
  quantity: number
  unit_price: number
  total_price: number
  status: OrderStatus
  product?: Product
  variant?: ProductVariant
}

export interface CreateOrderPayload {
  address_id: string
  coupon_code?: string
  notes?: string
}

// ─── Payment ───────────────────────────────────────────────────────────────

export interface Payment {
  id: string
  order_id: string
  stripe_payment_intent: string
  amount: number
  currency: string
  status: PaymentStatus
  paid_at: string | null
  created_at: string
}

export interface CreatePaymentIntentResponse {
  client_secret: string
  payment_intent_id: string
}

// ─── Review ────────────────────────────────────────────────────────────────

export interface Review {
  id: string
  user_id: string
  product_id: string
  rating: number
  comment: string | null
  is_verified_purchase: boolean
  created_at: string
  updated_at: string
  user?: Pick<User, 'id' | 'first_name' | 'last_name' | 'avatar_url'>
}

export interface CreateReviewPayload {
  rating: number
  comment?: string
}

// ─── Notification ──────────────────────────────────────────────────────────

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  is_read: boolean
  data: Record<string, unknown> | null
  created_at: string
}

// ─── Analytics ─────────────────────────────────────────────────────────────

export type AnalyticsPeriod = '7d' | '30d' | '90d' | '1y'

export interface VendorOverview {
  total_revenue: number
  total_orders: number
  total_products: number
  total_customers: number
  revenue_change: number
  orders_change: number
}

export interface RevenueDataPoint {
  date: string
  revenue: number
  orders: number
}

export interface TopProduct {
  product_id: string
  name: string
  revenue: number
  units_sold: number
  image_url: string | null
}

// ─── Coupon ────────────────────────────────────────────────────────────────

export interface Coupon {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order: number | null
  max_uses: number | null
  uses_count: number
  expires_at: string | null
  is_active: boolean
  created_at: string
}

// ─── Admin ─────────────────────────────────────────────────────────────────

export interface AdminPlatformStats {
  total_revenue: number
  total_users: number
  total_vendors: number
  total_products: number
  total_orders: number
}

export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  entity: string
  entity_id: string | null
  old_value: Record<string, unknown> | null
  new_value: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}
