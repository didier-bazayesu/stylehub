// ─── Categories ────────────────────────────────────────────────────────────────
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store'
import { toast } from 'sonner'
import { apiClient } from '@/api/client'
import { QUERY_KEYS, STALE_TIME } from '@/config/constants'
import { buildQueryString } from '@/lib/utils'
import type {
  Address,
  AdminPlatformStats,
  AnalyticsPeriod,
  ApiResponse,
  AuditLog,
  Category,
  ChangePasswordPayload,
  Coupon,
  CreateAddressPayload,
  CreateReviewPayload,
  Notification,
  PaginationMeta,
  RevenueDataPoint,
  Review,
  Store,
  TopProduct,
  UpdateProfilePayload,
  User,
  Vendor,
  VendorOverview,
  VendorStats,
  Wishlist,
} from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────────────────────────────────────

export function useCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Category[]>>('/categories')
      return data.data
    },
    staleTime: STALE_TIME.LONG,
  })
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: QUERY_KEYS.category(slug),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Category>>(`/categories/${slug}`)
      return data.data
    },
    enabled: Boolean(slug),
    staleTime: STALE_TIME.LONG,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// USER PROFILE & ADDRESSES
// ─────────────────────────────────────────────────────────────────────────────

export function useProfile() {
  return useQuery({
    queryKey: QUERY_KEYS.profile,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<User>>('/users/profile')
      return data.data
    },
    staleTime: STALE_TIME.MEDIUM,
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const { data } = await apiClient.patch<ApiResponse<User>>('/users/profile', payload)
      return data.data
    },
    onSuccess: (user) => {
      qc.setQueryData(QUERY_KEYS.profile, user)
      qc.setQueryData(QUERY_KEYS.me, user)
      toast.success('Profile updated.')
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: ChangePasswordPayload) => {
      await apiClient.patch('/users/change-password', payload)
    },
    onSuccess: () => toast.success('Password changed successfully.'),
  })
}

export function useAddresses() {
  return useQuery({
    queryKey: QUERY_KEYS.addresses,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Address[]>>('/users/addresses')
      return data.data
    },
    staleTime: STALE_TIME.MEDIUM,
  })
}

export function useCreateAddress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateAddressPayload) => {
      const { data } = await apiClient.post<ApiResponse<Address>>(
        '/users/addresses',
        payload,
      )
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.addresses })
      toast.success('Address saved.')
    },
  })
}

export function useUpdateAddress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string
      payload: Partial<CreateAddressPayload>
    }) => {
      const { data } = await apiClient.patch<ApiResponse<Address>>(
        `/users/addresses/${id}`,
        payload,
      )
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.addresses })
      toast.success('Address updated.')
    },
  })
}

export function useDeleteAddress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/users/addresses/${id}`)
      return id
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.addresses })
      toast.success('Address removed.')
    },
  })
}

export function useSetDefaultAddress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch<ApiResponse<Address>>(
        `/users/addresses/${id}/default`,
      )
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.addresses }),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// WISHLIST
// ─────────────────────────────────────────────────────────────────────────────

export function useWishlist() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: QUERY_KEYS.wishlist,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Wishlist>>('/wishlist')
      return data.data
    },
    enabled: isAuthenticated,
    staleTime: STALE_TIME.SHORT,
  })
}

export function useAddToWishlist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (product_id: string) => {
      const { data } = await apiClient.post<ApiResponse<Wishlist>>('/wishlist', {
        product_id,
      })
      return data.data
    },
    onSuccess: (wishlist) => {
      qc.setQueryData(QUERY_KEYS.wishlist, wishlist)
    },
  })
}

export function useRemoveFromWishlist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (productId: string) => {
      const { data } = await apiClient.delete<ApiResponse<Wishlist>>(
        `/wishlist/${productId}`,
      )
      return data.data
    },
    onSuccess: (wishlist) => {
      qc.setQueryData(QUERY_KEYS.wishlist, wishlist)
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// REVIEWS
// ─────────────────────────────────────────────────────────────────────────────

export function useReviews(productId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.reviews(productId),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Review[]>>(
        `/reviews/products/${productId}`,
      )
      return data.data
    },
    enabled: Boolean(productId),
    staleTime: STALE_TIME.MEDIUM,
  })
}

export function useCreateReview(productId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateReviewPayload) => {
      const { data } = await apiClient.post<ApiResponse<Review>>(
        `/reviews/products/${productId}`,
        payload,
      )
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.reviews(productId) })
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Review submitted.')
    },
  })
}

export function useUpdateReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string
      payload: Partial<CreateReviewPayload>
    }) => {
      const { data } = await apiClient.patch<ApiResponse<Review>>(
        `/reviews/${id}`,
        payload,
      )
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews'] })
      toast.success('Review updated.')
    },
  })
}

export function useDeleteReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/reviews/${id}`)
      return id
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews'] })
      toast.success('Review removed.')
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────

