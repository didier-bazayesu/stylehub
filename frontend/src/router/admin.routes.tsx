import { lazy } from "react";
import { AdminLayout } from "@/components/shared";
import { RequireAdmin } from "@/components/shared/layout/ProtectedRoute";

const AdminDashboardPage = lazy(() => import("@/pages/admin/DashboardPage"));
const AdminVendorsPage = lazy(() => import("@/pages/admin/VendorsPage"));
const AdminUsersPage = lazy(() => import("@/pages/admin/UsersPage"));
const AdminProductsPage = lazy(() => import("@/pages/admin/ProductsPage"));
const AdminOrdersPage = lazy(() => import("@/pages/admin/OrdersPage"));
const AdminAnalyticsPage = lazy(() => import("@/pages/admin/AnalyticsPage"));
const AdminCouponsPage = lazy(() => import("@/pages/admin/CouponsPage"));
const AdminAuditLogsPage = lazy(() => import("@/pages/admin/AuditLogsPage"));

export const adminRoutes = {
  element: <RequireAdmin />,
  children: [
    {
      path: "/admin",
      element: <AdminLayout />, // ✅ Layout here
      children: [
        { path: "dashboard", element: <AdminDashboardPage /> },
        { path: "vendors", element: <AdminVendorsPage /> },
        { path: "users", element: <AdminUsersPage /> },
        { path: "products", element: <AdminProductsPage /> },
        { path: "orders", element: <AdminOrdersPage /> },
        { path: "analytics", element: <AdminAnalyticsPage /> },
        { path: "coupons", element: <AdminCouponsPage /> },
        { path: "audit-logs", element: <AdminAuditLogsPage /> },
      ],
    },
  ],
};
