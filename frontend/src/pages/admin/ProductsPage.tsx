import { useState } from 'react'
import { useAdminDeleteProduct, useProducts } from '@/api/hooks/useProducts'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { TableRowSkeleton } from '@/components/ui/Loading'
import { EmptyState } from '@/components/ui/EmptyState'
import { usePagination, useDebounce } from '@/hooks'
import {
  formatCurrency,
  getProductPrimaryImage,
  PRODUCT_STATUS_LABELS,
  truncate,
} from '@/lib/utils'
import { ProductStatus } from '@/types'
import { Search, Trash2 } from 'lucide-react'

const STATUS_BADGE: Record<ProductStatus, 'default' | 'success' | 'warning'> = {
  [ProductStatus.DRAFT]: 'warning',
  [ProductStatus.ACTIVE]: 'success',
  [ProductStatus.ARCHIVED]: 'default',
}

export default function AdminProductsPage() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 350)
  const { page, limit, goToPage } = usePagination({ initialLimit: 25 })
  const { mutate: deleteProduct } = useAdminDeleteProduct();

  const { data, isLoading } = useProducts({ search: debouncedSearch || undefined, page, limit })
  const products = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="p-6">
      <h1 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">All Products</h1>

      <div className="mb-4 relative w-72">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left dark:border-gray-800">
              {['Product', 'Vendor', 'Category', 'Price', 'Stock', 'Status', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {isLoading
              ? [...Array(10)].map((_, i) => <TableRowSkeleton key={i} cols={7} />)
              : !products.length
              ? <tr><td colSpan={7}><EmptyState title="No products found" /></td></tr>
              : products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        <img
                          src={getProductPrimaryImage(product.images ?? [])}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {truncate(product.name, 36)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {product.vendor?.business_name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{product.category?.name}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {formatCurrency(product.base_price)}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {product.total_stock}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_BADGE[product.status]}>
                      {PRODUCT_STATUS_LABELS[product.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        if (confirm('Force-delete this product?')) deleteProduct(product.id)
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination meta={meta} onPageChange={goToPage} />
        </div>
      )}
    </div>
  )
}
