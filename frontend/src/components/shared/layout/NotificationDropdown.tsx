import { useState, useRef, useEffect } from 'react'
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react'
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
} from '@/api/hooks'
import { Badge } from '@/components/ui/Badge'
import { cn, formatRelativeTime } from '@/lib/utils'
import { NotificationType } from '@/types'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/config/constants'

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
  [NotificationType.NEW_PRODUCT]: 'New',
  [NotificationType.PROMOTION]: 'Promo',
  [NotificationType.SYSTEM]: 'System',
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { data: notifications, isLoading } = useNotifications()
  const { mutate: markRead } = useMarkNotificationRead()
  const { mutate: markAll } = useMarkAllNotificationsRead()
  const { mutate: remove } = useDeleteNotification()

  const unreadCount = notifications?.filter((n) => !n.is_read).length ?? 0

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-white dark:bg-white dark:text-gray-900">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-11 w-80 max-h-[500px] overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900">
          {/* Header */}
          <div className="sticky top-0 border-b border-gray-100 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gray-900 px-1.5 text-[10px] font-bold text-white dark:bg-white dark:text-gray-900">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-6 w-6 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => markAll()}
                className="mt-2 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <CheckCheck className="h-3 w-3" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="p-2">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
            ) : !notifications?.length ? (
              <div className="p-6 text-center">
                <Bell className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">No notifications</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {notifications.slice(0, 10).map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      'flex items-start gap-2 rounded-lg p-3 transition-colors',
                      n.is_read
                        ? 'bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800'
                        : 'bg-blue-50 dark:bg-blue-950/20',
                    )}
                  >
                    {/* Unread dot */}
                    <div className="mt-1 flex h-3 w-3 shrink-0 items-center justify-center">
                      {!n.is_read && (
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant={TYPE_BADGE[n.type]} size="sm">
                          {TYPE_LABEL[n.type]}
                        </Badge>
                        <p className="text-xs font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                          {n.title}
                        </p>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {n.message}
                      </p>
                      <p className="mt-1 text-[10px] text-gray-400">
                        {formatRelativeTime(n.created_at)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-0.5">
                      {!n.is_read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            markRead(n.id)
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-emerald-600 dark:hover:bg-gray-800"
                          title="Mark as read"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          remove(n.id)
                        }}
                        className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications && notifications.length > 0 && (
            <div className="sticky bottom-0 border-t border-gray-100 bg-white px-4 py-2 dark:border-gray-800 dark:bg-gray-900">
              <Link
                to={ROUTES.CUSTOMER.NOTIFICATIONS}
                onClick={() => setIsOpen(false)}
                className="block text-center text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
