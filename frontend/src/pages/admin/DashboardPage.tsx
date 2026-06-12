import { DollarSign, Package, ShoppingCart, Store, Users } from 'lucide-react'
import { useAdminOverview } from '@/api/hooks'
import { StatsCard } from '@/components/shared/cards'
import { PageLoader } from '@/components/ui/Loading'
import { ErrorState } from '@/components/ui/EmptyState'
import { formatCurrency } from '@/lib/utils'

export default function AdminDashboardPage() {
  const { data: stats, isLoading, isError, refetch } = useAdminOverview()

  if (isLoading) return <PageLoader />
  if (isError) return <ErrorState onRetry={() => refetch()} />

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Platform overview</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatsCard
          label="Total revenue"
          value={stats ? formatCurrency(stats.total_revenue) : '—'}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatsCard
          label="Total users"
          value={stats?.total_users ?? 0}
          icon={<Users className="h-4 w-4" />}
        />
        <StatsCard
          label="Vendors"
          value={stats?.total_vendors ?? 0}
          icon={<Store className="h-4 w-4" />}
        />
        <StatsCard
          label="Products"
          value={stats?.total_products ?? 0}
          icon={<Package className="h-4 w-4" />}
        />
        <StatsCard
          label="Orders"
          value={stats?.total_orders ?? 0}
          icon={<ShoppingCart className="h-4 w-4" />}
        />
      </div>
    </div>
  )
}
