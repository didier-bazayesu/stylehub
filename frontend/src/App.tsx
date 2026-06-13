// import { lazy, Suspense, useEffect } from 'react'
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
// import { QueryClientProvider } from '@tanstack/react-query'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
// import { Toaster } from 'sonner'
// import { queryClient } from '@/config/queryClient'
// import { ROUTES } from '@/config/constants'
// import { PageLoader } from '@/components/ui/Loading'
// import {
//   RequireAuth,
//   RequireVendor,
//   RequireAdmin,
//   RedirectIfAuthenticated,
// } from '@/components/shared/layout/ProtectedRoute'
// import { Navbar } from '@/components/shared/layout/Navbar'
// import { Footer } from '@/components/shared/layout/Footer'
// import { VendorSidebar } from '@/components/shared/layout/VendorSidebar'
// import { AdminSidebar } from '@/components/shared/layout/AdminSidebar'
// import { SearchModal } from '@/components/shared/layout/SearchModal'
// import { useRestoreSession } from '@/api/hooks/useAuth'
// import { useUIStore } from '@/store'
// import { CartDrawer } from "@/components/shared/layout/CartDrawer";
// import { CustomerSidebar } from "@/components/shared/layout/CustomerSidebar";

// // ─── Lazy page imports ─────────────────────────────────────────────────────────

// // Public pages
// const HomePage = lazy(() => import('@/pages/public/HomePage'))
// const ProductsPage = lazy(() => import('@/pages/public/ProductsPage'))
// const ProductDetailPage = lazy(() => import('@/pages/public/ProductDetailPage'))
// const StorePage = lazy(() => import('@/pages/public/StorePage'))
// const CartPage = lazy(() => import('@/pages/public/CartPage'))
// const VendorApplyPage = lazy(() => import("@/pages/customer/VendorApplyPage"));

// // Auth pages
// const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
// const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
// const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
// const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'))

// // Customer pages
// const CustomerOrdersPage = lazy(() => import('@/pages/customer/OrdersPage'))
// const CustomerOrderDetailPage = lazy(() => import('@/pages/customer/OrderDetailPage'))
// const CustomerWishlistPage = lazy(() => import('@/pages/customer/WishlistPage'))
// const CustomerProfilePage = lazy(() => import('@/pages/customer/ProfilePage'))
// const CustomerAddressesPage = lazy(() => import('@/pages/customer/AddressesPage'))
// const CheckoutPage = lazy(() => import('@/pages/customer/CheckoutPage'))
// const CustomerNotificationsPage = lazy(() => import('@/pages/customer/NotificationsPage'))
// const CustomerReviewsPage = lazy(() => import('@/pages/customer/ReviewsPage'))
// const CustomerSettingsPage = lazy(() => import('@/pages/customer/SettingsPage'))

// // Vendor pages
// const VendorDashboardPage = lazy(() => import('@/pages/vendor/DashboardPage'))
// const VendorProductsPage = lazy(() => import('@/pages/vendor/ProductsPage'))
// const VendorProductFormPage = lazy(() => import('@/pages/vendor/ProductFormPage'))
// const VendorOrdersPage = lazy(() => import('@/pages/vendor/OrdersPage'))
// const VendorAnalyticsPage = lazy(() => import('@/pages/vendor/AnalyticsPage'))
// const VendorStorePage = lazy(() => import('@/pages/vendor/StorePage'))
// const VendorNotificationsPage = lazy(() => import('@/pages/vendor/NotificationsPage'))

// // Admin pages
// const AdminDashboardPage = lazy(() => import('@/pages/admin/DashboardPage'))
// const AdminVendorsPage = lazy(() => import('@/pages/admin/VendorsPage'))
// const AdminUsersPage = lazy(() => import('@/pages/admin/UsersPage'))
// const AdminProductsPage = lazy(() => import('@/pages/admin/ProductsPage'))
// const AdminOrdersPage = lazy(() => import('@/pages/admin/OrdersPage'))
// const AdminAnalyticsPage = lazy(() => import('@/pages/admin/AnalyticsPage'))
// const AdminCouponsPage = lazy(() => import('@/pages/admin/CouponsPage'))
// const AdminAuditLogsPage = lazy(() => import('@/pages/admin/AuditLogsPage'))

