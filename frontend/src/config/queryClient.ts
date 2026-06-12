import { QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000,   // 10 minutes
      retry: (failureCount, error) => {
        const axiosError = error as AxiosError
        // Don't retry on 4xx client errors
        if (axiosError.response?.status && axiosError.response.status < 500) {
          return false
        }
        return failureCount < 3
      },
      refetchOnWindowFocus: import.meta.env.PROD,
    },
    mutations: {
      onError: (error) => {
        const axiosError = error as AxiosError<ApiError>
        const message =
          axiosError.response?.data?.error?.message ?? 'Something went wrong. Please try again.'
        toast.error(message)
      },
    },
  },
})