export function useNotifications() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: QUERY_KEYS.notifications,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Notification[]>>('/notifications')
      return data.data
    },
    enabled: isAuthenticated,
    staleTime: STALE_TIME.SHORT,
    refetchInterval: isAuthenticated ? 60_000 : false,
  })
}

export function useMarkNotificationRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/notifications/${id}/read`)
      return id
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.notifications })
      const previous = qc.getQueryData<Notification[]>(QUERY_KEYS.notifications)
      qc.setQueryData<Notification[]>(QUERY_KEYS.notifications, (old) =>
        old?.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      )
      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        qc.setQueryData(QUERY_KEYS.notifications, context.previous)
      }
    },
  })
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await apiClient.patch('/notifications/read-all')
    },
    onSuccess: () => {
      qc.setQueryData<Notification[]>(QUERY_KEYS.notifications, (old) =>
        old?.map((n) => ({ ...n, is_read: true })),
      )
    },
  })
}

export function useDeleteNotification() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/notifications/${id}`)
      return id
    },
    onSuccess: (id) => {
      qc.setQueryData<Notification[]>(QUERY_KEYS.notifications, (old) =>
        old?.filter((n) => n.id !== id),
      )
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// VENDOR
// ─────────────────────────────────────────────────────────────────────────────

export function useVendorMe() {
  return useQuery({
    queryKey: QUERY_KEYS.vendorMe,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Vendor>>('/vendors/me')
      return data.data
    },
    staleTime: STALE_TIME.MEDIUM,
  })
}
export function useApplyVendor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      business_name: string
      business_email: string
      description?: string
    }) => {
      const { data } = await apiClient.post<ApiResponse<import('@/types').Vendor>>(
        '/vendors/apply',
        payload,
      )
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.vendorMe })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.me })
      toast.success('Application submitted! We will review it shortly.')
    },
  })
}

export function useUpdateVendorProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      business_name?: string
      business_email?: string
      description?: string
    }) => {
      const { data } = await apiClient.patch<ApiResponse<import('@/types').Vendor>>(
        '/vendors/me',
        payload,
      )
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.vendorMe })
      toast.success('Vendor profile updated.')
    },
  })
}

export function useVendorStats() {
  return useQuery({
    queryKey: QUERY_KEYS.vendorStats,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<VendorStats>>('/vendors/me/stats')
      return data.data
    },
    staleTime: STALE_TIME.SHORT,
  })
}

export function useStore(slug: string) {
  return useQuery({
    queryKey: QUERY_KEYS.store(slug),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Store>>(`/stores/${slug}`)
      return data.data
    },
    enabled: Boolean(slug),
    staleTime: STALE_TIME.MEDIUM,
  })
}

export function useUpdateStore() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<{ name: string; slug: string; description: string }>) => {
      const { data } = await apiClient.patch<ApiResponse<Store>>('/stores', payload)
      return data.data
    },
    onSuccess: (store) => {
      qc.setQueryData(QUERY_KEYS.store(store.slug), store)
      toast.success('Store updated.')
    },
  })
}

export function useUploadStoreLogo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData()
      fd.append('logo', file)
      const { data } = await apiClient.post<ApiResponse<Store>>('/stores/logo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stores'] })
      toast.success('Logo uploaded.')
    },
  })
}

