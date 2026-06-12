import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { OrderStatus, ProductStatus, VendorStatus } from '@/types'

// ─── Tailwind class merging ─────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Currency formatting ────────────────────────────────────────────────────

export function formatCurrency(
  amount: number,
  currency = 'USD',
  locale = 'en-US',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatCompactCurrency(amount: number, currency = 'USD'): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}K`
  }
  return formatCurrency(amount, currency)
}

// ─── Date formatting ────────────────────────────────────────────────────────

export function formatDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(new Date(date))
}

export function formatDatetime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const target = new Date(date)
  const diffMs = now.getTime() - target.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(date)
}

// ─── Number formatting ──────────────────────────────────────────────────────

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n)
}

export function formatCompactNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export function formatPercentage(value: number, decimals = 1): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(decimals)}%`
}

// ─── String utilities ───────────────────────────────────────────────────────

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}…`
}

export function toTitleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
  )
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

// ─── Status label helpers ───────────────────────────────────────────────────

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Pending',
  [OrderStatus.CONFIRMED]: 'Confirmed',
  [OrderStatus.PROCESSING]: 'Processing',
  [OrderStatus.SHIPPED]: 'Shipped',
  [OrderStatus.DELIVERED]: 'Delivered',
  [OrderStatus.CANCELLED]: 'Cancelled',
  [OrderStatus.REFUNDED]: 'Refunded',
}

export const ORDER_STATUS_COLORS: Record<
  OrderStatus,
  'default' | 'info' | 'warning' | 'success' | 'danger'
> = {
  [OrderStatus.PENDING]: 'warning',
  [OrderStatus.CONFIRMED]: 'info',
  [OrderStatus.PROCESSING]: 'info',
  [OrderStatus.SHIPPED]: 'info',
  [OrderStatus.DELIVERED]: 'success',
  [OrderStatus.CANCELLED]: 'danger',
  [OrderStatus.REFUNDED]: 'default',
}

export const VENDOR_STATUS_LABELS: Record<VendorStatus, string> = {
  [VendorStatus.PENDING]: 'Pending Review',
  [VendorStatus.APPROVED]: 'Approved',
  [VendorStatus.REJECTED]: 'Rejected',
  [VendorStatus.SUSPENDED]: 'Suspended',
}

export const VENDOR_STATUS_COLORS: Record<
  VendorStatus,
  'default' | 'info' | 'warning' | 'success' | 'danger'
> = {
  [VendorStatus.PENDING]: 'warning',
  [VendorStatus.APPROVED]: 'success',
  [VendorStatus.REJECTED]: 'danger',
  [VendorStatus.SUSPENDED]: 'default',
}

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  [ProductStatus.DRAFT]: 'Draft',
  [ProductStatus.ACTIVE]: 'Active',
  [ProductStatus.ARCHIVED]: 'Archived',
}

// ─── Validation helpers ─────────────────────────────────────────────────────

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// ─── Image helpers ──────────────────────────────────────────────────────────

export function getProductPrimaryImage(
  images: { url: string; is_primary: boolean }[],
): string {
  const primary = images.find((img) => img.is_primary)
  return primary?.url ?? images[0]?.url ?? '/placeholder-product.png'
}

export function getCloudinaryUrl(
  url: string,
  transformations: string = 'f_auto,q_auto',
): string {
  if (!url.includes('cloudinary.com')) return url
  return url.replace('/upload/', `/upload/${transformations}/`)
}

// ─── Price helpers ──────────────────────────────────────────────────────────

export function getLowestVariantPrice(
  variants: { price: number }[],
): number | null {
  if (!variants.length) return null
  return Math.min(...variants.map((v) => v.price))
}

export function calculateCartTotal(
  items: { variant: { price: number }; quantity: number }[],
): number {
  return items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0)
}

export function applyCouponDiscount(
  subtotal: number,
  discount_type: 'percentage' | 'fixed',
  discount_value: number,
): number {
  if (discount_type === 'percentage') {
    return subtotal * (discount_value / 100)
  }
  return Math.min(discount_value, subtotal)
}

// ─── Local storage helpers (non-sensitive data only) ───────────────────────

export function getFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key)
    return item ? (JSON.parse(item) as T) : fallback
  } catch {
    return fallback
  }
}

export function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage may be full or unavailable
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // Storage may be unavailable
  }
}

// ─── Array / object helpers ─────────────────────────────────────────────────

export function groupBy<T>(
  items: T[],
  keyFn: (item: T) => string,
): Record<string, T[]> {
  return items.reduce(
    (acc, item) => {
      const key = keyFn(item)
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    },
    {} as Record<string, T[]>,
  )
}

export function uniqueBy<T>(items: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = keyFn(item)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// ─── Query string helpers ───────────────────────────────────────────────────

export function buildQueryString(
  params: Record<string, string | number | boolean | undefined | null>,
): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value))
    }
  }
  const str = search.toString()
  return str ? `?${str}` : ''
}

export function parseQueryString(
  search: string,
): Record<string, string> {
  const params = new URLSearchParams(search)
  const result: Record<string, string> = {}
  params.forEach((value, key) => {
    result[key] = value
  })
  return result
}
