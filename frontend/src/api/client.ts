import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL as string

// ─── Axios instance ──────────────────────────────────────────────────────────

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // sends httpOnly refresh cookie
  headers: { 'Content-Type': 'application/json' },
})

// ─── Token injection ─────────────────────────────────────────────────────────
// Access token is stored in memory via Zustand. We inject it lazily here to
// avoid a circular import between client.ts and the auth store.

let getAccessToken: (() => string | null) | null = null
let clearAuth: (() => void) | null = null

export function injectAuthHandlers(
  tokenGetter: () => string | null,
  authClearer: () => void,
) {
  getAccessToken = tokenGetter
  clearAuth = authClearer
}

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken?.()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ─── Auto-refresh interceptor ────────────────────────────────────────────────

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token!)
    }
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // Only attempt refresh on 401, and not on the refresh endpoint itself
    const isRefreshEndpoint = originalRequest?.url?.includes('/auth/refresh')
    if (error.response?.status !== 401 || isRefreshEndpoint || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return apiClient(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const { data } = await apiClient.post<{ data: { access_token: string } }>(
        '/auth/refresh',
      )
      const newToken = data.data.access_token

      // Persist new access token in Zustand memory store
      // We use a dynamic import to avoid a circular dependency at module load time
      const { useAuthStore } = await import('@/store')
      useAuthStore.getState().setAccessToken(newToken)

      originalRequest.headers.Authorization = `Bearer ${newToken}`
      processQueue(null, newToken)
      return apiClient(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      clearAuth?.()
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

// ─── Multipart upload helper ─────────────────────────────────────────────────

export function createFormDataClient() {
  return axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    // No Content-Type — let browser set multipart boundary
  })
}
