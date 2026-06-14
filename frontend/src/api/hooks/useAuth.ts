import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { apiClient } from "@/api/client";
import { queryClient } from "@/config/queryClient";
import { QUERY_KEYS, ROUTES } from "@/config/constants";
import { useAuthStore } from "@/store";
import { getGuestCart, clearGuestCart } from "@/lib/guestCart";
import type {
  ApiResponse,
  AuthTokens,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  User,
} from "@/types";

// ─── Fetch current user ───────────────────────────────────────────────────────

export function useMe() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.me,
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<User>>("/auth/me");
      return data.data;
    },
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000,
  });
}

// ─── Login ────────────────────────────────────────────────────────────────────
// ─── Login ────────────────────────────────────────────────────────────────────
export function useLogin() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const { data } = await apiClient.post<
        ApiResponse<AuthTokens & { user: User }>
      >("/auth/login", payload);
      return data.data;
    },
    onSuccess: async ({ access_token, user }) => {
      setAuth(user, access_token);
      queryClient.setQueryData(QUERY_KEYS.me, user);

      // ── Merge guest cart (if any) — runs regardless of component unmount ──

      const guestItems = getGuestCart();

      if (guestItems.length > 0) {
        let lastCart = null;
        for (const item of guestItems) {
          try {
            const { data } = await apiClient.post("/cart/items", {
              variant_id: item.variant_id,
              quantity: item.quantity,
            });
            lastCart = data.data;
          } catch (err) {
            console.error("Failed to merge cart item:", item, err);
          }
        }
        clearGuestCart();
        if (lastCart) {
          queryClient.setQueryData(QUERY_KEYS.cart, lastCart);
        }
        toast.success(
          `${guestItems.length} item${guestItems.length > 1 ? "s" : ""} moved to your cart.`,
        );
      }

      // Always refresh cart from server before any cart-dependent page renders
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart });
      await queryClient.refetchQueries({ queryKey: QUERY_KEYS.cart });

      // ── Redirect: honor "from" first, else role-based ──
      const rawFrom = (
        location.state as { from?: string | { pathname: string } }
      )?.from;
      const from = typeof rawFrom === "string" ? rawFrom : rawFrom?.pathname;

      toast.success(`Welcome back, ${user.first_name}!`);

      if (from && from !== ROUTES.LOGIN && from !== ROUTES.REGISTER) {
        navigate(from, { replace: true });
        return;
      }

      if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
        navigate(ROUTES.ADMIN.DASHBOARD, { replace: true });
      } else if (user.role === "VENDOR") {
        navigate(ROUTES.VENDOR.DASHBOARD, { replace: true });
      } else {
        navigate(ROUTES.HOME, { replace: true });
      }
    },
    onError: () => {
      toast.error("Invalid email or password.");
    },
  });
}
// ─── Register ─────────────────────────────────────────────────────────────────

export function useRegister() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const { data } = await apiClient.post<
        ApiResponse<AuthTokens & { user: User }>
      >("/auth/register", payload);
      return data.data;
    },
    onSuccess: ({ access_token, user }) => {
      setAuth(user, access_token);
      queryClient.setQueryData(QUERY_KEYS.me, user);
      toast.success("Account created! Welcome to StyleHub.");
      navigate(ROUTES.HOME);
    },
  });
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export function useLogout() {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post("/auth/logout");
    },
    onSettled: () => {
      clearAuth();
      queryClient.clear();
      navigate(ROUTES.HOME);
      toast.success("You have been logged out.");
    },
  });
}

// ─── Forgot password ──────────────────────────────────────────────────────────

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (payload: ForgotPasswordPayload) => {
      await apiClient.post("/auth/forgot-password", payload);
    },
    onSuccess: () => {
      toast.success("Check your email for reset instructions.");
    },
  });
}

// ─── Reset password ───────────────────────────────────────────────────────────

export function useResetPassword() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (payload: ResetPasswordPayload) => {
      await apiClient.post("/auth/reset-password", payload);
    },
    onSuccess: () => {
      toast.success("Password updated. Please log in.");
      navigate(ROUTES.LOGIN);
    },
  });
}

// ─── Restore session on app load ─────────────────────────────────────────────

export function useRestoreSession() {
  const { setAuth, setLoading } = useAuthStore();

  return useQuery({
    queryKey: QUERY_KEYS.me,
    queryFn: async () => {
      try {
        const { data } =
          await apiClient.post<ApiResponse<AuthTokens & { user: User }>>(
            "/auth/refresh",
          );
        setAuth(data.data.user, data.data.access_token);
        return data.data.user;
      } catch {
        setLoading(false);
        return null;
      }
    },
    staleTime: Infinity,
    retry: false,
  });
}
