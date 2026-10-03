export type ChatHistoryMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type ProductContext = {
  id?: number
  name?: string
  category?: string
  price?: number
  priceType?: string
  material?: string
  dimensions?: string
  availability?: string
  leadTime?: string
  description?: string
  customizationAvailable?: boolean
  style?: string
}

export type ChatAction = 'quote' | 'appointment' | 'human' | 'contact'

export type ChatRequestBody = {
  message: string
  history?: ChatHistoryMessage[]
  productContext?: ProductContext | null
}

export type ChatSuccessResponse = {
  success: true
  message: string
  actions?: ChatAction[]
}

export type ChatErrorResponse = {
  success: false
  error: string
  actions?: ChatAction[]
  code?: 'rate_limited' | 'unavailable' | 'validation' | 'timeout' | 'quota'
}

export type ChatApiResponse = ChatSuccessResponse | ChatErrorResponse
