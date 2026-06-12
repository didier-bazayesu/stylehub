import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '@/api/client'
import { QUERY_KEYS, ROUTES, STALE_TIME } from '@/config/constants'
import { buildQueryString } from '@/lib/utils'
import type {
  ApiResponse,
  CreateOrderPayload,
  Order,
  OrderStatus,
  PaginationMeta,
} from '@/types'

interface OrderFilters {
  page?: number
  limit?: number
  status?: OrderStatus
}

// ─── Customer: list own orders ────────────────────────────────────────────────

export function useOrders(filters: OrderFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.orders(filters),
    queryFn: async () => {
      const qs = buildQueryString(filters as Record<string, string | number | undefined | null>)
      const { data } = await apiClient.get<
        ApiResponse<Order[]> & { meta: PaginationMeta }
      >(`/orders${qs}`)
      return data
    },
    staleTime: STALE_TIME.SHORT,
  })
}

// ─── Customer: single order ───────────────────────────────────────────────────

export function useOrder(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.order(id),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`)
      return data.data
    },
    enabled: Boolean(id),
    staleTime: STALE_TIME.SHORT,
  })
}

// ─── Customer: create order ───────────────────────────────────────────────────

export function useCreateOrder() {
  const qc = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (payload: CreateOrderPayload) => {
      const { data } = await apiClient.post<ApiResponse<Order>>('/orders', payload)
      return data.data
    },
    onSuccess: (order) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.cart })
      qc.invalidateQueries({ queryKey: ['orders'] })
      navigate(ROUTES.CUSTOMER.ORDER(order.id))
    },
  })
}

// ─── Vendor: list vendor orders ───────────────────────────────────────────────

export function useVendorOrders(filters: OrderFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.vendorOrders(filters),
    queryFn: async () => {
      const qs = buildQueryString(filters as Record<string, string | number | undefined | null>)
      const { data } = await apiClient.get<
        ApiResponse<Order[]> & { meta: PaginationMeta }
      >(`/orders/vendor${qs}`)
      return data
    },
    staleTime: STALE_TIME.SHORT,
  })
}

// ─── Vendor: update order item status ────────────────────────────────────────

export function useUpdateOrderItemStatus() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      orderItemId,
      status,
    }: {
      orderItemId: string
      status: OrderStatus
    }) => {
      const { data } = await apiClient.patch<ApiResponse<Order>>(
        `/orders/vendor/${orderItemId}/status`,
        { status },
      )
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor', 'orders'] })
      toast.success('Order status updated.')
    },
  })
}
