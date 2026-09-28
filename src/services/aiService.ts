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

  if (normalized.includes('sofa') || normalized.includes('cabinets') || normalized.includes('bed')) {
    return 'We offer made-to-order solutions for sofas, bedroom sets, and cabinetry. We can help you choose the right material and finish for your space.'
  }

  return 'Thank you for reaching out. Our team can help with pricing, custom sizes, finish options, showroom visits, and delivery for Pampanga homes and businesses.'
}
