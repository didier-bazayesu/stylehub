import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/api/client'
import { QUERY_KEYS, STALE_TIME } from '@/config/constants'
import { useAuthStore } from '@/store'
import {
  addGuestCartItem,
  updateGuestCartItem,
  removeGuestCartItem,
  clearGuestCart,
} from '@/lib/guestCart'
import type { AddToCartPayload, ApiResponse, Cart, Product, ProductVariant } from '@/types'

// ─── Server cart (authenticated only) ─────────────────────────────────────────

export function useCart() {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: QUERY_KEYS.cart,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Cart>>('/cart')
      return data.data
    },
    enabled: isAuthenticated,
    staleTime: STALE_TIME.INSTANT,
  })
}

// ─── Add to cart — guest (localStorage) OR authenticated (API) ───────────────

export function useAddToCart() {
  const qc = useQueryClient()
  const { isAuthenticated } = useAuthStore()

  return useMutation({
    mutationFn: async ({
      payload,
      product,
      variant,
    }: {
      payload: AddToCartPayload
      product: Product
      variant: ProductVariant
    }) => {
      if (!isAuthenticated) {
        addGuestCartItem({
          variant_id: payload.variant_id,
          product_id: product.id,
          quantity: payload.quantity,
          product,
          variant,
        })
        return null
      }

      const { data } = await apiClient.post<ApiResponse<Cart>>('/cart/items', payload)
      return data.data
    },
    onSuccess: (cart) => {
      if (cart) {
        qc.setQueryData(QUERY_KEYS.cart, cart)
      }
      toast.success('Added to cart.')
    },
  })
}

// ─── Update cart item ─────────────────────────────────────────────────────────

export function useUpdateCartItem() {
  const qc = useQueryClient()
  const { isAuthenticated } = useAuthStore()

  return useMutation({
    mutationFn: async ({ variantId, quantity }: { variantId: string; quantity: number }) => {
      if (!isAuthenticated) {
        updateGuestCartItem(variantId, quantity)
        return null
      }
      const { data } = await apiClient.patch<ApiResponse<Cart>>(
        `/cart/items/${variantId}`,
        { quantity },
      )
      return data.data
    },
    onMutate: async ({ variantId, quantity }) => {
      if (!isAuthenticated) return
      await qc.cancelQueries({ queryKey: QUERY_KEYS.cart })
      const previous = qc.getQueryData<Cart>(QUERY_KEYS.cart)
      qc.setQueryData<Cart>(QUERY_KEYS.cart, (old) =>
        old
          ? {
              ...old,
              items: old.items.map((i) =>
                i.variant_id === variantId ? { ...i, quantity } : i,
              ),
            }
          : old,
      )
      return { previous }
    },
    onSuccess: (cart) => {
      if (cart) qc.setQueryData(QUERY_KEYS.cart, cart)
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(QUERY_KEYS.cart, context.previous)
    },
  })
}

// ─── Remove from cart ─────────────────────────────────────────────────────────


export function useRemoveFromCart() {
  const qc = useQueryClient()
  const { isAuthenticated } = useAuthStore()

  return useMutation({
    mutationFn: async (variantId: string) => {
      if (!variantId) throw new Error('variantId is required')  // ← guard

      if (!isAuthenticated) {
        removeGuestCartItem(variantId)
        return null
      }
      const { data } = await apiClient.delete<ApiResponse<Cart>>(
        `/cart/items/${variantId}`,
      )
     
     console.log('cart items:', data.data.items.map(i => ({ id: i.id, variant_id: i.variant_id })))
      return data.data
    },
    onMutate: async (variantId) => {
      if (!isAuthenticated) return
      await qc.cancelQueries({ queryKey: QUERY_KEYS.cart })
      const previous = qc.getQueryData<Cart>(QUERY_KEYS.cart)
      qc.setQueryData<Cart>(QUERY_KEYS.cart, (old) =>
        old
          ? { ...old, items: old.items.filter((i) => i.variant_id !== variantId) }
          : old,
      )
      return { previous }
    },
    onSuccess: (cart) => {
      if (cart) qc.setQueryData(QUERY_KEYS.cart, cart)
      else qc.invalidateQueries({ queryKey: QUERY_KEYS.cart })
    },
    onError: (_err, _vars, context) => {
      // Rollback optimistic update on error
      if (context?.previous) {
        qc.setQueryData(QUERY_KEYS.cart, context.previous)
      }
    },
  })
}

// ─── Clear cart ───────────────────────────────────────────────────────────────

export function useClearCart() {
  const qc = useQueryClient()
  const { isAuthenticated } = useAuthStore()

  return useMutation({
    mutationFn: async () => {
      if (!isAuthenticated) {
        clearGuestCart()
        return
      }
      await apiClient.delete('/cart')
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.cart })
    },
  })
}