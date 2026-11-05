import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import type { Product } from '@/types'

export interface ChatMessage {
  role: 'user' | 'model'
  content: string
}

export interface AiChatResponse {
  reply: string
  products: Product[]
}

export function useAiChat() {
  return useMutation({
    mutationFn: async (messages: ChatMessage[]): Promise<AiChatResponse> => {
      const { data } = await apiClient.post<AiChatResponse>('/ai/chat', {
        messages,
      })
      return data
    },
  })
}
