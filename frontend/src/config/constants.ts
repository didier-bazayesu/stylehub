// ─── Query keys ─────────────────────────────────────────────────────────────
// Centralized to avoid typos and ensure consistent invalidation

export const QUERY_KEYS = {
  // Auth
  me: ['auth', 'me'] as const,

  // Users
  profile: ['users', 'profile'] as const,
  addresses: ['users', 'addresses'] as const,

  // Vendors
  vendorMe: ['vendors', 'me'] as const,
  vendorStats: ['vendors', 'me', 'stats'] as const,

  // Stores
  store: (slug: string) => ['stores', slug] as const,
  storeProducts: (slug: string, filters?: object) =>
    ['stores', slug, 'products', filters] as const,

  // Categories
  categories: ['categories'] as const,
  category: (slug: string) => ['categories', slug] as const,

  // Products
  products: (filters?: object) => ['products', filters] as const,
  product: (slug: string) => ['products', slug] as const,
  featuredProducts: ['products', 'featured'] as const,

  // Cart
  cart: ['cart'] as const,

  // Wishlist
  wishlist: ['wishlist'] as const,

  // Orders
  orders: (filters?: object) => ['orders', filters] as const,
  order: (id: string) => ['orders', id] as const,
  vendorOrders: (filters?: object) => ['vendor', 'orders', filters] as const,

  // Reviews
  reviews: (productId: string) => ['reviews', productId] as const,

  // Notifications
  notifications: ['notifications'] as const,

  // Analytics
  vendorOverview: (period: string) => ['analytics', 'vendor', 'overview', period] as const,
  vendorRevenue: (period: string) => ['analytics', 'vendor', 'revenue', period] as const,
  vendorTopProducts: (period: string) => ['analytics', 'vendor', 'top-products', period] as const,
  adminOverview: ['analytics', 'admin', 'overview'] as const,

  // Admin
  adminUsers: (filters?: object) => ['admin', 'users', filters] as const,
  adminVendors: (filters?: object) => ['admin', 'vendors', filters] as const,
  adminProducts: (filters?: object) => ['admin', 'products', filters] as const,
  adminOrders: (filters?: object) => ['admin', 'orders', filters] as const,
  adminCoupons: ['admin', 'coupons'] as const,
  auditLogs: (filters?: object) => ['admin', 'audit-logs', filters] as const,
} as const

// ─── Stale times (ms) ────────────────────────────────────────────────────────

export const STALE_TIME = {
  INSTANT: 0,
  SHORT: 1 * 60 * 1000,      // 1 minute
  MEDIUM: 5 * 60 * 1000,     // 5 minutes
  LONG: 30 * 60 * 1000,      // 30 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
} as const

// ─── Pagination defaults ─────────────────────────────────────────────────────

export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  ADMIN_LIMIT: 25,
} as const

// ─── File upload limits ──────────────────────────────────────────────────────

export const UPLOAD = {
  MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_PRODUCT_IMAGES: 5,
} as const

// ─── Route paths ─────────────────────────────────────────────────────────────

export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT: (slug: string) => `/products/${slug}`,
  STORE: (slug: string) => `/stores/${slug}`,
  CART: '/cart',
  CHECKOUT: '/checkout',
  LOGIN: '/login',
  REGISTER: '/register',
  VENDOR_APPLY: '/vendor/apply',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  // Customer dashboard
  CUSTOMER: {
    ORDERS: '/dashboard/orders',
    ORDER: (id: string) => `/dashboard/orders/${id}`,
    WISHLIST: '/dashboard/wishlist',
    PROFILE: '/dashboard/profile',
    ADDRESSES: '/dashboard/addresses',
    REVIEWS: '/dashboard/reviews',
    NOTIFICATIONS: '/dashboard/notifications',
    SETTINGS: '/dashboard/settings',
  },

  // Vendor dashboard
  VENDOR: {
    DASHBOARD: '/vendor/dashboard',
    PRODUCTS: '/vendor/products',
    PRODUCT_NEW: '/vendor/products/new',
    PRODUCT_EDIT: (id: string) => `/vendor/products/${id}/edit`,
    ORDERS: '/vendor/orders',
    ANALYTICS: '/vendor/analytics',
    STORE: '/vendor/store',
    NOTIFICATIONS: '/vendor/notifications',
  },

  // Admin dashboard
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    VENDORS: '/admin/vendors',
    USERS: '/admin/users',
    PRODUCTS: '/admin/products',
    ORDERS: '/admin/orders',
    ANALYTICS: '/admin/analytics',
    COUPONS: '/admin/coupons',
    AUDIT_LOGS: '/admin/audit-logs',
  },
} as const

// ─── Error codes ─────────────────────────────────────────────────────────────

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  UNAUTHORIZED: 'UNAUTHORIZED',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  PRODUCT_NOT_FOUND: 'PRODUCT_NOT_FOUND',
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  ALREADY_REVIEWED: 'ALREADY_REVIEWED',
  CART_EMPTY: 'CART_EMPTY',
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  VENDOR_NOT_APPROVED: 'VENDOR_NOT_APPROVED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const
