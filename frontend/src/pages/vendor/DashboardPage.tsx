import { Link } from 'react-router-dom'
import { Package, ShoppingCart, Plus, ArrowRight, DollarSign, Users } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { useVendorOrders } from '@/api/hooks/useOrders'
import { StatsCard } from '@/components/shared/cards'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PageLoader, Skeleton } from '@/components/ui/Loading'
import { ErrorState } from '@/components/ui/EmptyState'
import { QUERY_KEYS, ROUTES, STALE_TIME } from '@/config/constants'
import {
  formatCurrency,
  formatDate,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
} from '@/lib/utils'
import type { ApiResponse, VendorOverview } from '@/types'

export default function VendorDashboardPage() {
  const { data: stats, isLoading: statsLoading, isError } = useQuery({
    queryKey: QUERY_KEYS.vendorOverview('30d'),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<VendorOverview>>(
        '/analytics/vendor/overview?period=30d',
      )
      return data.data
    },
    staleTime: STALE_TIME.SHORT,
  })

  const { data: ordersData, isLoading: ordersLoading } = useVendorOrders({
    limit: 5,
  })

  if (statsLoading) return <PageLoader />
  if (isError) return <ErrorState onRetry={() => window.location.reload()} />

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Overview</h1>
          <p className="text-sm text-gray-500">Last 30 days</p>
        </div>
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          size="sm"
          asChild
        >
          <Link to={ROUTES.VENDOR.PRODUCT_NEW}>Add product</Link>
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          label="Revenue"
          value={stats ? formatCurrency(stats.total_revenue) : '—'}
          change={stats?.revenue_change}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatsCard
          label="Orders"
          value={stats?.total_orders ?? 0}
          change={stats?.orders_change}
          icon={<ShoppingCart className="h-4 w-4" />}
        />
        <StatsCard
          label="Products"
          value={stats?.total_products ?? 0}
          icon={<Package className="h-4 w-4" />}
        />
        <StatsCard
          label="Customers"
          value={stats?.total_customers ?? 0}
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      {/* Recent orders */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-900 dark:text-white">
            Recent orders
          </h2>
          <Link
            to={ROUTES.VENDOR.ORDERS}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
          {ordersLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !ordersData?.data?.length ? (
            <p className="p-8 text-center text-sm text-gray-500">
              No orders yet. Share your store link to start selling.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left dark:border-gray-800">
                  <th className="px-4 py-3 text-xs font-medium text-gray-500">Order</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500">Date</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {ordersData.data.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                      #{order.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={ORDER_STATUS_COLORS[order.status]}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(order.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  )
}
