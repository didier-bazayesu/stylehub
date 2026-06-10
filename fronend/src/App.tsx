/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './config/queryClient';
import { ROUTES } from './config/routes';
import { ProtectedRoute } from './components/shared/layout/ProtectedRoute';
import { Loading } from './components/ui';
import { Toast } from './components/shared/feedback';
import { ErrorBoundary } from './components/shared/feedback/ErrorBoundary';

// ==========================================
// 1. LAZY LOADING ROUTE-LEVEL PAGES (Rules compliant)
// ==========================================

// Public
const HomePage = lazy(() => import('./pages/public/HomePage'));
const ProductsPage = lazy(() => import('./pages/public/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/public/ProductDetailPage'));
const StorePage = lazy(() => import('./pages/public/StorePage'));

// Auth
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));

// Customer
const CartPage = lazy(() => import('./pages/customer/CartPage'));
const CheckoutPage = lazy(() => import('./pages/customer/CheckoutPage'));
const CustomerOrdersPage = lazy(() => import('./pages/customer/OrdersPage'));
const CustomerOrderDetailPage = lazy(() => import('./pages/customer/OrderDetailPage'));
const WishlistPage = lazy(() => import('./pages/customer/WishlistPage'));
const ProfilePage = lazy(() => import('./pages/customer/ProfilePage'));
const AddressesPage = lazy(() => import('./pages/customer/AddressesPage'));

// Vendor
const VendorDashboardPage = lazy(() => import('./pages/vendor/DashboardPage'));
const VendorProductsPage = lazy(() => import('./pages/vendor/ProductsPage'));
const VendorProductFormPage = lazy(() => import('./pages/vendor/ProductFormPage'));
const VendorOrdersPage = lazy(() => import('./pages/vendor/OrdersPage'));
const VendorAnalyticsPage = lazy(() => import('./pages/vendor/AnalyticsPage'));
const VendorStoreSettingsPage = lazy(() => import('./pages/vendor/StoreSettingsPage'));

// Admin
const AdminDashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const AdminVendorsPage = lazy(() => import('./pages/admin/VendorsPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/UsersPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/ProductsPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/OrdersPage'));
const AdminCouponsPage = lazy(() => import('./pages/admin/CouponsPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AnalyticsPage'));
const AdminAuditLogsPage = lazy(() => import('./pages/admin/AuditLogsPage'));

// Suspense Layout Wrapper
const AppLayout: React.FC = () => (
  <ErrorBoundary>
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-neutral-25">
        <Loading text="Pre-compiling beautiful styles layout..." />
      </div>
    }>
      <Outlet />
      <Toast />
    </Suspense>
  </ErrorBoundary>
);

// Router Configurations
const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      // ------------------------------------------
      // Public Paths
      // ------------------------------------------
      { path: ROUTES.HOME, element: <HomePage /> },
      { path: ROUTES.PRODUCTS, element: <ProductsPage /> },
      { path: ROUTES.PRODUCT_DETAIL, element: <ProductDetailPage /> },
      { path: ROUTES.STORE_DETAIL, element: <StorePage /> },

      // ------------------------------------------
      // Auth Paths
      // ------------------------------------------
      { path: ROUTES.LOGIN, element: <LoginPage /> },
      { path: ROUTES.REGISTER, element: <RegisterPage /> },
      { path: ROUTES.FORGOT_PASSWORD, element: <ForgotPasswordPage /> },
      { path: ROUTES.RESET_PASSWORD, element: <ResetPasswordPage /> },

      // ------------------------------------------
      // Customer Guarded Paths
      // ------------------------------------------
      { path: ROUTES.CART, element: <CartPage /> },
      {
        element: <ProtectedRoute allowedRoles={['CUSTOMER']} />,
        children: [
          { path: ROUTES.CHECKOUT, element: <CheckoutPage /> },
          { path: ROUTES.CUSTOMER_ORDERS, element: <CustomerOrdersPage /> },
          { path: ROUTES.CUSTOMER_ORDER_DETAIL, element: <CustomerOrderDetailPage /> },
          { path: ROUTES.CUSTOMER_WISHLIST, element: <WishlistPage /> },
          { path: ROUTES.CUSTOMER_PROFILE, element: <ProfilePage /> },
          { path: ROUTES.CUSTOMER_ADDRESSES, element: <AddressesPage /> },
        ]
      },

      // ------------------------------------------
      // Vendor Guarded Paths (Vendor Approved filter internally)
      // ------------------------------------------
      {
        element: <ProtectedRoute allowedRoles={['VENDOR']} requiredVendorStatus="APPROVED" />,
        children: [
          { path: ROUTES.VENDOR_DASHBOARD, element: <VendorDashboardPage /> },
          { path: ROUTES.VENDOR_PRODUCTS, element: <VendorProductsPage /> },
          { path: ROUTES.VENDOR_PRODUCT_CREATE, element: <VendorProductFormPage /> },
          { path: ROUTES.VENDOR_PRODUCT_EDIT, element: <VendorProductFormPage /> },
          { path: ROUTES.VENDOR_ORDERS, element: <VendorOrdersPage /> },
          { path: ROUTES.VENDOR_ANALYTICS, element: <VendorAnalyticsPage /> },
          { path: ROUTES.VENDOR_STORE_SETTINGS, element: <VendorStoreSettingsPage /> },
        ]
      },

      // ------------------------------------------
      // Admin Guarded Paths
      // ------------------------------------------
      {
        element: <ProtectedRoute allowedRoles={['ADMIN']} />,
        children: [
          { path: ROUTES.ADMIN_DASHBOARD, element: <AdminDashboardPage /> },
          { path: ROUTES.ADMIN_VENDORS, element: <AdminVendorsPage /> },
          { path: ROUTES.ADMIN_USERS, element: <AdminUsersPage /> },
          { path: ROUTES.ADMIN_PRODUCTS, element: <AdminProductsPage /> },
          { path: ROUTES.ADMIN_ORDERS, element: <AdminOrdersPage /> },
          { path: ROUTES.ADMIN_COUPONS, element: <AdminCouponsPage /> },
          { path: ROUTES.ADMIN_ANALYTICS, element: <AdminAnalyticsPage /> },
          { path: ROUTES.ADMIN_AUDIT_LOGS, element: <AdminAuditLogsPage /> },
        ]
      },

      // Catch All redirect to HOME
      { path: '*', element: <Navigate to={ROUTES.HOME} replace /> }
    ]
  }
]);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
