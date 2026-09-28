export type Category = {
  name: string
  icon: string
  description: string
}

export type Product = {
  id: number
  name: string
  category: string
  price: number
  material: string
  dimensions: string
  leadTime: string
  availability: 'In Stock' | 'Made to Order' | 'Custom' | 'Limited'
  style: string
  image: string
  description: string
  location: string
}

export type Customer = {
  id: number
  name: string
  phone: string
  email: string
  location: string
  orders?: number
  quotes?: number
  appointments?: number
  inquiries?: number
}

export type InquiryMessage = {
  sender: 'customer' | 'assistant' | 'admin'
  text: string
}

export type InquiryThread = {
  id: string
  customer: string
  location: string
  inquiry: string
  status: 'AI Assisted' | 'In Progress' | 'Resolved' | 'Closed' | 'New'
  productName: string
  messages: InquiryMessage[]
  unread?: boolean
}

export type QuotationRequest = {
  quoteNumber: string
  customer: string
  furniture: string
  amount: number
  date: string
  status: 'New' | 'Reviewing' | 'Quoted' | 'Approved' | 'Rejected' | 'Need More Information' | 'Expired' | 'Customer Requested Changes'
}

export type Appointment = {
  id: string
  customer: string
  date: string
  time: string
  type: 'Product Viewing' | 'Custom Furniture Consultation' | 'Project Consultation'
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Rescheduled' | 'Rejected'
}

export type Order = {
  orderNumber: string
  customer: string
  total: number
  status: 'For Confirmation' | 'Confirmed' | 'In Production' | 'Ready for Delivery' | 'Payment Pending' | 'Paid' | 'Quality Check' | 'Out for Delivery' | 'Delivered' | 'Completed' | 'Cancelled'
  date: string
}

export type Project = {
  id: number
  name: string
  type: string
  location: string
  image: string
  description: string
}

export type Review = {
  customer: string
  project: string
  rating: number
  quote: string
}

export type Notification = {
  id: string
  customerName: string
  message: string
  type: 'quote' | 'appointment' | 'order' | 'inquiry' | 'system'
  read: boolean
  createdAt: string
}

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
