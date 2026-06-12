import { lazy } from "react";
import { ROUTES } from "@/config/constants";
import { PublicLayout } from "@/components/shared";

const HomePage = lazy(() => import("@/pages/public/HomePage"));
const ProductsPage = lazy(() => import("@/pages/public/ProductsPage"));
const ProductDetailPage = lazy(
  () => import("@/pages/public/ProductDetailPage"),
);
const StorePage = lazy(() => import("@/pages/public/StorePage"));
const CartPage = lazy(() => import("@/pages/public/CartPage"));

export const publicRoutes = {
  path: "/",
  element: <PublicLayout />,
  children: [
    { path: ROUTES.HOME, element: <HomePage /> },
    { path: ROUTES.PRODUCTS, element: <ProductsPage /> },
    { path: "/products/:slug", element: <ProductDetailPage /> },
    { path: "/stores/:slug", element: <StorePage /> },
    { path: ROUTES.CART, element: <CartPage /> },
  ],
};