export function useUploadStoreBanner() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData()
      fd.append('banner', file)
      const { data } = await apiClient.post<ApiResponse<Store>>('/stores/banner', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stores'] })
      toast.success('Banner uploaded.')
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────────────────────────────────────

export function useVendorOverview(period: AnalyticsPeriod = '30d') {
  return useQuery({
    queryKey: QUERY_KEYS.vendorOverview(period),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<VendorOverview>>(
        `/analytics/vendor/overview?period=${period}`,
      )
      return data.data
    },
    staleTime: STALE_TIME.SHORT,
  })
}

export function useVendorRevenue(period: AnalyticsPeriod = '30d') {
  return useQuery({
    queryKey: QUERY_KEYS.vendorRevenue(period),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<RevenueDataPoint[]>>(
        `/analytics/vendor/revenue?period=${period}`,
      )
      return data.data
    },
    staleTime: STALE_TIME.SHORT,
  })
}

export function useVendorTopProducts(period: AnalyticsPeriod = '30d') {
  return useQuery({
    queryKey: QUERY_KEYS.vendorTopProducts(period),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<TopProduct[]>>(
        `/analytics/vendor/top-products?period=${period}`,
      )
      return data.data
    },
    staleTime: STALE_TIME.SHORT,
  })
}

export function useAdminOverview() {
  return useQuery({
    queryKey: QUERY_KEYS.adminOverview,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<AdminPlatformStats>>(
        '/analytics/admin/overview',
      )
      return data.data
    },
    staleTime: STALE_TIME.SHORT,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENTS
// ─────────────────────────────────────────────────────────────────────────────

export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data } = await apiClient.post<
        ApiResponse<{ client_secret: string; payment_intent_id: string }>
      >('/payments/create-intent', { order_id: orderId })
      return data.data
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────────────────────────────────────────

interface AdminListParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  role?: string
}

export function useAdminUsers(params: AdminListParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.adminUsers(params),
    queryFn: async () => {
      const qs = buildQueryString(params as Record<string, string | number | undefined | null>)
      const { data } = await apiClient.get<ApiResponse<User[]> & { meta: PaginationMeta }>(
        `/admin/users${qs}`,
      )
      return data
    },
    staleTime: STALE_TIME.SHORT,
  })
}

export function useUpdateUserStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      await apiClient.patch(`/admin/users/${id}/status`, { is_active })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success('User status updated.')
    },
  })
}

export function useAdminVendors(params: AdminListParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.adminVendors(params),
    queryFn: async () => {
      const qs = buildQueryString(params as Record<string, string | number | undefined | null>)
      const { data } = await apiClient.get<ApiResponse<Vendor[]> & { meta: PaginationMeta }>(
        `/admin/vendors${qs}`,
      )
      return data
    },
    staleTime: STALE_TIME.SHORT,
  })
}

export function useApproveVendor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/admin/vendors/${id}/approve`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'vendors'] })
      toast.success('Vendor approved.')
    },
  })
}

export function useRejectVendor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      await apiClient.patch(`/admin/vendors/${id}/reject`, { reason })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'vendors'] })
      toast.success('Vendor rejected.')
    },
  })
}

export function useSuspendVendor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/admin/vendors/${id}/suspend`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'vendors'] })
      toast.success('Vendor suspended.')
    },
  })
}

export function useAdminCoupons() {
  return useQuery({
    queryKey: QUERY_KEYS.adminCoupons,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Coupon[]>>('/admin/coupons')
      return data.data
    },
    staleTime: STALE_TIME.SHORT,
  })
}

export function useCreateCoupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (
      payload: Omit<Coupon, 'id' | 'uses_count' | 'created_at'>,
    ) => {
      const { data } = await apiClient.post<ApiResponse<Coupon>>('/admin/coupons', payload)
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.adminCoupons })
      toast.success('Coupon created.')
    },
  })
}

export function useDeleteCoupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/coupons/${id}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.adminCoupons })
      toast.success('Coupon deleted.')
    },
  })
}

export function useAuditLogs(params: AdminListParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.auditLogs(params),
    queryFn: async () => {
      const qs = buildQueryString(params as Record<string, string | number | undefined | null>)
      const { data } = await apiClient.get<ApiResponse<AuditLog[]> & { meta: PaginationMeta }>(
        `/admin/audit-logs${qs}`,
      )
      return data
    },
    staleTime: STALE_TIME.SHORT,
  })
}
