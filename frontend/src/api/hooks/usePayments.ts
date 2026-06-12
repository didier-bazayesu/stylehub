import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import type { ApiResponse } from '@/types'

interface CreatePaymentIntentResponse {
  client_secret: string
}

export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data } = await apiClient.post<ApiResponse<CreatePaymentIntentResponse>>(
        '/payments/create-intent',
        { order_id: orderId },
      )
      return data.data
    },
  })
}
