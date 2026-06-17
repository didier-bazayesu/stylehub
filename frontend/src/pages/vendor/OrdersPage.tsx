import { useState } from 'react'
import { useVendorOrders, useUpdateOrderItemStatus } from '@/api/hooks/useOrders'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { Pagination } from '@/components/ui/Pagination'
import { TableRowSkeleton } from '@/components/ui/Loading'
import { EmptyState } from '@/components/ui/EmptyState'
import { usePagination } from '@/hooks'
import {
  formatCurrency,
  formatDate,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
} from '@/lib/utils'
import { OrderStatus, type VendorOrderItem } from '@/types'
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

function getCustomerName(item: VendorOrderItem): string {
  if (item.order.address?.full_name) {
    return item.order.address.full_name
  }
  const { first_name, last_name } = item.order.user
  return [first_name, last_name].filter(Boolean).join(' ') || item.order.user.email
}

export default function VendorOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>()
  const { page, limit, goToPage } = usePagination()

  const { data, isLoading } = useVendorOrders({ status: statusFilter, page, limit })
  const { mutate: updateStatus, isPending: updating } = useUpdateOrderItemStatus()

  const orderItems = data?.data ?? []
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
              {['Order', 'Customer Details', 'Date', 'Items', 'Total', 'Status', 'Action'].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {isLoading ? (
              [...Array(8)].map((_, i) => <TableRowSkeleton key={i} cols={7} />)
            ) : !orderItems.length ? (
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
              orderItems.map((item) => {
                const nextStatus = NEXT_STATUS[item.status]

                return (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                      #{item.order.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {getCustomerName(item)}
                        </span>
                        {item.order.address?.phone && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {item.order.address.phone}
                          </span>
                        )}
                        <span className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                          {item.order.user.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(item.order.created_at)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {item.quantity}×
                      </span>{' '}
                      {item.product.name}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(Number(item.total_price))}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={ORDER_STATUS_COLORS[item.status]}>
                        {ORDER_STATUS_LABELS[item.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {nextStatus && (
                        <button
                          disabled={updating}
                          onClick={() =>
                            updateStatus({
                              orderItemId: item.id,
                              status: nextStatus,
                            })
                          }
                          className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                          Mark as {ORDER_STATUS_LABELS[nextStatus]}
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
