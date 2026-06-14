import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { toast } from 'sonner'
import { apiClient } from '@/api/client'
import { QUERY_KEYS, STALE_TIME } from '@/config/constants'
import { buildQueryString } from '@/lib/utils'
import type {
  ApiResponse,
  CreateProductPayload,
  CreateVariantPayload,
  CursorPaginationMeta,
  PaginationMeta,
  Product,
  ProductFilters,
  ProductStatus,
  ProductVariant,
  VendorProduct,
} from '@/types'

// ─── List products (public) ───────────────────────────────────────────────────

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.products(filters),
    queryFn: async () => {
      const qs = buildQueryString(filters as Record<string, string | number | undefined | null>)
      const { data } = await apiClient.get<
        ApiResponse<Product[]> & { meta: CursorPaginationMeta }
      >(`/products${qs}`)
      return data
    },
    staleTime: STALE_TIME.MEDIUM,
  })
}

// ─── List vendor's own products (all statuses — for vendor dashboard) ─────────
// Calls GET /products/manage which is authenticated and returns DRAFT,
// ACTIVE, and ARCHIVED products with the status field always present.

export function useVendorProducts(filters: Omit<ProductFilters, 'vendor'> = {}) {
  return useQuery({
    queryKey: ['products', 'manage', filters],
    queryFn: async () => {
      const qs = buildQueryString(filters as Record<string, string | number | undefined | null>)
      const { data } = await apiClient.get<
        ApiResponse<VendorProduct[]> & { meta: PaginationMeta }
      >(`/products/manage${qs}`)
      return data
    },
    staleTime: STALE_TIME.SHORT,
  })
}

// ─── Infinite products (for feed / catalog) ───────────────────────────────────

export function useInfiniteProducts(filters: Omit<ProductFilters, 'cursor'> = {}) {
  return useInfiniteQuery({
    queryKey: ['products', 'infinite', filters],
    queryFn: async ({ pageParam }) => {
      const qs = buildQueryString({
        ...(filters as Record<string, string | number | undefined | null>),
        cursor: pageParam as string | undefined,
      })
      const { data } = await apiClient.get<
        ApiResponse<Product[]> & { meta: CursorPaginationMeta }
      >(`/products${qs}`)
      return data
    },
    getNextPageParam: (lastPage) =>
      lastPage.meta?.hasMore ? lastPage.meta.nextCursor : undefined,
    initialPageParam: undefined as string | undefined,
    staleTime: STALE_TIME.MEDIUM,
  })
}

// ─── Single product ───────────────────────────────────────────────────────────

export function useProduct(slug: string) {
  return useQuery({
    queryKey: QUERY_KEYS.product(slug),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Product>>(`/products/${slug}`)
      return data.data
    },
    staleTime: STALE_TIME.MEDIUM,
    enabled: Boolean(slug),
  })
}

export function useVendorProduct(slug: string) {
  return useQuery({
    queryKey: ['products', 'manage', slug],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Product>>(`/products/manage/${slug}`)
      return data.data
    },
    staleTime: STALE_TIME.MEDIUM,
    enabled: Boolean(slug),
  })
}

// ─── Featured products ────────────────────────────────────────────────────────

export function useFeaturedProducts() {
  return useQuery({
    queryKey: QUERY_KEYS.featuredProducts,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Product[]>>('/products/featured')
      const result = data.data
      return Array.isArray(result) ? result : []   // ← changed line
    },
    staleTime: STALE_TIME.MEDIUM,
  })
}

// ─── Vendor: Create product ───────────────────────────────────────────────────

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateProductPayload) => {
      const { data } = await apiClient.post<ApiResponse<Product>>('/products', payload)
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product created as draft.')
    },
  })
}

// ─── Vendor: Update product ───────────────────────────────────────────────────

export function useUpdateProduct(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<CreateProductPayload>) => {
      const { data } = await apiClient.patch<ApiResponse<Product>>(
        `/products/${id}`,
        payload,
      )
      return data.data
    },
    onSuccess: (product) => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.setQueryData(QUERY_KEYS.product(product.slug), product)
      toast.success('Product updated.')
    },
  })
}

// ─── Vendor: Delete product ───────────────────────────────────────────────────

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/products/${id}`)
      return id
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product deleted.')
    },
  })
}

// ─── Vendor: Toggle product status ────────────────────────────────────────────

export function useUpdateProductStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ProductStatus }) => {
      const { data } = await apiClient.patch<ApiResponse<Product>>(
        `/products/${id}/status`,
        { status },
      )
      return data.data
    },
    onSuccess: (product) => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.setQueryData(QUERY_KEYS.product(product.slug), product)
      toast.success(`Product set to ${product.status.toLowerCase()}.`)
    },
  })
}

// ─── Vendor: Upload product images ────────────────────────────────────────────

export function useUploadProductImages(productId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData()
      files.forEach((file) => formData.append('files', file))
      const { data } = await apiClient.post<ApiResponse<Product>>(
        `/products/${productId}/images`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Images uploaded.')
    },
  })
}

// ─── Vendor: Add variant ──────────────────────────────────────────────────────

export function useAddVariant(productId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateVariantPayload) => {
      const { data } = await apiClient.post<ApiResponse<ProductVariant>>(
        `/products/${productId}/variants`,
        payload,
      )
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Variant added.')
    },
  })
}

// ─── Vendor: Update variant ───────────────────────────────────────────────────

export function useUpdateVariant(productId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      variantId,
      payload,
    }: {
      variantId: string
      payload: Partial<CreateVariantPayload>
    }) => {
      const { data } = await apiClient.patch<ApiResponse<ProductVariant>>(
        `/products/${productId}/variants/${variantId}`,
        payload,
      )
      return data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useAdminDeleteProduct() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/products/${id}`)
      return id
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product deleted.')
    },
  })
}

//ADDEDE HOOKS --------------------------------//

// ─── Vendor: Delete variant ───────────────────────────────────────────────────
export function useDeleteVariant(productId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ variantId }: { variantId: string }) => {
      await apiClient.delete(`/products/${productId}/variants/${variantId}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      if (productId) {
        qc.invalidateQueries({ queryKey: QUERY_KEYS.product(productId) })
      }
      toast.success('Variant deleted successfully.')
    },
    onError: (error: unknown) => {
      const axiosError = error instanceof AxiosError ? error : null
      toast.error(axiosError?.response?.data?.message || 'Failed to delete variant.')
    },
  })
}

// ─── Vendor: Delete product image ─────────────────────────────────────────────
export function useDeleteProductImage(productId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ imageId }: { imageId: string }) => {
      await apiClient.delete(`/products/${productId}/images/${imageId}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      if (productId) {
        qc.invalidateQueries({ queryKey: QUERY_KEYS.product(productId) })
      }
      toast.success('Image deleted successfully.')
    },
    onError: (error: unknown) => {
      const axiosError = error instanceof AxiosError ? error : null
      toast.error(axiosError?.response?.data?.message || 'Failed to delete image.')
    },
  })
}
