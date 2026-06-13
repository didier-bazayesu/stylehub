import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/api/client'
import { QUERY_KEYS, STALE_TIME } from '@/config/constants'
import { useCartStore, useAuthStore } from '@/store'
import type { AddToCartPayload, ApiResponse, Cart } from '@/types'

export function useCart() {
  const { isAuthenticated } = useAuthStore()
  const { setCart } = useCartStore()

  return useQuery({
    queryKey: QUERY_KEYS.cart,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Cart>>('/cart')
      setCart(data.data)
      return data.data
    },
    enabled: isAuthenticated,
    staleTime: STALE_TIME.INSTANT,
  })
}

export function useAddToCart() {
  const qc = useQueryClient()


  return useMutation({
    mutationFn: async (payload: AddToCartPayload) => {
      const { data } = await apiClient.post<ApiResponse<Cart>>('/cart/items', payload)
      return data.data
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.cart })
      const previous = qc.getQueryData<Cart>(QUERY_KEYS.cart)

      // Optimistic: inject a temporary item
      // Real item data populated on success
      return { previous }
    },
    onSuccess: (cart) => {
      qc.setQueryData(QUERY_KEYS.cart, cart)
      useCartStore.getState().setCart(cart)
      toast.success('Added to cart.')
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(QUERY_KEYS.cart, context.previous)
      }
    },
  })
}

export function useUpdateCartItem() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      variantId,
      quantity,
    }: {
      variantId: string
      quantity: number
    }) => {
      const { data } = await apiClient.patch<ApiResponse<Cart>>(
        `/cart/items/${variantId}`,
        { quantity },
      )
      return data.data
    },
    onMutate: async ({ variantId, quantity }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.cart })
      const previous = qc.getQueryData<Cart>(QUERY_KEYS.cart)
      useCartStore.getState().optimisticUpdateItem(variantId, quantity)
      return { previous }
    },
    onSuccess: (cart) => {
      qc.setQueryData(QUERY_KEYS.cart, cart)
      useCartStore.getState().setCart(cart)
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(QUERY_KEYS.cart, context.previous)
        useCartStore.getState().setCart(context.previous)
      }
    },
  })
}

export function useRemoveFromCart() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (variantId: string) => {
      const { data } = await apiClient.delete<ApiResponse<Cart>>(
        `/cart/items/${variantId}`,
      )
      return data.data
    },
    onMutate: async (variantId) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.cart })
      const previous = qc.getQueryData<Cart>(QUERY_KEYS.cart)
      useCartStore.getState().optimisticRemoveItem(variantId)
      return { previous }
    },
    onSuccess: (cart) => {
      qc.setQueryData(QUERY_KEYS.cart, cart)
      useCartStore.getState().setCart(cart)
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(QUERY_KEYS.cart, context.previous)
        useCartStore.getState().setCart(context.previous)
      }
    },
  })
}

export function useClearCart() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await apiClient.delete('/cart')
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.cart })
      useCartStore.getState().clearCart()
    },
  })
}
