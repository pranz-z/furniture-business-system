import {
  appointments as initialAppointments,
  customers as initialCustomers,
  inquiries as initialInquiries,
  orders as initialOrders,
  products as initialProducts,
  quotationRequests as initialQuotations,
  reviews as initialReviews,
} from '../data/mockData.js'
import type {
  Appointment,
  Customer,
  InquiryThread,
  Notification,
  Order,
  Product,
  QuotationRequest,
  Review,
} from '../types.js'

export type Activity = {
  id: string
  message: string
  timestamp: string
  type: 'quote' | 'appointment' | 'order' | 'inquiry'
}

export type DemoState = {
  customers: Customer[]
  products: Product[]
  inquiries: InquiryThread[]
  quotations: QuotationRequest[]
  appointments: Appointment[]
  orders: Order[]
  notifications: Notification[]
  reviews: Review[]
  activities: Activity[]
}

const STORAGE_KEY = 'craft-and-form-demo-state'

function createNotification(customerName: string, message: string, type: Notification['type']): Notification {
  return {
    id: `ntf-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    customerName,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString(),
  }
}

function createActivity(message: string, type: Activity['type']): Activity {
  return {
    id: `act-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    message,
    timestamp: new Date().toISOString(),
    type,
  }
}

export function getInitialDemoState(): DemoState {
  return {
    customers: initialCustomers,
    products: initialProducts,
    inquiries: initialInquiries,
    quotations: initialQuotations,
    appointments: initialAppointments,
    orders: initialOrders,
    notifications: [
      createNotification('Maria Santos', 'Your quote for a custom dining table is now in review.', 'quote'),
      createNotification('Ricardo Dela Cruz', 'Your appointment request has been confirmed.', 'appointment'),
      createNotification('Ana Reyes', 'Your order has moved to production.', 'order'),
      createNotification('Julius Cruz', 'Your consultation request was updated by the admin team.', 'inquiry'),
    ],
    reviews: initialReviews,
    activities: [
      createActivity('Maria Santos requested a custom dining table quote.', 'quote'),
      createActivity('Ricardo Dela Cruz booked a showroom visit.', 'appointment'),
      createActivity('Ana Reyes confirmed a production update.', 'order'),
      createActivity('Julius Cruz inquiry was marked resolved by the team.', 'inquiry'),
    ],
  }
}

export function getDemoState(): DemoState {
  if (typeof window === 'undefined') {
    return getInitialDemoState()
  }

  try {
    const savedState = window.localStorage.getItem(STORAGE_KEY)
    if (!savedState) {
      return getInitialDemoState()
    }

    return JSON.parse(savedState) as DemoState
  } catch {
    return getInitialDemoState()
  }
}

export function persistDemoState(state: DemoState) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }
}

