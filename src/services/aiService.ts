/**
 * @deprecated Use customerSupportService.sendSupportMessage for live Gemini-backed chat.
 * Kept as a tiny offline fallback helper for non-AI UI paths.
 */
export function getAiReply(message: string, productName?: string): string {
  const normalized = message.toLowerCase()

  if (productName && normalized.includes(productName.toLowerCase())) {
    return `Thanks for your interest in ${productName}. We can customize the size, material, and finish to suit your space and budget.`
  }

  if (normalized.includes('narra') || normalized.includes('dining table')) {
    return 'According to our current catalog, the Narra Dining Table starts at ₱18,500. Final pricing may vary depending on size and customization.'
  }

  if (normalized.includes('custom') || normalized.includes('custom size') || normalized.includes('quote')) {
    return 'Yes. We can accommodate custom dimensions, materials, and finishes. I can help you request a quotation and connect you with our design team.'
  }

  if (normalized.includes('deliver') || normalized.includes('delivery') || normalized.includes('pampanga')) {
    return 'Yes, we deliver around Pampanga and can coordinate installation for most residential and commercial projects in Angeles, San Fernando, Clark, and nearby areas.'
  }

  if (normalized.includes('showroom') || normalized.includes('location') || normalized.includes('where')) {
    return 'Our showroom is located in Pampanga, Philippines. We welcome appointments for product viewing and custom consultations during our Monday to Saturday business hours.'
  }

  if (normalized.includes('lead time') || normalized.includes('how long') || normalized.includes('custom order')) {
    return 'Most custom furniture orders take around 4 to 8 weeks depending on the size, material, and finishing requirements.'
  }

  return 'Thank you for reaching out. Our team can help with pricing, custom sizes, finish options, showroom visits, and delivery for Pampanga homes and businesses.'
}
