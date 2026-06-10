/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// --- Enums ---
export type Role = 'CUSTOMER' | 'VENDOR' | 'ADMIN' | 'SUPER_ADMIN';
export type VendorStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type NotificationType = 'ORDER_UPDATE' | 'REVIEW' | 'NEW_PRODUCT' | 'PROMOTION' | 'SYSTEM';

// --- User & Profile ---
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  phone?: string;
  role: Role;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
}

// --- Vendor & Store ---
export interface Vendor {
  id: string;
  user_id: string;
  user?: User;
  status: VendorStatus;
  business_name: string;
  business_email: string;
  description?: string;
  rejection_reason?: string;
  created_at: string;
}

export interface Store {
  id: string;
  vendor_id: string;
  name: string;
  slug: string;
  logo_url?: string;
  banner_url?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

// --- Category ---
export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
  parent_id?: string;
  parent?: Category;
  children?: Category[];
}

// --- Product & Variations ---
export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  is_primary: boolean;
  display_order: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  size?: string;
  color?: string;
  price: number; // Decimal in DB
  stock: number;
}

export interface Product {
  id: string;
  vendor_id: string;
  vendor?: Vendor;
  category_id: string;
  category?: Category;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  status: ProductStatus;
  is_featured: boolean;
  total_stock: number;
  avg_rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
  variants: ProductVariant[];
  images: ProductImage[];
}

// --- Cart & Wishlist ---
export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  product: Product;
  variant_id: string;
  variant: ProductVariant;
  quantity: number;
}

export interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
}

export interface WishlistItem {
  id: string;
  wishlist_id: string;
  product_id: string;
  product: Product;
}

export interface Wishlist {
  id: string;
  user_id: string;
  items: WishlistItem[];
}

// --- Address & Orders ---
export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product: Product;
  variant_id: string;
  variant: ProductVariant;
  vendor_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: OrderStatus;
}

export interface Order {
  id: string;
  user_id: string;
  user?: User;
  address_id: string;
  address?: Address;
  status: OrderStatus;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  // Monetary value of the applied discount (if any)
  discount_amount?: number;
  total: number;
  stripe_payment_intent_id?: string;
  coupon_code?: string;
  notes?: string;
  items: OrderItem[];
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  stripe_payment_intent: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paid_at?: string;
  created_at: string;
}

// --- Coupon ---
export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order?: number;
  max_uses?: number;
  uses_count: number;
  expires_at?: string;
  is_active: boolean;
}

// --- Review ---
export interface Review {
  id: string;
  user_id: string;
  user?: User;
  product_id: string;
  rating: number; // 1-5
  comment?: string;
  is_verified_purchase: boolean;
  created_at: string;
}

// --- Notification ---
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  data?: any;
  created_at: string;
}

// --- Analytics ---
export interface Analytics {
  id: string;
  vendor_id: string;
  date: string;
  revenue: number;
  orders: number;
  units_sold: number;
}

// --- AuditLog ---
export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  entity: string;
  entity_id?: string;
  old_value?: any;
  new_value?: any;
  ip_address?: string;
  created_at: string;
}
