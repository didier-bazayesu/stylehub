import type { Product, ProductVariant } from '@/types'

const STORAGE_KEY = 'stylehub_guest_cart'

export interface GuestCartItem {
  variant_id: string
  product_id: string
  quantity: number
  product: Product
  variant: ProductVariant
  added_at: string
}

export function getGuestCart(): GuestCartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveGuestCart(items: GuestCartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // localStorage unavailable — fail silently
  }
  // Notify any listeners in the same tab (storage event only fires cross-tab)
  window.dispatchEvent(new Event('guest-cart-updated'))
}

export function addGuestCartItem(item: {
  variant_id: string
  product_id: string
  quantity: number
  product: Product
  variant: ProductVariant
}) {
  const items = getGuestCart()
  const existing = items.find((i) => i.variant_id === item.variant_id)

  if (existing) {
    existing.quantity += item.quantity
  } else {
    items.push({ ...item, added_at: new Date().toISOString() })
  }

  saveGuestCart(items)
}

export function updateGuestCartItem(variantId: string, quantity: number) {
  const items = getGuestCart().map((i) =>
    i.variant_id === variantId ? { ...i, quantity } : i,
  )
  saveGuestCart(items)
}

export function removeGuestCartItem(variantId: string) {
  const items = getGuestCart().filter((i) => i.variant_id !== variantId)
  saveGuestCart(items)
}

export function clearGuestCart() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event('guest-cart-updated'))
}