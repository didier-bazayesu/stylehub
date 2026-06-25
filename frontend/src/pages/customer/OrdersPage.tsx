import { useState } from 'react'
import { Package } from 'lucide-react'
import { useOrders } from '@/api/hooks/useOrders'
import { OrderCard } from '@/components/shared/cards'
import { PageLoader } from '@/components/ui/Loading'
import { EmptyState } from '@/components/ui/EmptyState'
import { OrderStatus } from '@/types'
import { Link } from "react-router-dom";
import { ROUTES } from "@/config/constants";
import { useAuthStore } from "@/store";

const STATUS_FILTERS = [
  { label: 'All', value: undefined },
  { label: 'Pending', value: OrderStatus.PENDING },
  { label: 'Confirmed', value: OrderStatus.CONFIRMED },
  { label: 'Shipped', value: OrderStatus.SHIPPED },
  { label: 'Delivered', value: OrderStatus.DELIVERED },
]

export default function CustomerOrdersPage() {
  const [status, setStatus] = useState<OrderStatus | undefined>(undefined)
  const { data, isLoading } = useOrders({ status })
  const user = useAuthStore((s) => s.user)

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
        My Orders
      </h1>

      {/* Status filter pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => setStatus(f.value)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              status === f.value
                ? "border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900"
                : "border-gray-200 text-gray-600 hover:border-gray-400 dark:border-gray-700 dark:text-gray-400"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <PageLoader />
      ) : !data?.data?.length ? (
        <EmptyState
          icon={<Package className="h-6 w-6" />}
          title="No orders yet"
          description="Your order history will appear here."
          action={{ label: "Start shopping", onClick: () => {} }}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {data.data.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
      {user?.role === "CUSTOMER" && (
        <div className="mt-8 flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Want to sell on StyleHub?
            </p>
            <p className="text-xs text-gray-500">
              Apply to open your own store and reach thousands of customers.
            </p>
          </div>
          <Link
            to={ROUTES.VENDOR_APPLY}
            className="shrink-0 rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
          >
            Apply now
          </Link>
        </div>
      )}
    </div>
  );
}
