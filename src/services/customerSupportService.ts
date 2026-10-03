import type { ChatAction, ChatApiResponse, ChatHistoryMessage, ProductContext } from '../../shared/chatTypes.js'

export type { ChatAction, ChatHistoryMessage, ProductContext }

export type SupportProduct = {
  id: number
  name: string
  category: string
  price: number
  material: string
  dimensions: string
  availability: string
  leadTime: string
  description: string
  style?: string
}

export type SendSupportMessageInput = {
  message: string
  history: ChatHistoryMessage[]
  product?: SupportProduct | null
}

export type SendSupportMessageResult = {
  success: boolean
  message: string
  actions?: ChatAction[]
  code?: string
}

const HISTORY_LIMIT = 16

function toProductContext(product?: SupportProduct | null): ProductContext | null {
  if (!product) return null

  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    priceType: 'Starting price',
    material: product.material,
    dimensions: product.dimensions,
    availability: product.availability,
    leadTime: product.leadTime,
    description: product.description,
    style: product.style,
    customizationAvailable: true,
  }
}

export function buildChatHistory(
  messages: Array<{ sender: 'customer' | 'assistant'; text: string }>,
): ChatHistoryMessage[] {
  return messages
    .filter((message) => message.text.trim())
    .slice(-HISTORY_LIMIT)
    .map((message) => ({
      role: message.sender === 'customer' ? 'user' : 'assistant',
      content: message.text,
    }))
}

export async function sendSupportMessage(input: SendSupportMessageInput): Promise<SendSupportMessageResult> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 30_000)

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: input.message,
        history: input.history.slice(-HISTORY_LIMIT),
        productContext: toProductContext(input.product),
      }),
      signal: controller.signal,
    })

    let data: ChatApiResponse | null = null
    try {
      data = (await response.json()) as ChatApiResponse
    } catch {
      data = null
    }

    if (!data) {
      return {
        success: false,
        message: 'Unable to respond right now.',
        code: 'unavailable',
        actions: ['contact', 'human'],
      }
    }

    if (data.success) {
      return {
        success: true,
        message: data.message,
        actions: data.actions,
      }
    }

    return {
      success: false,
      message: data.error || 'Unable to respond right now.',
      code: data.code,
      actions: data.actions,
    }
  } catch (error) {
    const isAbort = error instanceof DOMException && error.name === 'AbortError'
    const offline = typeof navigator !== 'undefined' && navigator.onLine === false

    return {
      success: false,
      message: offline
        ? 'You appear to be offline. Please check your connection and try again.'
        : isAbort
          ? 'The assistant took too long to respond. Please try again.'
          : 'Unable to reach our assistant right now. Please try again or contact our team.',
      code: offline ? 'offline' : isAbort ? 'timeout' : 'network',
      actions: ['contact', 'human'],
    }
  } finally {
    window.clearTimeout(timeout)
  }
}
