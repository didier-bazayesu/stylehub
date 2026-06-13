import { useParams, Link } from 'react-router-dom'
import { ArrowLeft} from 'lucide-react'
import { useOrder } from '@/api/hooks/useOrders'
import { Badge } from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/Loading'
import { ErrorState } from '@/components/ui/EmptyState'
import {
  formatCurrency,
  formatDatetime,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
} from '@/lib/utils'
import { ROUTES } from '@/config/constants'

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: order, isLoading, isError, refetch } = useOrder(id ?? '')

  if (isLoading) return <PageLoader />
  if (isError || !order) return <ErrorState onRetry={() => refetch()} />

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Back */}
      <Link
        to={ROUTES.CUSTOMER.ORDERS}
        className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Order #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-gray-500">{formatDatetime(order.created_at)}</p>
        </div>
        <Badge variant={ORDER_STATUS_COLORS[order.status]}>
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
      </div>

      {/* Items */}
      <section className="mb-6 rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        <h2 className="border-b border-gray-100 px-4 py-3 text-sm font-semibold text-gray-900 dark:border-gray-800 dark:text-white">
          Items ({order.items.length})
        </h2>
        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {order.items.map((item) => {
            const image = item.product?.images?.find((i) => i.is_primary)?.url
            return (
              <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {image && <img src={image} alt={item.product?.name} className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                    {item.product?.name}
                  </p>
                  {(item.variant?.size || item.variant?.color) && (
                    <p className="text-xs text-gray-400">
                      {[item.variant?.size, item.variant?.color].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {formatCurrency(item.total_price)}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Shipping address */}
        {order.address && (
          <section className="rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Shipping address</h2>
            <address className="text-sm not-italic text-gray-500 dark:text-gray-400">
              <p>{order.address.full_name}</p>
              <p>{order.address.line1}</p>
              {order.address.line2 && <p>{order.address.line2}</p>}
              <p>{order.address.city}, {order.address.state} {order.address.postal_code}</p>
              <p>{order.address.country}</p>
            </address>
          </section>
        )}

        {/* Cost summary */}
        <section className="rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Summary</h2>
          <div className="flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Shipping</span><span>{formatCurrency(order.shipping_cost)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span><span>−{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-100 pt-1.5 font-semibold text-gray-900 dark:border-gray-800 dark:text-white">
              <span>Total</span><span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
