import { cn } from '@/lib/utils'
import { Button } from './Button'
import { AlertCircle, Inbox, RefreshCw, SearchX } from 'lucide-react'

// ─── Empty state ──────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-16 text-center',
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800">
        {icon ?? <Inbox className="h-6 w-6" />}
      </div>
      <div>
        <p className="font-medium text-gray-900 dark:text-gray-100">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
      {action && (
        <Button variant="outline" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}

// ─── No results state ─────────────────────────────────────────────────────────

export function NoResults({ onClear }: { onClear?: () => void }) {
  return (
    <EmptyState
      icon={<SearchX className="h-6 w-6" />}
      title="No results found"
      description="Try adjusting your search or filters."
      action={onClear ? { label: 'Clear filters', onClick: onClear } : undefined}
    />
  )
}

// ─── Error state ──────────────────────────────────────────────────────────────

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'Failed to load data. Please try again.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-16 text-center',
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-950">
        <AlertCircle className="h-6 w-6" />
      </div>
      <div>
        <p className="font-medium text-gray-900 dark:text-gray-100">{title}</p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="h-4 w-4" />}
          onClick={onRetry}
        >
          Try again
        </Button>
      )}
    </div>
  )
}
