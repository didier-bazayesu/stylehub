import { useCallback, useEffect, useState } from 'react'
import { getGuestCart, type GuestCartItem } from '@/lib/guestCart'

/**
 * Reactive hook for the guest (localStorage) cart.
 * Re-reads automatically whenever any add/update/remove happens —
 * including from other tabs (via the 'storage' event) and within
 * the same tab (via the custom 'guest-cart-updated' event).
 */
export function useGuestCart(): GuestCartItem[] {
  const [items, setItems] = useState<GuestCartItem[]>(() => getGuestCart())

  const refresh = useCallback(() => setItems(getGuestCart()), [])

  useEffect(() => {
    window.addEventListener('guest-cart-updated', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('guest-cart-updated', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [refresh])

  return items
}