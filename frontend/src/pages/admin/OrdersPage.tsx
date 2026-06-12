import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { Pagination } from '@/components/ui/Pagination'
import { TableRowSkeleton } from '@/components/ui/Loading'
import { EmptyState } from '@/components/ui/EmptyState'
import { usePagination } from '@/hooks'
import { buildQueryString, formatCurrency, formatDate, ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '@/lib/utils'
import { OrderStatus, type Order, type ApiResponse, type PaginationMeta } from '@/types'
import { QUERY_KEYS } from '@/config/constants'

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...Object.values(OrderStatus).map((s) => ({ value: s, label: ORDER_STATUS_LABELS[s] })),
]

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>()
  const { page, limit, goToPage } = usePagination({ initialLimit: 25 })

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.adminOrders({ status: statusFilter, page, limit }),
    queryFn: async () => {
      const qs = buildQueryString({ status: statusFilter, page, limit })
      const { data } = await apiClient.get<ApiResponse<Order[]> & { meta: PaginationMeta }>(
        `/admin/orders${qs}`,
      )
      return data
    },
  })

  const orders = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">All Orders</h1>
        <Select
          options={STATUS_OPTIONS}
          value={statusFilter ?? ''}
          onChange={(e) => setStatusFilter((e.target.value as OrderStatus) || undefined)}
          className="w-44"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left dark:border-gray-800">
              {['Order', 'Customer', 'Date', 'Items', 'Total', 'Payment', 'Status'].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {isLoading
              ? [...Array(10)].map((_, i) => <TableRowSkeleton key={i} cols={7} />)
              : !orders.length
              ? <tr><td colSpan={7}><EmptyState title="No orders found" /></td></tr>
              : orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                    #{order.id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {order.address?.full_name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(order.created_at)}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{order.items?.length ?? 0}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-4 py-3">
                    {order.payment && (
                      <Badge variant={order.payment.status === 'COMPLETED' ? 'success' : 'warning'}>
                        {order.payment.status}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={ORDER_STATUS_COLORS[order.status]}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
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
