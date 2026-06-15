import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/config/constants'

interface BackButtonProps {
  to?: string
  label?: string
  className?: string
  sidebarOpen?: boolean
  position?: 'sidebar' | 'top'
  variant?: 'default' | 'accent'
}

export function BackButton({
  to = ROUTES.HOME,
  label = 'Back to Store',
  className,
  sidebarOpen = true,
  position = 'sidebar',
  variant = 'default',
}: BackButtonProps) {
  if (position === 'top') {
    return (
      <div className={cn('border-b border-gray-100 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-950', className)}>
        <Link
          to={to}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            variant === 'accent'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white',
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          {label}
        </Link>
      </div>
    )
  }

  return (
    <div className="border-t border-gray-100 px-2 py-2 dark:border-gray-800">
      <Link
        to={to}
        className={cn(
          'flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors',
          'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100',
          !sidebarOpen && 'justify-center',
          className,
        )}
        title={!sidebarOpen ? label : undefined}
      >
        <ChevronLeft className="h-4 w-4 shrink-0" />
        {sidebarOpen && <span>{label}</span>}
      </Link>
    </div>
  )
}
