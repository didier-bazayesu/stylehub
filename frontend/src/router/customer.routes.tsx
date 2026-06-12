import { lazy } from "react";
import { CustomerLayout } from "@/components/shared";
import { PublicLayout } from "@/components/shared";
import {
  RequireAuth,
  RedirectIfAuthenticated,
} from "@/components/shared/layout/ProtectedRoute";
import { ROUTES } from "@/config/constants";

const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const ForgotPasswordPage = lazy(
  () => import("@/pages/auth/ForgotPasswordPage"),
);
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPasswordPage"));

const CheckoutPage = lazy(() => import("@/pages/customer/CheckoutPage"));
const CustomerOrdersPage = lazy(() => import("@/pages/customer/OrdersPage"));
const CustomerOrderDetailPage = lazy(
  () => import("@/pages/customer/OrderDetailPage"),
);
const CustomerWishlistPage = lazy(
  () => import("@/pages/customer/WishlistPage"),
);
const CustomerProfilePage = lazy(() => import("@/pages/customer/ProfilePage"));
const CustomerAddressesPage = lazy(
  () => import("@/pages/customer/AddressesPage"),
);
const CustomerNotificationsPage = lazy(
  () => import("@/pages/customer/NotificationsPage"),
);
const CustomerReviewsPage = lazy(() => import("@/pages/customer/ReviewsPage"));
const CustomerSettingsPage = lazy(
  () => import("@/pages/customer/SettingsPage"),
);
const VendorApplyPage = lazy(() => import("@/pages/customer/VendorApplyPage"));

export const customerRoutes = [
  {
    element: <RedirectIfAuthenticated />,
    children: [
      { path: ROUTES.LOGIN, element: <LoginPage /> },
      { path: ROUTES.REGISTER, element: <RegisterPage /> },
      { path: ROUTES.FORGOT_PASSWORD, element: <ForgotPasswordPage /> },
      { path: ROUTES.RESET_PASSWORD, element: <ResetPasswordPage /> },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: ROUTES.CHECKOUT,
        element: <PublicLayout />,
        children: [{ index: true, element: <CheckoutPage /> }],
      },
      {
        path: "/dashboard",
        element: <CustomerLayout />,
        children: [
          { path: "orders", element: <CustomerOrdersPage /> },
          { path: "orders/:id", element: <CustomerOrderDetailPage /> },
          { path: "wishlist", element: <CustomerWishlistPage /> },
          { path: "profile", element: <CustomerProfilePage /> },
          { path: "addresses", element: <CustomerAddressesPage /> },
          { path: "notifications", element: <CustomerNotificationsPage /> },
          { path: "reviews", element: <CustomerReviewsPage /> },
          { path: "settings", element: <CustomerSettingsPage /> },
        ],
      },
      { path: "/vendor/apply", element: <VendorApplyPage /> },
    ],
  },
];
