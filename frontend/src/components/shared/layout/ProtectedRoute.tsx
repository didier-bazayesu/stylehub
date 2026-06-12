import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore, selectIsAdmin, selectIsApprovedVendor } from '@/store'
import { PageLoader } from '@/components/ui/Loading'
import { ROUTES } from '@/config/constants'

// ─── Authenticated users only ─────────────────────────────────────────────────

export function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuthStore()
  const location = useLocation()

  if (isLoading) return <PageLoader />

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  return <Outlet />
}

// ─── Approved vendors only ────────────────────────────────────────────────────

export function RequireVendor() {
  const { isAuthenticated, isLoading } = useAuthStore()
  const isApprovedVendor = useAuthStore(selectIsApprovedVendor)
  const location = useLocation()

  if (isLoading) return <PageLoader />

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  if (!isApprovedVendor) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return <Outlet />
}

// ─── Admins only ──────────────────────────────────────────────────────────────

export function RequireAdmin() {
  const { isAuthenticated, isLoading } = useAuthStore()
  const isAdmin = useAuthStore(selectIsAdmin)
  const location = useLocation()

  if (isLoading) return <PageLoader />

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  if (!isAdmin) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return <Outlet />
}

// ─── Redirect logged-in users away from auth pages ───────────────────────────

export function RedirectIfAuthenticated() {
  const { isAuthenticated, isLoading, user } = useAuthStore()
  const location = useLocation()
  const from = (location.state as { from?: Location })?.from?.pathname

  if (isLoading) return <PageLoader />

  if (isAuthenticated) {
    const defaultRoute =
      user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
        ? ROUTES.ADMIN.DASHBOARD
        : user?.role === 'VENDOR'
        ? ROUTES.VENDOR.DASHBOARD
        : from ?? ROUTES.HOME

    return <Navigate to={defaultRoute} replace />
  }

  return <Outlet />
}
