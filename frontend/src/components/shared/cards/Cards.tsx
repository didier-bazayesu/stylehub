import { Link } from 'react-router-dom'
import { ArrowUpRight, TrendingDown, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { cn, formatCurrency, formatDate, formatCompactNumber, formatPercentage } from '@/lib/utils'
import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
} from '@/lib/utils'
import { ROUTES } from '@/config/constants'
import type { Order } from '@/types'

// ─── Order card ───────────────────────────────────────────────────────────────

interface OrderCardProps {
  order: Order
  className?: string
}

export function OrderCard({ order, className }: OrderCardProps) {
  const firstItem = order.items?.[0]
  const imageUrl = firstItem?.product?.images?.find((i) => i.is_primary)?.url

  return (
    <Link
      to={ROUTES.CUSTOMER.ORDER(order.id)}
      className={cn(
        'flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4',
        'transition-shadow hover:shadow-sm dark:border-gray-800 dark:bg-gray-900',
        className,
      )}
    >
      {/* Image */}
      {imageUrl && (
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
          <img
            src={imageUrl}
            alt={firstItem?.product?.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Order #{order.id.slice(-8).toUpperCase()}
            </p>
            <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
          </div>
          <Badge variant={ORDER_STATUS_COLORS[order.status]}>
            {ORDER_STATUS_LABELS[order.status]}
          </Badge>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
          </p>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {formatCurrency(order.total)}
          </p>
        </div>
      </div>

      <ArrowUpRight className="h-4 w-4 shrink-0 text-gray-400" />
    </Link>
  )
}

// ─── Stats card ───────────────────────────────────────────────────────────────

interface StatsCardProps {
  label: string
  value: string | number
  change?: number
  icon?: React.ReactNode
  valuePrefix?: string
  compact?: boolean
  className?: string
}

export function StatsCard({
  label,
  value,
  change,
  icon,
  className,
}: StatsCardProps) {
  const isPositive = change !== undefined && change >= 0

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-5',
        'dark:border-gray-800 dark:bg-gray-900',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-gray-800">
            {icon}
          </div>
        )}
      </div>

      <div>
        <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          {typeof value === 'number' ? formatCompactNumber(value) : value}
        </p>
        {change !== undefined && (
          <div
            className={cn(
              'mt-1 flex items-center gap-1 text-xs font-medium',
              isPositive ? 'text-emerald-600' : 'text-red-500',
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{formatPercentage(change)} vs last period</span>
          </div>
        )}
      </div>
    </div>
  )
}
