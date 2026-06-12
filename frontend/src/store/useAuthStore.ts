import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { injectAuthHandlers } from '@/api/client'
import type { User } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  setAuth: (user: User, accessToken: string) => void
  setUser: (user: User) => void
  setAccessToken: (token: string) => void
  clearAuth: () => void
  setLoading: (loading: boolean) => void
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  subscribeWithSelector((set) => ({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,

    setAuth: (user, accessToken) =>
      set({ user, accessToken, isAuthenticated: true, isLoading: false }),

    setUser: (user) => set({ user }),

    setAccessToken: (accessToken) => set({ accessToken }),

    clearAuth: () =>
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      }),

    setLoading: (isLoading) => set({ isLoading }),
  })),
)

// ─── Inject token getter into Axios client ────────────────────────────────────
// Done once at module load time so Axios can read the token from memory

injectAuthHandlers(
  () => useAuthStore.getState().accessToken,
  () => useAuthStore.getState().clearAuth(),
)

// ─── Derived selectors ────────────────────────────────────────────────────────

export const selectIsVendor = (state: AuthState) =>
  state.user?.role === 'VENDOR' || state.user?.role === 'ADMIN' || state.user?.role === 'SUPER_ADMIN'

export const selectIsAdmin = (state: AuthState) =>
  state.user?.role === 'ADMIN' || state.user?.role === 'SUPER_ADMIN'

export const selectIsApprovedVendor = (state: AuthState) =>
  state.user?.vendor?.status === 'APPROVED'