// // ─── Layout wrappers ───────────────────────────────────────────────────────────

// function PublicLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="flex min-h-screen flex-col">
//       <Navbar />
//       <SearchModal />
//       <CartDrawer />
//       <main className="flex-1">{children}</main>
//       <Footer />
//     </div>
//   );
// }

// function CustomerLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="flex h-screen overflow-hidden">
//       <CustomerSidebar />
//       <div className="flex flex-1 flex-col overflow-hidden">
//         <main className="flex-1 overflow-y-auto">{children}</main>
//       </div>
//     </div>
//   );
// }

// function VendorLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="flex h-screen overflow-hidden">
//       <VendorSidebar />
//       <div className="flex flex-1 flex-col overflow-hidden">
//         <main className="flex-1 overflow-y-auto">{children}</main>
//       </div>
//     </div>
//   )
// }

// function AdminLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="flex h-screen overflow-hidden">
//       <AdminSidebar />
//       <div className="flex flex-1 flex-col overflow-hidden">
//         <main className="flex-1 overflow-y-auto">{children}</main>
//       </div>
//     </div>
//   )
// }

// // ─── Session restore on mount ──────────────────────────────────────────────────

// function SessionRestorer() {
//   useRestoreSession()
//   return null
// }

// // ─── Theme applier — syncs Zustand theme to <html class="dark"> ───────────────

// function ThemeProvider() {
//   const theme = useUIStore((s) => s.theme)

//   useEffect(() => {
//     const root = document.documentElement
//     const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
//     const isDark = theme === 'dark' || (theme === 'system' && prefersDark)
//     root.classList.toggle('dark', isDark)
//   }, [theme])

//   // Also listen for system preference changes
//   useEffect(() => {
//     if (theme !== 'system') return
//     const mq = window.matchMedia('(prefers-color-scheme: dark)')
//     const handler = (e: MediaQueryListEvent) => {
//       document.documentElement.classList.toggle('dark', e.matches)
//     }
//     mq.addEventListener('change', handler)
//     return () => mq.removeEventListener('change', handler)
//   }, [theme])

//   return null
// }

// // ─── App ───────────────────────────────────────────────────────────────────────

// export default function App() {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <BrowserRouter>
//         <SessionRestorer />
//         <ThemeProvider />
//         <Suspense fallback={<PageLoader />}>
//           <Routes>
//             {/* ── Public routes ── */}
//             <Route
//               path={ROUTES.HOME}
//               element={
//                 <PublicLayout>
//                   <HomePage />
//                 </PublicLayout>
//               }
//             />
//             <Route
//               path={ROUTES.PRODUCTS}
//               element={
//                 <PublicLayout>
//                   <ProductsPage />
//                 </PublicLayout>
//               }
//             />
//             <Route
//               path="/products/:slug"
//               element={
//                 <PublicLayout>
//                   <ProductDetailPage />
//                 </PublicLayout>
//               }
//             />
//             <Route
//               path="/stores/:slug"
//               element={
//                 <PublicLayout>
//                   <StorePage />
//                 </PublicLayout>
//               }
//             />
//             <Route
//               path={ROUTES.CART}
//               element={
//                 <PublicLayout>
//                   <CartPage />
//                 </PublicLayout>
//               }
//             />

//             {/* ── Auth routes (redirect if already logged in) ── */}
//             <Route element={<RedirectIfAuthenticated />}>
//               <Route path={ROUTES.LOGIN} element={<LoginPage />} />
//               <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
//               <Route
//                 path={ROUTES.FORGOT_PASSWORD}
//                 element={<ForgotPasswordPage />}
//               />
//               <Route
//                 path={ROUTES.RESET_PASSWORD}
//                 element={<ResetPasswordPage />}
//               />
//             </Route>