export function addQuoteRequest(
  state: DemoState,
  form: {
    customerName: string
    furnitureType: string
    dimensions: string
    material: string
    finish: string
    quantity: string
    budget: string
    details: string
    phone: string
    email: string
    location: string
  },
  quoteNumberOverride?: string,
): DemoState {
  const customerName = form.customerName || 'Maria Santos'
  const generatedQuoteNumber = quoteNumberOverride ?? `QTN-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`
  const amount = Number.parseInt(form.budget.replace(/[^\d]/g, ''), 10) || 24500
  const quote: QuotationRequest = {
    quoteNumber: generatedQuoteNumber,
    customer: customerName,
    furniture: form.furnitureType || 'Custom Furniture',
    amount,
    date: new Date().toISOString().slice(0, 10),
    status: 'New',
  }

  const inquiry: InquiryThread = {
    id: `INQ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    customer: customerName,
    location: form.location || 'Pampanga',
    inquiry: `${form.furnitureType || 'Custom furniture'} request with ${form.dimensions || 'custom dimensions'} and ${form.material || 'wood'} finish`,
    status: 'AI Assisted',
    productName: form.furnitureType || 'Custom Furniture',
    messages: [
      { sender: 'customer', text: `Hi, I’d like to request a ${form.furnitureType || 'custom furniture'} design.` },
      { sender: 'assistant', text: 'We can help with dimensions, materials, and finishing options. I can prepare a quotation for you.' },
    ],
  }

  const nextCustomers = state.customers.some((customer) => customer.name === customerName)
    ? state.customers.map((customer) =>
        customer.name === customerName
          ? {
              ...customer,
              quotes: (customer.quotes ?? 0) + 1,
              inquiries: (customer.inquiries ?? 0) + 1,
            }
          : customer,
      )
    : [
        ...state.customers,
        {
          id: Date.now(),
          name: customerName,
          phone: form.phone,
          email: form.email,
          location: form.location || 'Pampanga',
          orders: 0,
          quotes: 1,
          appointments: 0,
          inquiries: 1,
        },
      ]

  return {
    ...state,
    customers: nextCustomers,
    quotations: [quote, ...state.quotations],
    inquiries: [inquiry, ...state.inquiries],
    notifications: [
      createNotification(customerName, `Your quote request ${generatedQuoteNumber} has been received and is awaiting review.`, 'quote'),
      ...state.notifications,
    ],
    activities: [
      createActivity(`${customerName} submitted a quote request for ${quote.furniture}.`, 'quote'),
      ...state.activities,
    ],
  }
}

export function addAppointmentRequest(
  state: DemoState,
  form: {
    name: string
    phone: string
    email: string
    date: string
    time: string
    purpose: string
  },
  appointmentIdOverride?: string,
): DemoState {
  const customerName = form.name || 'Maria Santos'
  const appointmentId = appointmentIdOverride ?? `APT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`
  const appointment: Appointment = {
    id: appointmentId,
    customer: customerName,
    date: form.date || '2026-09-30',
    time: form.time || '2:00 PM',
    type: (form.purpose as Appointment['type']) || 'Product Viewing',
    status: 'Confirmed',
  }

  const nextCustomers = state.customers.some((customer) => customer.name === customerName)
    ? state.customers.map((customer) =>
        customer.name === customerName ? { ...customer, appointments: (customer.appointments ?? 0) + 1 } : customer,
      )
    : [
        ...state.customers,
        {
          id: Date.now() + 1,
          name: customerName,
          phone: form.phone,
          email: form.email,
          location: 'Pampanga',
          orders: 0,
          quotes: 0,
          appointments: 1,
          inquiries: 0,
        },
      ]

  return {
    ...state,
    customers: nextCustomers,
    appointments: [appointment, ...state.appointments],
    notifications: [
      createNotification(customerName, `Your showroom appointment ${appointmentId} was confirmed for ${appointment.date} at ${appointment.time}.`, 'appointment'),
      ...state.notifications,
    ],
    activities: [
      createActivity(`${customerName} booked a ${appointment.type.toLowerCase()} appointment.`, 'appointment'),
      ...state.activities,
    ],
  }
}

export function updateQuoteStatus(state: DemoState, quoteNumber: string, status: QuotationRequest['status']): DemoState {
  const updatedQuotations = state.quotations.map((quote) =>
    quote.quoteNumber === quoteNumber ? { ...quote, status } : quote,
  )

  const matchingQuote = updatedQuotations.find((quote) => quote.quoteNumber === quoteNumber)
  if (!matchingQuote) {
    return state
  }

  return {
    ...state,
    quotations: updatedQuotations,
    notifications: [
      createNotification(matchingQuote.customer, `Your quote ${matchingQuote.quoteNumber} status has changed to ${status}.`, 'quote'),
      ...state.notifications,
    ],
    activities: [
      createActivity(`Admin updated quote ${matchingQuote.quoteNumber} to ${status}.`, 'quote'),
      ...state.activities,
    ],
  }
}

export function updateInquiryStatus(state: DemoState, inquiryId: string, status: InquiryThread['status']): DemoState {
  const updatedInquiries = state.inquiries.map((inquiry) =>
    inquiry.id === inquiryId ? { ...inquiry, status, unread: false } : inquiry,
  )

  const matchingInquiry = updatedInquiries.find((inquiry) => inquiry.id === inquiryId)
  if (!matchingInquiry) {
    return state
  }

  return {
    ...state,
    inquiries: updatedInquiries,
    notifications: [
      createNotification(matchingInquiry.customer, `Your inquiry ${matchingInquiry.id} was updated to ${status}.`, 'inquiry'),
      ...state.notifications,
    ],
    activities: [
      createActivity(`Admin marked inquiry ${matchingInquiry.id} as ${status}.`, 'inquiry'),
      ...state.activities,
    ],
  }
}

export function updateAppointmentStatus(
  state: DemoState,
  appointmentId: string,
  status: Appointment['status'],
): DemoState {
  const updatedAppointments = state.appointments.map((appointment) =>
    appointment.id === appointmentId ? { ...appointment, status } : appointment,
  )

  const matchingAppointment = updatedAppointments.find((appointment) => appointment.id === appointmentId)
  if (!matchingAppointment) {
    return state
  }

  return {
    ...state,
    appointments: updatedAppointments,
    notifications: [
      createNotification(matchingAppointment.customer, `Your appointment ${matchingAppointment.id} is now marked ${status}.`, 'appointment'),
      ...state.notifications,
    ],
    activities: [
      createActivity(`Admin updated appointment ${matchingAppointment.id} to ${status}.`, 'appointment'),
      ...state.activities,
    ],
  }
}

export function updateOrderStatus(state: DemoState, orderNumber: string, status: Order['status']): DemoState {
  const updatedOrders = state.orders.map((order) =>
    order.orderNumber === orderNumber ? { ...order, status } : order,
  )

  const matchingOrder = updatedOrders.find((order) => order.orderNumber === orderNumber)
  if (!matchingOrder) {
    return state
  }

  return {
    ...state,
    orders: updatedOrders,
    notifications: [
      createNotification(matchingOrder.customer, `Your order ${matchingOrder.orderNumber} status is now ${status}.`, 'order'),
      ...state.notifications,
    ],
    activities: [
      createActivity(`Admin moved order ${matchingOrder.orderNumber} to ${status}.`, 'order'),
      ...state.activities,
    ],
  }
}
