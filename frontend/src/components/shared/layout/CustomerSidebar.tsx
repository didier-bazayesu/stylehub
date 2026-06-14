import { NavLink, Link } from "react-router-dom";
import {
  Bell,
  ChevronLeft,
  Heart,
  Home,
  MapPin,
  Settings,
  ShoppingBag,
  Star,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/config/constants";
import { useUIStore, useAuthStore } from "@/store";
import { useNotifications } from "@/api/hooks";

const navItems = [
  { to: ROUTES.CUSTOMER.ORDERS, icon: ShoppingBag, label: "Orders" },
  { to: ROUTES.CUSTOMER.WISHLIST, icon: Heart, label: "Wishlist" },
  { to: ROUTES.CUSTOMER.PROFILE, icon: User, label: "Profile" },
  { to: ROUTES.CUSTOMER.ADDRESSES, icon: MapPin, label: "Addresses" },
  { to: ROUTES.CUSTOMER.REVIEWS, icon: Star, label: "Reviews" },
  { to: ROUTES.CUSTOMER.NOTIFICATIONS, icon: Bell, label: "Notifications" },
  { to: ROUTES.CUSTOMER.SETTINGS, icon: Settings, label: "Settings" },
];

export function CustomerSidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();
  const { data: notifications } = useNotifications();
  const unreadCount = notifications?.filter((n) => !n.is_read).length ?? 0;

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-gray-100 bg-white transition-all duration-200 dark:border-gray-800 dark:bg-gray-950",
        sidebarOpen ? "w-56" : "w-14",
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-3">
        {sidebarOpen && (
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            My Account
          </span>
        )}
        <button
          onClick={toggleSidebar}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700",
            "dark:hover:bg-gray-800 dark:hover:text-gray-300",
            !sidebarOpen && "mx-auto",
          )}
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              !sidebarOpen && "rotate-180",
            )}
          />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-2 py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "relative flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors",
                isActive
                  ? "bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-white"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100",
                !sidebarOpen && "justify-center",
              )
            }
            title={!sidebarOpen ? label : undefined}
          >
            <div className="relative shrink-0">
              <Icon className="h-4 w-4" />
              {/* Unread badge on icon when collapsed */}
              {label === "Notifications" && unreadCount > 0 && !sidebarOpen && (
                <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            {sidebarOpen && (
              <>
                <span className="flex-1">{label}</span>
                {/* Unread badge when expanded */}
                {label === "Notifications" && unreadCount > 0 && (
                  <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Back to Store */}
      <div className="border-t border-gray-100 px-2 py-2 dark:border-gray-800">
        <Link
          to={ROUTES.HOME}
          className={cn(
            "flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors",
            "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100",
            !sidebarOpen && "justify-center",
          )}
          title={!sidebarOpen ? "Back to Store" : undefined}
        >
          <Home className="h-4 w-4 shrink-0" />
          {sidebarOpen && <span>Back to Store</span>}
        </Link>
      </div>

      {/* User footer */}
      {sidebarOpen && (
        <div className="border-t border-gray-100 p-3 dark:border-gray-800">
          <p className="truncate text-xs font-medium text-gray-700 dark:text-gray-300">
            {user?.first_name} {user?.last_name}
          </p>
          <p className="truncate text-xs text-gray-400">{user?.email}</p>
        </div>
      )}
    </aside>
  );
}
