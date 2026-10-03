import { categories, products } from '../../src/data/mockData.js'
import type { Category, Product } from '../../src/types.js'
import type { ProductContext } from './types.js'

export const businessContext = {
  businessName: 'Craft & Form',
  legalName: 'Pampanga Furniture Co.',
  location: 'Pampanga, Philippines',
  showroomAddress: '42 N. M. Hizon St., Angeles City, Pampanga',
  services: [
    'Ready-made furniture sales',
    'Custom and made-to-order furniture',
    'Material and finish consultation',
    'Quotation requests',
    'Showroom visits and product viewing',
    'Project consultation',
    'Delivery within Pampanga',
    'Installation coordination',
  ],
  serviceAreas: [
    'Angeles City',
    'San Fernando',
    'Clark',
    'Mabalacat',
    'Mexico',
    'Porac',
    'Bacolor',
    'Guagua',
    'Nearby areas within Pampanga',
  ],
  businessHours: {
    days: 'Monday–Saturday',
    hours: '9:00 AM – 6:00 PM',
    closed: 'Sunday',
  },
  contact: {
    phone: '+63 917 123 4567',
    email: 'hello@craftandform.ph',
    facebook: '@craftandformph',
    messenger: 'm.me/craftandformph',
  },
  policies: {
    pricing: 'Catalog prices are starting prices. Final pricing for custom or made-to-order pieces depends on dimensions, materials, finish, quantity, delivery, and other requirements.',
    quotations: 'Quotations are created through the website quotation form and reviewed by the business team. The assistant cannot submit or approve quotations on its own.',
    appointments: 'Showroom visits and consultations are requested through the website appointment form. The team confirms the final schedule.',
    delivery: 'Delivery is available around Pampanga. Exact delivery fees are confirmed by the team based on location and order details.',
    leadTimes: 'Made-to-order and custom furniture commonly take several weeks. Use product lead-time data when available; otherwise the team confirms timing.',
    warranty: '1-year craftsmanship warranty is mentioned for product detail pages where applicable.',
  },
  categories: categories.map((category: Category) => ({
    name: category.name,
    description: category.description,
  })),
}

export function getCatalogSummary() {
  return products.map((product: Product) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    startingPrice: product.price,
    material: product.material,
    availability: product.availability,
    leadTime: product.leadTime,
    customizationAvailable: product.availability === 'Custom' || product.availability === 'Made to Order' || true,
  }))
}

export function findProductById(id: number) {
  return products.find((product: Product) => product.id === id)
}

export function findProductByName(name: string) {
  const normalized = name.trim().toLowerCase()
  return products.find((product: Product) => product.name.toLowerCase() === normalized)
}

export function resolveProductContext(incoming?: ProductContext | null): ProductContext | null {
  if (!incoming) return null

  const fromId = typeof incoming.id === 'number' ? findProductById(incoming.id) : undefined
  const fromName = incoming.name ? findProductByName(incoming.name) : undefined
  const catalogProduct = fromId ?? fromName

  if (catalogProduct) {
    return {
      id: catalogProduct.id,
      name: catalogProduct.name,
      category: catalogProduct.category,
      price: typeof incoming.price === 'number' ? incoming.price : catalogProduct.price,
      priceType: 'Starting price',
      material: incoming.material || catalogProduct.material,
      dimensions: incoming.dimensions || catalogProduct.dimensions,
      availability: incoming.availability || catalogProduct.availability,
      leadTime: incoming.leadTime || catalogProduct.leadTime,
      description: incoming.description || catalogProduct.description,
      style: incoming.style || catalogProduct.style,
      customizationAvailable: incoming.customizationAvailable ?? true,
    }
  }

  if (!incoming.name) return null

  return {
    name: String(incoming.name).slice(0, 120),
    category: incoming.category ? String(incoming.category).slice(0, 80) : undefined,
    price: typeof incoming.price === 'number' && Number.isFinite(incoming.price) ? incoming.price : undefined,
    priceType: incoming.priceType ? String(incoming.priceType).slice(0, 40) : 'Starting price',
    material: incoming.material ? String(incoming.material).slice(0, 120) : undefined,
    dimensions: incoming.dimensions ? String(incoming.dimensions).slice(0, 120) : undefined,
    availability: incoming.availability ? String(incoming.availability).slice(0, 80) : undefined,
    leadTime: incoming.leadTime ? String(incoming.leadTime).slice(0, 80) : undefined,
    description: incoming.description ? String(incoming.description).slice(0, 500) : undefined,
    style: incoming.style ? String(incoming.style).slice(0, 80) : undefined,
    customizationAvailable: incoming.customizationAvailable ?? true,
  }
}

export function formatProductContext(product: ProductContext): string {
  const lines = [
    `Name: ${product.name ?? 'Unspecified'}`,
    product.category ? `Category: ${product.category}` : null,
    typeof product.price === 'number' ? `Starting Price: ₱${product.price.toLocaleString()}` : null,
    product.priceType ? `Price Type: ${product.priceType}` : null,
    product.material ? `Material: ${product.material}` : null,
    product.dimensions ? `Dimensions: ${product.dimensions}` : null,
    product.availability ? `Availability: ${product.availability}` : null,
    product.leadTime ? `Lead Time: ${product.leadTime}` : null,
    product.style ? `Style: ${product.style}` : null,
    `Customization: ${product.customizationAvailable === false ? 'Not indicated' : 'Available'}`,
    product.description ? `Description: ${product.description}` : null,
  ]

  return lines.filter(Boolean).join('\n')
}
