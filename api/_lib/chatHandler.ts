import { detectActions } from './actions.js'
import { resolveProductContext } from './businessContext.js'
import { generateAssistantReply } from './geminiService.js'
import { getQuickAnswer } from './quickAnswers.js'
import { checkRateLimit } from './rateLimit.js'
import type { ChatApiResponse } from './types.js'
import { ValidationError, validateChatRequest } from './validation.js'

const GENERIC_ERROR = 'Unable to respond right now.'
const QUOTA_ERROR =
  'Our online assistant is receiving a high number of requests right now. Please try again shortly or contact our team directly.'
const RATE_LIMIT_ERROR = 'Please wait a moment before sending another message.'
const TIMEOUT_ERROR = 'The assistant took too long to respond. Please try again.'
const SAFETY_ERROR = 'I can’t help with that request, but I can assist with our furniture, quotes, appointments, and showroom details.'

export type ChatHandlerInput = {
  method?: string
  body: unknown
  clientKey: string
}

export type ChatHandlerResult = {
  status: number
  body: ChatApiResponse
  headers?: Record<string, string>
}

export async function handleChatRequest(input: ChatHandlerInput): Promise<ChatHandlerResult> {
  const started = Date.now()

  if (input.method && input.method !== 'POST') {
    return {
      status: 405,
      body: { success: false, error: 'Method not allowed.' },
      headers: { Allow: 'POST' },
    }
  }

  const rate = checkRateLimit(input.clientKey)
  if (!rate.allowed) {
    console.error('[chat] Rate limited', { clientKey: input.clientKey, retryAfterSec: rate.retryAfterSec })
    return {
      status: 429,
      body: {
        success: false,
        error: RATE_LIMIT_ERROR,
        code: 'rate_limited',
        actions: ['contact', 'human'],
      },
      headers: { 'Retry-After': String(rate.retryAfterSec) },
    }
  }

  try {
    const request = validateChatRequest(input.body)
    const productContext = resolveProductContext(request.productContext)
    const quick = getQuickAnswer(request.message, productContext)

    if (quick) {
      console.info('[chat] Quick answer', { latencyMs: Date.now() - started, success: true })
      return {
        status: 200,
        body: {
          success: true,
          message: quick.message,
          actions: quick.actions,
        },
      }
    }

    const result = await generateAssistantReply({
      message: request.message,
      history: request.history ?? [],
      productContext,
    })

    if (!result.ok) {
      console.error('[chat] Request failed', {
        category: result.category,
        latencyMs: result.latencyMs || Date.now() - started,
        success: false,
      })

      if (result.category === 'quota') {
        return {
          status: 503,
          body: {
            success: false,
            error: QUOTA_ERROR,
            code: 'quota',
            actions: ['contact', 'human'],
          },
        }
      }

      if (result.category === 'timeout') {
        return {
          status: 504,
          body: {
            success: false,
            error: TIMEOUT_ERROR,
            code: 'timeout',
            actions: ['contact'],
          },
        }
      }

      if (result.category === 'safety') {
        return {
          status: 200,
          body: {
            success: true,
            message: SAFETY_ERROR,
            actions: ['human', 'contact'],
          },
        }
      }

      return {
        status: 503,
        body: {
          success: false,
          error: GENERIC_ERROR,
          code: 'unavailable',
          actions: ['contact', 'human'],
        },
      }
    }

    const actions = detectActions(request.message, result.text)
    console.info('[chat] Success', { latencyMs: result.latencyMs, success: true })

    return {
      status: 200,
      body: {
        success: true,
        message: result.text,
        actions: actions.length ? actions : undefined,
      },
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        status: 400,
        body: {
          success: false,
          error: error.message,
          code: 'validation',
        },
      }
    }

    console.error('[chat] Unexpected failure', {
      latencyMs: Date.now() - started,
      success: false,
    })

    return {
      status: 500,
      body: {
        success: false,
        error: GENERIC_ERROR,
        code: 'unavailable',
        actions: ['contact', 'human'],
      },
    }
  }
}
