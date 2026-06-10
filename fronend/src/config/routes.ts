/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const ROUTES = {
  // Public
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:slug',
  STORE_DETAIL: '/stores/:slug',
  
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  // Customer
  CART: '/cart',
  CHECKOUT: '/checkout',
  
  // Customer Dashboard
  CUSTOMER_ORDERS: '/dashboard/orders',
  CUSTOMER_ORDER_DETAIL: '/dashboard/orders/:id',
  CUSTOMER_WISHLIST: '/dashboard/wishlist',
  CUSTOMER_PROFILE: '/dashboard/profile',
  CUSTOMER_ADDRESSES: '/dashboard/addresses',
  CUSTOMER_NOTIFICATIONS: '/dashboard/notifications',
  CUSTOMER_SETTINGS: '/dashboard/settings',
  
  // Vendor Dashboard
  VENDOR_DASHBOARD: '/vendor/dashboard',
  VENDOR_PRODUCTS: '/vendor/products',
  VENDOR_PRODUCT_CREATE: '/vendor/products/new',
  VENDOR_PRODUCT_EDIT: '/vendor/products/edit/:id',
  VENDOR_ORDERS: '/vendor/orders',
  VENDOR_ANALYTICS: '/vendor/analytics',
  VENDOR_STORE_SETTINGS: '/vendor/store-settings',
  VENDOR_NOTIFICATIONS: '/vendor/notifications',

  // Admin Dashboard
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_VENDORS: '/admin/vendors',
  ADMIN_USERS: '/admin/users',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_COUPONS: '/admin/coupons',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_AUDIT_LOGS: '/admin/audit-logs',
} as const;
