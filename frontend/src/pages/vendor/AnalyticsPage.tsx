import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { useVendorOverview, useVendorRevenue, useVendorTopProducts } from '@/api/hooks'
import { StatsCard } from '@/components/shared/cards'
import { PageLoader, Skeleton } from '@/components/ui/Loading'
import { formatCurrency, formatDate, truncate } from '@/lib/utils'
import type { AnalyticsPeriod } from '@/types'
import { DollarSign, Package, ShoppingCart, Users } from 'lucide-react'

const PERIODS: { value: AnalyticsPeriod; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: '1y', label: '1 year' },
]

export default function VendorAnalyticsPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>('30d')

  const { data: overview, isLoading: overviewLoading } = useVendorOverview(period)
  const { data: revenue, isLoading: revenueLoading } = useVendorRevenue(period)
  const { data: topProducts, isLoading: topLoading } = useVendorTopProducts(period)

  if (overviewLoading) return <PageLoader />

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Analytics</h1>

        {/* Period selector */}
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700">
          {PERIODS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors first:rounded-l-lg last:rounded-r-lg ${
                period === value
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          label="Revenue"
          value={overview ? formatCurrency(overview.total_revenue) : '—'}
          change={overview?.revenue_change}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatsCard
          label="Orders"
          value={overview?.total_orders ?? 0}
          change={overview?.orders_change}
          icon={<ShoppingCart className="h-4 w-4" />}
        />
        <StatsCard
          label="Products"
          value={overview?.total_products ?? 0}
          icon={<Package className="h-4 w-4" />}
        />
        <StatsCard
          label="Customers"
          value={overview?.total_customers ?? 0}
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      {/* Revenue chart */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-5 text-sm font-semibold text-gray-900 dark:text-white">
          Revenue over time
        </h2>
        {revenueLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenue ?? []} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-800" />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => formatDate(d, { month: 'short', day: 'numeric' })}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `$${v}`}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                labelFormatter={(label) => formatDate(label, { month: 'long', day: 'numeric' })}
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#111827"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top products */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-5 text-sm font-semibold text-gray-900 dark:text-white">
          Top products by revenue
        </h2>
        {topLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : !topProducts?.length ? (
          <p className="py-6 text-center text-sm text-gray-400">No sales data yet.</p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Bar chart */}
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={topProducts.slice(0, 8)}
                layout="vertical"
                margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  className="stroke-gray-100 dark:stroke-gray-800"
                />
                <XAxis
                  type="number"
                  tickFormatter={(v) => `$${v}`}
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={90}
                  tickFormatter={(v) => truncate(v, 12)}
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(v: number) => [formatCurrency(v), 'Revenue']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="#111827" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>

            {/* Table */}
            <div className="flex flex-col gap-2">
              {topProducts.slice(0, 5).map((p, i) => (
                <div key={p.product_id} className="flex items-center gap-3">
                  <span className="w-5 text-xs font-semibold text-gray-400">#{i + 1}</span>
                  {p.image_url && (
                    <div className="h-8 w-8 shrink-0 overflow-hidden rounded bg-gray-100">
                      <img src={p.image_url} alt="" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-gray-900 dark:text-gray-100">
                      {p.name}
                    </p>
                    <p className="text-xs text-gray-400">{p.units_sold} sold</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(p.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
