import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react'
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
} from '@/api/hooks'
import { PageLoader } from '@/components/ui/Loading'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn, formatRelativeTime } from '@/lib/utils'
import { NotificationType } from '@/types'

const TYPE_BADGE: Record<
  NotificationType,
  'default' | 'info' | 'success' | 'warning' | 'danger'
> = {
  [NotificationType.ORDER_UPDATE]: 'info',
  [NotificationType.REVIEW]: 'success',
  [NotificationType.NEW_PRODUCT]: 'default',
  [NotificationType.PROMOTION]: 'warning',
  [NotificationType.SYSTEM]: 'default',
}

const TYPE_LABEL: Record<NotificationType, string> = {
  [NotificationType.ORDER_UPDATE]: 'Order',
  [NotificationType.REVIEW]: 'Review',
  [NotificationType.NEW_PRODUCT]: 'Product',
  [NotificationType.PROMOTION]: 'Promo',
  [NotificationType.SYSTEM]: 'System',
}

export default function VendorNotificationsPage() {
  const { data: notifications, isLoading } = useNotifications()
  console.log("notifications", notifications);
  console.log("isArray", Array.isArray(notifications));
  const { mutate: markRead } = useMarkNotificationRead()
  const { mutate: markAll } = useMarkAllNotificationsRead()
  const { mutate: remove } = useDeleteNotification()
  
  const unreadCount = notifications?.filter((n) => !n.is_read).length ?? 0
  
  if (isLoading) return <PageLoader />

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gray-900 px-1.5 text-xs font-bold text-white dark:bg-white dark:text-gray-900">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<CheckCheck className="h-4 w-4" />}
            onClick={() => markAll()}
          >
            Mark all read
          </Button>
        )}
      </div>

      {!notifications?.length ? (
        <EmptyState
          icon={<Bell className="h-6 w-6" />}
          title="No notifications"
          description="Order updates and store activity will appear here."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={cn(
                'flex items-start gap-3 rounded-xl border p-4 transition-colors',
                n.is_read
                  ? 'border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900'
                  : 'border-blue-100 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-950/20',
              )}
            >
              <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center">
                {!n.is_read && (
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={TYPE_BADGE[n.type]} size="sm">
                    {TYPE_LABEL[n.type]}
                  </Badge>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {n.title}
                  </p>
                </div>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                  {n.message}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {formatRelativeTime(n.created_at)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                {!n.is_read && (
                  <button
                    onClick={() => markRead(n.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-emerald-600 dark:hover:bg-gray-800"
                    title="Mark as read"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => remove(n.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