//             {/* ── Customer routes ── */}
//             <Route element={<RequireAuth />}>
//               <Route
//                 path={ROUTES.CHECKOUT}
//                 element={
//                   <PublicLayout>
//                     <CheckoutPage />
//                   </PublicLayout>
//                 }
//               />
//               <Route path="/dashboard">
//                 <Route
//                   path="orders"
//                   element={
//                     <CustomerLayout>
//                       <CustomerOrdersPage />
//                     </CustomerLayout>
//                   }
//                 />
//                 <Route
//                   path="orders/:id"
//                   element={
//                     <CustomerLayout>
//                       <CustomerOrderDetailPage />
//                     </CustomerLayout>
//                   }
//                 />
//                 <Route
//                   path="wishlist"
//                   element={
//                     <CustomerLayout>
//                       <CustomerWishlistPage />
//                     </CustomerLayout>
//                   }
//                 />
//                 <Route
//                   path="profile"
//                   element={
//                     <PublicLayout>
//                       <CustomerProfilePage />
//                     </PublicLayout>
//                   }
//                 />
//                 <Route
//                   path="addresses"
//                   element={
//                     <PublicLayout>
//                       <CustomerAddressesPage />
//                     </PublicLayout>
//                   }
//                 />
//                 <Route
//                   path="notifications"
//                   element={
//                     <PublicLayout>
//                       <CustomerNotificationsPage />
//                     </PublicLayout>
//                   }
//                 />
//                 <Route
//                   path="reviews"
//                   element={
//                     <PublicLayout>
//                       <CustomerReviewsPage />
//                     </PublicLayout>
//                   }
//                 />
//                 <Route
//                   path="settings"
//                   element={
//                     <PublicLayout>
//                       <CustomerSettingsPage />
//                     </PublicLayout>
//                   }
//                 />
//               </Route>
//             </Route>
//             {/* Vendor apply — any authenticated user */}
//             <Route element={<RequireAuth />}>
//               <Route
//                 path={ROUTES.CHECKOUT}
//                 element={
//                   <PublicLayout>
//                     <CheckoutPage />
//                   </PublicLayout>
//                 }
//               />

//               <Route path="/dashboard">
//                 <Route
//                   path="orders"
//                   element={
//                     <CustomerLayout>
//                       <CustomerOrdersPage />
//                     </CustomerLayout>
//                   }
//                 />

//                 <Route
//                   path="orders/:id"
//                   element={
//                     <CustomerLayout>
//                       <CustomerOrderDetailPage />
//                     </CustomerLayout>
//                   }
//                 />

//                 <Route
//                   path="wishlist"
//                   element={
//                     <CustomerLayout>
//                       <CustomerWishlistPage />
//                     </CustomerLayout>
//                   }
//                 />

//                 <Route
//                   path="profile"
//                   element={
//                     <CustomerLayout>
//                       <CustomerProfilePage />
//                     </CustomerLayout>
//                   }
//                 />

//                 <Route
//                   path="addresses"
//                   element={
//                     <CustomerLayout>
//                       <CustomerAddressesPage />
//                     </CustomerLayout>
//                   }
//                 />

//                 <Route
//                   path="notifications"
//                   element={
//                     <CustomerLayout>
//                       <CustomerNotificationsPage />
//                     </CustomerLayout>
//                   }
//                 />

//                 <Route
//                   path="reviews"
//                   element={
//                     <CustomerLayout>
//                       <CustomerReviewsPage />
//                     </CustomerLayout>
//                   }
//                 />

//                 <Route
//                   path="settings"
//                   element={
//                     <CustomerLayout>
//                       <CustomerSettingsPage />
//                     </CustomerLayout>
//                   }
//                 />
//               </Route>
//             </Route>

