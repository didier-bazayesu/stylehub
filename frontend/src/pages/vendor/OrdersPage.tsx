import { useState } from 'react'
import { useVendorOrders, useUpdateOrderItemStatus } from '@/api/hooks/useOrders'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { Pagination } from '@/components/ui/Pagination'
import {  TableRowSkeleton } from '@/components/ui/Loading'
import { EmptyState } from '@/components/ui/EmptyState'
import { usePagination } from '@/hooks'
import {
  formatCurrency,
  formatDate,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
} from '@/lib/utils'
import { OrderStatus } from '@/types'
import { ShoppingCart } from 'lucide-react'

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...Object.values(OrderStatus).map((s) => ({ value: s, label: ORDER_STATUS_LABELS[s] })),
]

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  [OrderStatus.PENDING]: OrderStatus.CONFIRMED,
  [OrderStatus.CONFIRMED]: OrderStatus.PROCESSING,
  [OrderStatus.PROCESSING]: OrderStatus.SHIPPED,
  [OrderStatus.SHIPPED]: OrderStatus.DELIVERED,
}

export default function VendorOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>()
  const { page, limit, goToPage } = usePagination()

  const { data, isLoading } = useVendorOrders({ status: statusFilter, page, limit })
  const { mutate: updateStatus, isPending: updating } = useUpdateOrderItemStatus()

  const orders = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Orders</h1>
        <Select
          options={STATUS_OPTIONS}
          value={statusFilter ?? ''}
          onChange={(e) =>
            setStatusFilter((e.target.value as OrderStatus) || undefined)
          }
          className="w-44"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left dark:border-gray-800">
              {['Order', 'Customer', 'Date', 'Items', 'Total', 'Status', 'Action'].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {isLoading ? (
              [...Array(8)].map((_, i) => <TableRowSkeleton key={i} cols={7} />)
            ) : !orders.length ? (
              <tr>
                <td colSpan={7}>
                  <EmptyState
                    icon={<ShoppingCart className="h-6 w-6" />}
                    title="No orders yet"
                    description="Orders from your store will appear here."
                  />
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const vendorItems = order.items
                const canAdvance = vendorItems.some(
                  (i) => NEXT_STATUS[i.status as OrderStatus],
                )
                const currentStatus = vendorItems[0]?.status as OrderStatus

                return (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                      #{order.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {order.address?.full_name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(order.created_at)}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {vendorItems.length}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={ORDER_STATUS_COLORS[order.status]}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {canAdvance && currentStatus && NEXT_STATUS[currentStatus] && (
                        <button
                          disabled={updating}
                          onClick={() =>
                            updateStatus({
                              orderItemId: vendorItems[0].id,
                              status: NEXT_STATUS[currentStatus]!,
                            })
                          }
                          className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                          Mark as {ORDER_STATUS_LABELS[NEXT_STATUS[currentStatus]!]}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
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
