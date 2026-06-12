import { lazy } from "react";
import { VendorLayout } from "@/components/shared";
import { RequireVendor } from "@/components/shared/layout/ProtectedRoute";

const VendorDashboardPage = lazy(() => import("@/pages/vendor/DashboardPage"));
const VendorProductsPage = lazy(() => import("@/pages/vendor/ProductsPage"));
const VendorProductFormPage = lazy(
  () => import("@/pages/vendor/ProductFormPage"),
);
const VendorOrdersPage = lazy(() => import("@/pages/vendor/OrdersPage"));
const VendorAnalyticsPage = lazy(() => import("@/pages/vendor/AnalyticsPage"));
const VendorStorePage = lazy(() => import("@/pages/vendor/StorePage"));
const VendorNotificationsPage = lazy(
  () => import("@/pages/vendor/NotificationsPage"),
);

export const vendorRoutes = {
  element: <RequireVendor />,
  children: [
    {
      path: "/vendor",
      element: <VendorLayout />, // ✅ layout declared here
      children: [
        { path: "dashboard", element: <VendorDashboardPage /> },
        { path: "products", element: <VendorProductsPage /> },
        { path: "products/new", element: <VendorProductFormPage /> },
        { path: "products/:id/edit", element: <VendorProductFormPage /> },
        { path: "orders", element: <VendorOrdersPage /> },
        { path: "analytics", element: <VendorAnalyticsPage /> },
        { path: "store", element: <VendorStorePage /> },
        { path: "notifications", element: <VendorNotificationsPage /> },
      ],
    },
  ],
};
