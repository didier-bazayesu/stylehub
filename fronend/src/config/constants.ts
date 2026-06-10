/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export const USER_ROLES = {
  CUSTOMER: 'CUSTOMER',
  VENDOR: 'VENDOR',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export const VENDOR_STATUSES = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED',
} as const;

export const ORDER_STATUSES = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const;

export const PRODUCT_STATUSES = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
} as const;

export const PAYMENT_STATUSES = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const;

export const LOCAL_STORAGE_KEYS = {
  CART: 'stylehub_cart_items',
  WISHLIST: 'stylehub_wishlist_items',
  NOTIFICATIONS: 'stylehub_notifications',
  VENDORS: 'stylehub_mock_vendors',
  USERS: 'stylehub_mock_users',
  PRODUCTS: 'stylehub_mock_products',
  ORDERS: 'stylehub_mock_orders',
} as const;
