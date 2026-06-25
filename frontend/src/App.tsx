import {  Suspense, useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { queryClient } from "@/config/queryClient";
import { useRestoreSession } from "@/api/hooks/useAuth";
import { useUIStore } from "@/store";
import { PageLoader } from "@/components/ui/Loading";
import { router } from "@/router";

// ─── Session restore ───────────────────────────────────────────────────────────
function SessionRestorer() {
  useRestoreSession();
  return null;
}

// ─── Theme sync ────────────────────────────────────────────────────────────────
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

// ─── App ───────────────────────────────────────────────────────────────────────
export default function App() {
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
