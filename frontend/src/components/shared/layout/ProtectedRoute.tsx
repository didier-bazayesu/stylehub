import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore, selectIsAdmin, selectIsApprovedVendor } from "@/store";
import { PageLoader } from "@/components/ui/Loading";
import { ROUTES } from "@/config/constants";

// ─── Authenticated users only ─────────────────────────────────────────────────

export function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) return <PageLoader />;

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return <Outlet />;
}

// ─── Approved vendors only ────────────────────────────────────────────────────

export function RequireVendor() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const isApprovedVendor = useAuthStore(selectIsApprovedVendor);
  const location = useLocation();

  if (isLoading) return <PageLoader />;

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (!isApprovedVendor) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <Outlet />;
}

// ─── Admins only ──────────────────────────────────────────────────────────────

export function RequireAdmin() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const isAdmin = useAuthStore(selectIsAdmin);
  const location = useLocation();

  if (isLoading) return <PageLoader />;

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <Outlet />;
}

// ─── Redirect logged-in users away from auth pages ───────────────────────────

export function RedirectIfAuthenticated() {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  // Handles both string and object shapes for from
  const rawFrom = (location.state as { from?: string | { pathname: string } })
    ?.from;
  const from = typeof rawFrom === "string" ? rawFrom : rawFrom?.pathname;

  if (isLoading) return <PageLoader />;

  if (isAuthenticated && user) {
    // If user came from checkout (or any specific page), honor that FIRST
    if (from && from !== ROUTES.LOGIN && from !== ROUTES.REGISTER) {
      return <Navigate to={from} state={{ from }} replace />;
    }

    // Otherwise role-based default
    let defaultRoute: string;
    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
      defaultRoute = ROUTES.ADMIN.DASHBOARD;
    } else if (user.role === "VENDOR") {
      defaultRoute = ROUTES.VENDOR.DASHBOARD;
    } else {
      defaultRoute = ROUTES.HOME;
    }
    return <Navigate to={defaultRoute} replace />;
  }

  return <Outlet />;
}
