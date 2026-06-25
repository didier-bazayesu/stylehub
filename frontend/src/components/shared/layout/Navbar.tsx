import { Link } from "react-router-dom";
import {
  Menu,
  Search,
  ShoppingBag,
  Heart,
  User,
  X,
  LogOut,
  LayoutDashboard,
  Store,
} from "lucide-react";
import { useAuthStore, useCartStore, useUIStore } from "@/store";
import { useLogout } from "@/api/hooks/useAuth";
import { useCart } from "@/api/hooks/useCart";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/config/constants";
import { getInitials } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { useGuestCart } from "@/api/hooks";
import { NotificationDropdown } from "./NotificationDropdown";

export function Navbar() {
  const { user, isAuthenticated } = useAuthStore();
  const { toggleCart } = useCartStore();
  const { setSearchOpen, setMobileMenuOpen, mobileMenuOpen } = useUIStore();
  const { mutate: logout } = useLogout();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: serverCart } = useCart();
  const guestItems = useGuestCart();

  const itemCount = isAuthenticated
    ? (serverCart?.items.reduce((s, i) => s + i.quantity, 0) ?? 0)
    : guestItems.reduce((s, i) => s + i.quantity, 0);

  // Close user menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Role-based dashboard link
  const dashboardLink =
    user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"
      ? ROUTES.ADMIN.DASHBOARD
      : user?.role === "VENDOR"
        ? ROUTES.VENDOR.DASHBOARD
        : ROUTES.CUSTOMER.ORDERS;

  // Role-based dashboard label
  const getDashboardLabel = () => {
    if (user?.role === "VENDOR") return "Vendor Dashboard";
    if (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN")
      return "Admin Dashboard";
    return "Dashboard";
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to={ROUTES.HOME}
          className="shrink-0 text-xl font-bold tracking-tight text-gray-900 dark:text-white"
        >
          Style<span className="text-gray-400">Hub</span>
        </Link>

        {/* Nav links — desktop */}
        <nav
          className="hidden items-center gap-6 md:flex"
          aria-label="Main navigation"
        >
          <Link
            to={ROUTES.PRODUCTS}
            className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            Shop
          </Link>
          <Link
            to={`${ROUTES.PRODUCTS}?sort=newest`}
            className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            New Arrivals
          </Link>
          <Link
            to={`${ROUTES.PRODUCTS}?is_featured=true`}
            className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            Featured
          </Link>
        </nav>

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Wishlist — ALL authenticated users can shop */}
          {isAuthenticated && (
            <Link
              to={ROUTES.CUSTOMER.WISHLIST}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
            </Link>
          )}
          {!isAuthenticated && <ThemeToggle/>}
          {isAuthenticated && <NotificationDropdown />}

          {/* Cart — ALL authenticated users can shop */}
          <button
            onClick={toggleCart}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
            aria-label={`Cart, ${itemCount} items`}
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-900 text-[10px] font-bold text-white dark:bg-white dark:text-gray-900">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </button>

          {/* User menu */}
          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white dark:bg-white dark:text-gray-900"
                aria-label="User menu"
                aria-expanded={userMenuOpen}
              >
                {user ? getInitials(user.first_name, user.last_name) : "?"}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-11 w-52 rounded-xl border border-gray-100 bg-white py-1 shadow-lg dark:border-gray-800 dark:bg-gray-900">
                  {/* User info */}
                  <div className="border-b border-gray-100 px-3 py-2 dark:border-gray-800">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>

                  {/* Dashboard — role-based access */}
                  <Link
                    to={dashboardLink}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    {getDashboardLabel()}
                  </Link>

                  {/* ── Customer Shopping Links — EVERYONE gets these ── */}
                  <div className="border-t border-gray-100 dark:border-gray-800">
                    <Link
                      to={ROUTES.CUSTOMER.ORDERS}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      My Orders
                    </Link>
                    <Link
                      to={ROUTES.CUSTOMER.WISHLIST}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <Heart className="h-4 w-4" />
                      Wishlist
                    </Link>
                    <Link
                      to={ROUTES.CUSTOMER.PROFILE}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </div>
                  <ThemeToggle />

                  {/* Become a vendor — customers only */}
                  {user?.role === "CUSTOMER" && (
                    <div className="border-t border-gray-100 dark:border-gray-800">
                      <Link
                        to={ROUTES.VENDOR_APPLY}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        <Store className="h-4 w-4" />
                        Become a vendor
                      </Link>
                    </div>
                  )}

                  {/* Logout */}
                  <div className="border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="ml-1 hidden items-center gap-2 sm:flex">
              <Button variant="ghost" size="sm" asChild>
                <Link to={ROUTES.LOGIN}>Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to={ROUTES.REGISTER}>Sign up</Link>
              </Button>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 md:hidden dark:hover:bg-gray-800"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 dark:border-gray-800 dark:bg-gray-950 md:hidden">
          <nav className="flex flex-col gap-1">
            {[
              { to: ROUTES.PRODUCTS, label: "Shop" },
              { to: `${ROUTES.PRODUCTS}?sort=newest`, label: "New Arrivals" },
              { to: `${ROUTES.PRODUCTS}?is_featured=true`, label: "Featured" },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                {label}
              </Link>
            ))}
          </nav>
          {!isAuthenticated && (
            <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
              <Button variant="outline" size="sm" fullWidth asChild>
                <Link
                  to={ROUTES.LOGIN}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log in
                </Link>
              </Button>
              <Button size="sm" fullWidth asChild>
                <Link
                  to={ROUTES.REGISTER}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign up
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
