import type { ChatAction } from './types.js'

export function detectActions(message: string, reply: string): ChatAction[] {
  const combined = `${message}\n${reply}`.toLowerCase()
  const actions = new Set<ChatAction>()

  if (
    /\b(quote|quotation|magpa-?quote|pa-?quote|pricing request|request a quote)\b/.test(combined) ||
    /\b(custom size|custom dimensions|made to order|customize)\b/.test(message.toLowerCase())
  ) {
    actions.add('quote')
  }

  if (
    /\b(appointment|visit|book|consultation|showroom visit|magpa-?appoint|pumunta)\b/.test(combined)
  ) {
    actions.add('appointment')
  }

  if (
    /\b(human|staff|person|agent|team|customer service|talk to|kausap.*tao|real person)\b/.test(combined)
  ) {
    actions.add('human')
  }

  if (/\b(contact|phone|email|call us|reach)\b/.test(combined)) {
    actions.add('contact')
  }

  return [...actions]
}
