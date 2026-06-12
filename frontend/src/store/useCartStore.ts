import { create } from 'zustand'
import type { Cart, CartItem } from '@/types'

interface CartState {
  cart: Cart | null
  isOpen: boolean

  // Derived
  itemCount: number
  total: number

  // Actions
  setCart: (cart: Cart) => void
  optimisticAddItem: (item: CartItem) => void
  optimisticUpdateItem: (variantId: string, quantity: number) => void
  optimisticRemoveItem: (variantId: string) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
}

export const useCartStore = create<CartState>()((set, get) => ({
  cart: null,
  isOpen: false,

  get itemCount() {
    return get().cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0
  },

  get total() {
    return (
      get().cart?.items.reduce(
        (sum, item) => sum + item.variant.price * item.quantity,
        0,
      ) ?? 0
    )
  },

  setCart: (cart) => set({ cart }),

  optimisticAddItem: (newItem) =>
    set((state) => {
      if (!state.cart) return state
      const existing = state.cart.items.find(
        (i) => i.variant_id === newItem.variant_id,
      )
      const updatedItems = existing
        ? state.cart.items.map((i) =>
            i.variant_id === newItem.variant_id
              ? { ...i, quantity: i.quantity + newItem.quantity }
              : i,
          )
        : [...state.cart.items, newItem]
      return { cart: { ...state.cart, items: updatedItems } }
    }),

  optimisticUpdateItem: (variantId, quantity) =>
    set((state) => {
      if (!state.cart) return state
      const updatedItems = state.cart.items.map((i) =>
        i.variant_id === variantId ? { ...i, quantity } : i,
      )
      return { cart: { ...state.cart, items: updatedItems } }
    }),

  optimisticRemoveItem: (variantId) =>
    set((state) => {
      if (!state.cart) return state
      const updatedItems = state.cart.items.filter(
        (i) => i.variant_id !== variantId,
      )
      return { cart: { ...state.cart, items: updatedItems } }
    }),

  clearCart: () =>
    set((state) => ({
      cart: state.cart ? { ...state.cart, items: [] } : null,
    })),

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
}))