//             {/* ── Vendor routes ── */}
//             <Route element={<RequireVendor />}>
//               <Route path="/vendor">
//                 <Route
//                   path="dashboard"
//                   element={
//                     <VendorLayout>
//                       <VendorDashboardPage />
//                     </VendorLayout>
//                   }
//                 />
//                 <Route
//                   path="products"
//                   element={
//                     <VendorLayout>
//                       <VendorProductsPage />
//                     </VendorLayout>
//                   }
//                 />
//                 <Route
//                   path="products/new"
//                   element={
//                     <VendorLayout>
//                       <VendorProductFormPage />
//                     </VendorLayout>
//                   }
//                 />
//                 <Route
//                   path="products/:id/edit"
//                   element={
//                     <VendorLayout>
//                       <VendorProductFormPage />
//                     </VendorLayout>
//                   }
//                 />
//                 <Route
//                   path="orders"
//                   element={
//                     <VendorLayout>
//                       <VendorOrdersPage />
//                     </VendorLayout>
//                   }
//                 />
//                 <Route
//                   path="analytics"
//                   element={
//                     <VendorLayout>
//                       <VendorAnalyticsPage />
//                     </VendorLayout>
//                   }
//                 />
//                 <Route
//                   path="store"
//                   element={
//                     <VendorLayout>
//                       <VendorStorePage />
//                     </VendorLayout>
//                   }
//                 />
//                 <Route
//                   path="notifications"
//                   element={
//                     <VendorLayout>
//                       <VendorNotificationsPage />
//                     </VendorLayout>
//                   }
//                 />
//               </Route>
//             </Route>

//             {/* ── Admin routes ── */}
//             <Route element={<RequireAdmin />}>
//               <Route path="/admin">
//                 <Route
//                   path="dashboard"
//                   element={
//                     <AdminLayout>
//                       <AdminDashboardPage />
//                     </AdminLayout>
//                   }
//                 />
//                 <Route
//                   path="vendors"
//                   element={
//                     <AdminLayout>
//                       <AdminVendorsPage />
//                     </AdminLayout>
//                   }
//                 />
//                 <Route
//                   path="users"
//                   element={
//                     <AdminLayout>
//                       <AdminUsersPage />
//                     </AdminLayout>
//                   }
//                 />
//                 <Route
//                   path="products"
//                   element={
//                     <AdminLayout>
//                       <AdminProductsPage />
//                     </AdminLayout>
//                   }
//                 />
//                 <Route
//                   path="orders"
//                   element={
//                     <AdminLayout>
//                       <AdminOrdersPage />
//                     </AdminLayout>
//                   }
//                 />
//                 <Route
//                   path="analytics"
//                   element={
//                     <AdminLayout>
//                       <AdminAnalyticsPage />
//                     </AdminLayout>
//                   }
//                 />
//                 <Route
//                   path="coupons"
//                   element={
//                     <AdminLayout>
//                       <AdminCouponsPage />
//                     </AdminLayout>
//                   }
//                 />
//                 <Route
//                   path="audit-logs"
//                   element={
//                     <AdminLayout>
//                       <AdminAuditLogsPage />
//                     </AdminLayout>
//                   }
//                 />
//               </Route>
//             </Route>

//             {/* Fallback */}
//             <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
//           </Routes>
//         </Suspense>
//       </BrowserRouter>

//       <Toaster position="top-right" richColors />
//       {import.meta.env.DEV && <ReactQueryDevtools />}
//     </QueryClientProvider>
//   );
// }

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { queryClient } from "@/config/queryClient";
import { RouterProvider } from "react-router-dom";
import { router } from "@/router";
import { useRestoreSession } from "@/api/hooks/useAuth";
import { useAuthStore, useCartStore, useUIStore } from "@/store";
import { useEffect } from "react";
import { PageLoader } from "@/components/ui/Loading"; // your loading spinner

function SessionRestorer() {
  useRestoreSession();
  return null;
}

function ThemeProvider() {
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const isDark = theme === "dark" || (theme === "system" && prefersDark);
    root.classList.toggle("dark", isDark);
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle("dark", e.matches);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  return null;
}


import { Suspense } from "react";

export default function App() {
  // App.tsx or root layout
  const { isAuthenticated } = useAuthStore();
  const { cart, initGuestCart } = useCartStore();

  useEffect(() => {
    if (!isAuthenticated && !cart) {
      initGuestCart();
    }
  }, [isAuthenticated]);
  return (
    <QueryClientProvider client={queryClient}>
      <SessionRestorer />
      <ThemeProvider />
      <Suspense fallback={<PageLoader />}>
        <RouterProvider router={router} />
      </Suspense>
      <Toaster position="top-right" richColors />
      {import.meta.env.DEV && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}


