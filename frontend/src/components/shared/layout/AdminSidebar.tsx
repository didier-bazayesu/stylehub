import { NavLink, Link } from 'react-router-dom'
import {
  BarChart2,
  ChevronLeft,
  ClipboardList,
  Home,
  LayoutDashboard,
  Package,
  ScrollText,
  ShoppingCart,
  Tag,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/config/constants'
import { useUIStore } from '@/store'

const navItems = [
  { to: ROUTES.ADMIN.DASHBOARD, icon: LayoutDashboard, label: 'Overview' },
  { to: ROUTES.ADMIN.VENDORS, icon: ClipboardList, label: 'Vendors' },
  { to: ROUTES.ADMIN.USERS, icon: Users, label: 'Users' },
  { to: ROUTES.ADMIN.PRODUCTS, icon: Package, label: 'Products' },
  { to: ROUTES.ADMIN.ORDERS, icon: ShoppingCart, label: 'Orders' },
  { to: ROUTES.ADMIN.ANALYTICS, icon: BarChart2, label: 'Analytics' },
  { to: ROUTES.ADMIN.COUPONS, icon: Tag, label: 'Coupons' },
  { to: ROUTES.ADMIN.AUDIT_LOGS, icon: ScrollText, label: 'Audit Logs' },
]

export function AdminSidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore()

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-gray-100 bg-white transition-all duration-200',
        'dark:border-gray-800 dark:bg-gray-950',
        sidebarOpen ? 'w-56' : 'w-14',
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-3">
        {sidebarOpen && (
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            Admin Panel
          </span>
        )}
        <button
          onClick={toggleSidebar}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg text-gray-400',
            'hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300',
            !sidebarOpen && 'mx-auto',
          )}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <ChevronLeft
            className={cn('h-4 w-4 transition-transform', !sidebarOpen && 'rotate-180')}
          />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-2 py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === ROUTES.ADMIN.DASHBOARD}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100',
                !sidebarOpen && 'justify-center',
              )
            }
            title={!sidebarOpen ? label : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {sidebarOpen && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Back to Store */}
      <div className="border-t border-gray-100 px-2 py-2 dark:border-red-800">
        <Link
          to={ROUTES.HOME}
          className={cn(
            'flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors',
            'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100',
            !sidebarOpen && 'justify-center',
          )}
          title={!sidebarOpen ? 'Back to Store' : undefined}
        >
          <Home className="h-4 w-4 shrink-0" />
          {sidebarOpen && <span>Back to Store</span>}
        </Link>
      </div>
    </aside>
  )
}
