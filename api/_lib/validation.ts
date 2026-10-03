import type { ChatHistoryMessage, ChatRequestBody, ProductContext } from './types.js'

export const MAX_MESSAGE_LENGTH = 2000
export const MAX_HISTORY_MESSAGES = 16
export const MAX_HISTORY_CONTENT_LENGTH = 2000
export const MAX_BODY_BYTES = 32_768

export function parseJsonBody(raw: string): unknown {
  if (raw.length > MAX_BODY_BYTES) {
    throw new ValidationError('Request body is too large.')
  }

  try {
    return JSON.parse(raw) as unknown
  } catch {
    throw new ValidationError('Invalid JSON body.')
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

function sanitizeHistory(history: unknown): ChatHistoryMessage[] {
  if (!Array.isArray(history)) return []

  return history
    .slice(-MAX_HISTORY_MESSAGES)
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null
      const role = (entry as { role?: unknown }).role
      const content = (entry as { content?: unknown }).content
      if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') return null
      const trimmed = content.trim().slice(0, MAX_HISTORY_CONTENT_LENGTH)
      if (!trimmed) return null
      return { role, content: trimmed } satisfies ChatHistoryMessage
    })
    .filter((entry): entry is ChatHistoryMessage => Boolean(entry))
}

function sanitizeProductContext(value: unknown): ProductContext | null {
  if (!value || typeof value !== 'object') return null
  const input = value as Record<string, unknown>

  const product: ProductContext = {}

  if (typeof input.id === 'number' && Number.isFinite(input.id)) product.id = input.id
  if (typeof input.name === 'string') product.name = input.name.trim().slice(0, 120)
  if (typeof input.category === 'string') product.category = input.category.trim().slice(0, 80)
  if (typeof input.price === 'number' && Number.isFinite(input.price) && input.price >= 0) product.price = input.price
  if (typeof input.priceType === 'string') product.priceType = input.priceType.trim().slice(0, 40)
  if (typeof input.material === 'string') product.material = input.material.trim().slice(0, 120)
  if (typeof input.dimensions === 'string') product.dimensions = input.dimensions.trim().slice(0, 120)
  if (typeof input.availability === 'string') product.availability = input.availability.trim().slice(0, 80)
  if (typeof input.leadTime === 'string') product.leadTime = input.leadTime.trim().slice(0, 80)
  if (typeof input.description === 'string') product.description = input.description.trim().slice(0, 500)
  if (typeof input.style === 'string') product.style = input.style.trim().slice(0, 80)
  if (typeof input.customizationAvailable === 'boolean') product.customizationAvailable = input.customizationAvailable

  if (!product.id && !product.name) return null
  return product
}

export function validateChatRequest(body: unknown): ChatRequestBody {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Invalid request body.')
  }

  const message = (body as { message?: unknown }).message
  if (typeof message !== 'string') {
    throw new ValidationError('Message is required.')
  }

  const trimmed = message.trim()
  if (!trimmed) {
    throw new ValidationError('Message is required.')
  }

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    throw new ValidationError(`Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`)
  }

  return {
    message: trimmed,
    history: sanitizeHistory((body as { history?: unknown }).history),
    productContext: sanitizeProductContext((body as { productContext?: unknown }).productContext),
  }
}
