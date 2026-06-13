import { createBrowserRouter } from "react-router-dom";
import { publicRoutes } from "./public.routes";
import { customerRoutes } from "./customer.routes";
import { vendorRoutes } from "./vendor.routes";
import { adminRoutes } from "./admin.routes";
import { ErrorFallback } from "@/components/ui/ErrorFallback ";

export const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorFallback />,
    children: [
      publicRoutes,
      ...customerRoutes,
      vendorRoutes,
      adminRoutes,
    ],
  },
]);

