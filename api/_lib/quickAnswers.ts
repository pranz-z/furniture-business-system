import { businessContext } from './businessContext'
import type { ChatAction, ProductContext } from './types'

type QuickAnswer = {
  message: string
  actions?: ChatAction[]
}

export function getQuickAnswer(message: string, productContext: ProductContext | null): QuickAnswer | null {
  const normalized = message.toLowerCase()

  const asksHours =
    /\b(hours|open|opening|business hours|anong oras|oras|open po)\b/.test(normalized) &&
    !/\b(custom|quote|delivery|price|magkano)\b/.test(normalized)

  if (asksHours) {
    return {
      message: `Our showroom is open ${businessContext.businessHours.days}, ${businessContext.businessHours.hours}. We are closed on ${businessContext.businessHours.closed}.`,
      actions: ['appointment'],
    }
  }

  const asksPhone =
    /\b(phone|call|contact number|numero|cellphone|mobile)\b/.test(normalized) &&
    !/\b(quote|appointment|custom)\b/.test(normalized)

  if (asksPhone) {
    return {
      message: `You can reach Craft & Form at ${businessContext.contact.phone} or ${businessContext.contact.email}.`,
      actions: ['contact', 'human'],
    }
  }

  const asksAddress =
    /\b(address|where.*showroom|showroom location|saan.*showroom|location of (the )?showroom)\b/.test(normalized) ||
    normalized === 'where is your showroom?' ||
    normalized === 'where is your showroom'

  if (asksAddress) {
    return {
      message: `Our showroom is at ${businessContext.showroomAddress}. Feel free to book a visit during our business hours.`,
      actions: ['appointment'],
    }
  }

  if (productContext?.name && /^(hi|hello|hey)\b/.test(normalized)) {
    return {
      message: `Hello! I see you're asking about the ${productContext.name}. What would you like to know?`,
    }
  }

  return null
}
