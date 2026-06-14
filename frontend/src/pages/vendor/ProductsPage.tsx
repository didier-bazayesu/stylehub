import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Eye, EyeOff, Search } from 'lucide-react'
import { useProducts } from '@/api/hooks/useProducts'
import { useDeleteProduct, useUpdateProductStatus } from '@/api/hooks/useProducts'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { TableRowSkeleton } from '@/components/ui/Loading'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAuthStore } from '@/store'
import {
  formatCurrency,
  getProductPrimaryImage,
  PRODUCT_STATUS_LABELS,
  truncate,
} from '@/lib/utils'
import { useDebounce } from '@/hooks'
import { ProductStatus } from '@/types'
import { ROUTES } from '@/config/constants'

const STATUS_BADGE: Record<ProductStatus, 'default' | 'success' | 'warning'> = {
  [ProductStatus.DRAFT]: 'warning',
  [ProductStatus.ACTIVE]: 'success',
  [ProductStatus.ARCHIVED]: 'default',
}

export default function VendorProductsPage() {
  const { user } = useAuthStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProductStatus | undefined>()
  const debouncedSearch = useDebounce(search, 400)

  const { data, isLoading } = useProducts({
    vendor: user?.vendor?.store?.slug,
    search: debouncedSearch || undefined,
    status: statusFilter,
  })

  const { mutate: deleteProduct } = useDeleteProduct()
  const { mutate: updateStatus } = useUpdateProductStatus()

  const products = data?.data ?? []

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Products</h1>
        <Button leftIcon={<Plus className="h-4 w-4" />} size="sm" asChild>
          <Link to={ROUTES.VENDOR.PRODUCT_NEW}>Add product</Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        {([undefined, ProductStatus.DRAFT, ProductStatus.ACTIVE, ProductStatus.ARCHIVED] as const).map(
          (s) => (
            <button
              key={s ?? 'all'}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900'
                  : 'border-gray-200 text-gray-600 hover:border-gray-400 dark:border-gray-700 dark:text-gray-400'
              }`}
            >
              {s ? PRODUCT_STATUS_LABELS[s] : 'All'}
            </button>
          ),
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left dark:border-gray-800">
              <th className="px-4 py-3 text-xs font-medium text-gray-500">Product</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500">Price</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500">Stock</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500">Reviews</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {isLoading ? (
              [...Array(8)].map((_, i) => <TableRowSkeleton key={i} cols={6} />)
            ) : !products.length ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState title="No products yet" description="Add your first product to start selling." />
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const image = getProductPrimaryImage(product.images ?? [])
                return (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          <img
                            src={image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {truncate(product.name, 40)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {product.category?.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_BADGE[product.status]}>
                        {PRODUCT_STATUS_LABELS[product.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {formatCurrency(product.base_price)}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {product.total_stock}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {product.review_count}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {/* Toggle active/draft */}
                        <button
                          onClick={() =>
                            updateStatus({
                              id: product.id,
                              status:
                                product.status === ProductStatus.ACTIVE
                                  ? ProductStatus.DRAFT
                                  : ProductStatus.ACTIVE,
                            })
                          }
                          className="flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700"
                          title={
                            product.status === ProductStatus.ACTIVE
                              ? "Deactivate"
                              : "Activate"
                          }
                        >
                          {product.status === ProductStatus.ACTIVE ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </button>

                        <Link
                          to={ROUTES.VENDOR.PRODUCT_EDIT(product.slug)}
                          className="flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>

                        <button
                          onClick={() => {
                            if (confirm("Delete this product?"))
                              deleteProduct(product.id);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
