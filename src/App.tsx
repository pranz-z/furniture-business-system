import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import './App.css'
import { adminSalesData, categories, inquiryVolumeData, popularProducts, projects } from './data/mockData'
import {
  buildChatHistory,
  sendSupportMessage,
  type ChatAction,
} from './services/customerSupportService'
import {
  addAppointmentRequest,
  addQuoteRequest,
  getDemoState,
  persistDemoState,
  updateAppointmentStatus,
  updateInquiryStatus,
  updateOrderStatus,
  updateQuoteStatus,
} from './services/demoService'
import type { Appointment, InquiryThread, Order, Product, QuotationRequest } from './types'

type ChatMessage = {
  sender: 'customer' | 'assistant'
  text: string
  actions?: ChatAction[]
}

type ChatStatus = 'idle' | 'sending' | 'error'

const CHAT_STORAGE_KEY = 'craft-form-chat-messages'

const SUGGESTED_QUESTIONS = [
  'Do you make custom furniture?',
  'How do I request a quote?',
  'Do you deliver around Pampanga?',
  'Can I customize the size?',
  'Where is your showroom?',
]

const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  { sender: 'assistant', text: 'Hi! Welcome to Craft & Form. How can I help you today?' },
  {
    sender: 'assistant',
    text: 'I can help with furniture, customization, quotations, appointments, and general inquiries.',
  },
]

function getInitialChatMessages(): ChatMessage[] {
  try {
    const storedMessages = sessionStorage.getItem(CHAT_STORAGE_KEY)
    if (!storedMessages) return INITIAL_CHAT_MESSAGES

    const parsed: unknown = JSON.parse(storedMessages)
    if (!Array.isArray(parsed)) return INITIAL_CHAT_MESSAGES

    const messages = parsed.filter(
      (entry): entry is ChatMessage =>
        Boolean(entry) &&
        typeof entry === 'object' &&
        ((entry as Record<string, unknown>).sender === 'customer' ||
          (entry as Record<string, unknown>).sender === 'assistant') &&
        typeof (entry as Record<string, unknown>).text === 'string',
    )
    return messages.length ? messages : INITIAL_CHAT_MESSAGES
  } catch (error) {
    console.warn('[chat] Could not restore conversation from this session.', error)
    return INITIAL_CHAT_MESSAGES
  }
}

type CustomerTab = 'overview' | 'orders' | 'quotes' | 'appointments' | 'messages' | 'saved' | 'notifications' | 'profile'
type CartItem = { productId: number; quantity: number }

type QuoteSuccess = {
  quoteNumber: string
  productName: string
  amount: number
}

const formatCurrency = (amount: number) => `₱${amount.toLocaleString()}`

const defaultCheckoutForm = {
  fullName: 'Maria Santos',
  phone: '+63 917 112 3456',
  email: 'maria.santos@gmail.com',
  address: 'Lot 12, Purok 2',
  barangay: 'Balibago',
  city: 'Angeles City',
  province: 'Pampanga',
  postalCode: '2009',
  notes: 'Please call before delivery.',
  deliveryMethod: 'Delivery',
}

const defaultQuoteForm = {
  productName: '',
  preferredSize: '',
  quantity: '1',
  material: 'Solid Narra',
  finish: 'Natural Walnut',
  color: 'Natural wood tone',
  requirements: '',
  budget: '₱20,000 - ₱40,000',
  name: 'Maria Santos',
  phone: '+63 917 112 3456',
  email: 'maria.santos@gmail.com',
  location: 'Angeles City, Pampanga',
}

const defaultAppointmentForm = {
  name: 'Maria Santos',
  phone: '+63 917 112 3456',
  email: 'maria.santos@gmail.com',
  date: '2026-09-30',
  time: '2:00 PM',
  purpose: 'Product Viewing',
}

/* Photographs are placeholders from Unsplash, cropped into the layout; the
   engraving is a public-domain plate (Roubo, L'Art du Menuisier, 1775). */
const PRODUCT_PHOTOS: Record<number, string> = {
  1: '/img/interior.jpg',
  2: '/img/sofa-room.jpg',
  3: '/img/sofa-room.jpg',
  4: '/img/hero-room.jpg',
  5: '/img/office.jpg',
  6: '/img/kitchen.jpg',
  7: '/img/sofa-room.jpg',
  8: '/img/chairs.jpg',
  9: '/img/interior.jpg',
  10: '/img/office.jpg',
  11: '/img/chairs.jpg',
  12: '/img/kitchen.jpg',
  13: '/img/sofa-room.jpg',
  14: '/img/exterior.jpg',
  15: '/img/interior.jpg',
  16: '/img/office.jpg',
  17: '/img/hero-room.jpg',
  18: '/img/kitchen.jpg',
  19: '/img/sofa-room.jpg',
  20: '/img/exterior.jpg',
}

const photoFor = (productId: number) => PRODUCT_PHOTOS[productId] ?? '/img/interior.jpg'

const PROJECT_PHOTOS: Record<number, string> = {
  1: '/img/interior.jpg',
  2: '/img/chairs.jpg',
  3: '/img/office.jpg',
  4: '/img/hero-room.jpg',
  5: '/img/chairs.jpg',
  6: '/img/kitchen.jpg',
}

const projectPhoto = (projectId: number) => PROJECT_PHOTOS[projectId] ?? '/img/interior.jpg'

const PLATE_PHOTO = '/img/roubo-chevalet.png'

/* The build estimate: the workshop's own base prices and lead times, scaled by
   timber, size and finish. It is a starting figure, not a quotation. */
type PieceKind = 'Dining table' | 'Bed frame' | 'Cabinet run' | 'Desk'

type Timber = 'Narra' | 'Acacia' | 'Mahogany'

const TIMBERS: Record<Timber, { factor: number; extraWeeks: number }> = {
  Narra: { factor: 1.28, extraWeeks: 1 },
  Acacia: { factor: 1, extraWeeks: 0 },
  Mahogany: { factor: 1.14, extraWeeks: 0 },
}

const KINDS: Record<PieceKind, { base: number; weeks: [number, number]; sizes: { label: string; factor: number; dims: string }[] }> = {
  'Dining table': {
    base: 18500,
    weeks: [4, 6],
    sizes: [
      { label: '4 seats', factor: 0.88, dims: '140 × 80 cm' },
      { label: '6 seats', factor: 1, dims: '180 × 90 cm' },
      { label: '8 seats', factor: 1.24, dims: '220 × 100 cm' },
    ],
  },
  'Bed frame': {
    base: 26800,
    weeks: [6, 8],
    sizes: [
      { label: 'Single', factor: 0.82, dims: '190 × 90 cm' },
      { label: 'Double', factor: 1, dims: '190 × 137 cm' },
      { label: 'Queen', factor: 1.18, dims: '200 × 160 cm' },
    ],
  },
  'Cabinet run': {
    base: 28600,
    weeks: [5, 7],
    sizes: [
      { label: 'Two doors', factor: 0.84, dims: '120 × 60 × 220 cm' },
      { label: 'Three doors', factor: 1, dims: '180 × 60 × 220 cm' },
      { label: 'Four doors', factor: 1.22, dims: '240 × 60 × 220 cm' },
    ],
  },
  Desk: {
    base: 19800,
    weeks: [4, 5],
    sizes: [
      { label: '1.2 m', factor: 0.9, dims: '120 × 60 cm' },
      { label: '1.5 m', factor: 1, dims: '150 × 70 cm' },
      { label: '1.8 m', factor: 1.15, dims: '180 × 75 cm' },
    ],
  },
}

const FINISHES = [
  { label: 'Natural, matte', factor: 1 },
  { label: 'Hand-rubbed oil', factor: 1.08 },
  { label: 'Lacquered', factor: 1.14 },
]

function buildEstimate(kind: PieceKind, timber: Timber, sizeIndex: number, finishIndex: number) {
  const config = KINDS[kind]
  const size = config.sizes[sizeIndex] ?? config.sizes[0]
  const finish = FINISHES[finishIndex] ?? FINISHES[0]
  const price = Math.round((config.base * TIMBERS[timber].factor * size.factor * finish.factor) / 100) * 100
  const lowWeeks = config.weeks[0] + TIMBERS[timber].extraWeeks
  const highWeeks = config.weeks[1] + TIMBERS[timber].extraWeeks
  return { price, weeks: `${lowWeeks}–${highWeeks} weeks`, dims: size.dims, finish: finish.label }
}

const TOWNS = ['Angeles', 'San Fernando', 'Mabalacat', 'Clark', 'Porac', 'Bacolor', 'Mexico', 'Guagua']

/* Row heights for the uneven work wall, cycled so no two neighbours match. */
const WORK_HEIGHTS = [260, 360, 220, 300]

function App() {
  const [activeView, setActiveView] = useState<'site' | 'admin'>('site')
  const [demoState, setDemoState] = useState(() => getDemoState())
  const [customerSubView, setCustomerSubView] = useState<'home' | 'catalog' | 'product' | 'cart' | 'checkout' | 'order-confirmation' | 'quote' | 'account'>('home')
  const [selectedProductId, setSelectedProductId] = useState<number>(1)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [savedProducts, setSavedProducts] = useState<number[]>([])
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(getInitialChatMessages)
  const [chatInput, setChatInput] = useState('')
  const [chatStatus, setChatStatus] = useState<ChatStatus>('idle')
  const [unreadCount, setUnreadCount] = useState(0)
  const [chatProduct, setChatProduct] = useState<Product | null>(null)
  const chatBodyRef = useRef<HTMLDivElement | null>(null)
  const chatSendingRef = useRef(false)
  const chatOpenRef = useRef(false)
  const [cartMessage, setCartMessage] = useState('')
  const [checkoutForm, setCheckoutForm] = useState(defaultCheckoutForm)
  const [quoteForm, setQuoteForm] = useState(defaultQuoteForm)
  const [appointmentForm, setAppointmentForm] = useState(defaultAppointmentForm)
  const [quoteSubmitted, setQuoteSubmitted] = useState(false)
  const [appointmentSubmitted, setAppointmentSubmitted] = useState(false)
  const [orderConfirmation, setOrderConfirmation] = useState<Order | null>(null)
  const [quoteSuccess, setQuoteSuccess] = useState<QuoteSuccess | null>(null)
  const [accountTab, setAccountTab] = useState<CustomerTab>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [materialFilter, setMaterialFilter] = useState('all')
  const [priceFilter, setPriceFilter] = useState('all')
  const [availabilityFilter, setAvailabilityFilter] = useState('all')
  const [sortFilter, setSortFilter] = useState('featured')
  const [cartOpen, setCartOpen] = useState(false)

  /* The build estimate on the home page. */
  const [buildKind, setBuildKind] = useState<PieceKind>('Dining table')
  const [buildTimber, setBuildTimber] = useState<Timber>('Narra')
  const [buildSize, setBuildSize] = useState(1)
  const [buildFinish, setBuildFinish] = useState(0)
  const [visitForm, setVisitForm] = useState({ name: '', contact: '' })
  const [visitSent, setVisitSent] = useState(false)

  const estimate = useMemo(
    () => buildEstimate(buildKind, buildTimber, buildSize, buildFinish),
    [buildKind, buildTimber, buildSize, buildFinish],
  )

  const buildSizes = KINDS[buildKind].sizes

  const handleBuildKind = (kind: PieceKind) => {
    setBuildKind(kind)
    setBuildSize(1)
  }

  const handleBuildToQuote = () => {
    const size = buildSizes[buildSize] ?? buildSizes[0]
    setQuoteSubmitted(false)
    setQuoteForm((prev) => ({
      ...prev,
      productName: `${buildKind} in ${buildTimber.toLowerCase()}`,
      preferredSize: size.dims,
      material: buildTimber === 'Narra' ? 'Solid Narra' : buildTimber,
      finish: estimate.finish,
      requirements: `Built from the estimate on the site: ${buildKind}, ${buildTimber}, ${size.label}, ${estimate.finish}.`,
    }))
    setSelectedProductId(1)
    setCustomerSubView('quote')
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  const handleVisitRequest = (event: FormEvent) => {
    event.preventDefault()
    if (!visitForm.name.trim()) return
    setVisitSent(true)
    setDemoState((current) =>
      addAppointmentRequest(current, {
        name: visitForm.name,
        phone: visitForm.contact,
        email: visitForm.contact.includes('@') ? visitForm.contact : '',
        date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        time: '10:30 AM',
        purpose: 'Product Viewing',
      }),
    )
  }

  useEffect(() => {
    persistDemoState(demoState)
  }, [demoState])

  /* Entrances. This class is added by script, so with no script nothing hides. */
  useEffect(() => {
    const root = document.documentElement
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    root.classList.add('motion-armed')
    const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in')
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
    )

    targets.forEach((target) => {
      if (target.getBoundingClientRect().top < window.innerHeight * 0.92) {
        target.classList.add('is-in')
      } else {
        observer.observe(target)
      }
    })

    return () => observer.disconnect()
  }, [customerSubView, activeView])

  useEffect(() => {
    const shouldLockScroll = mobileMenuOpen || cartOpen || chatOpen
    document.body.style.overflow = shouldLockScroll ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen, cartOpen, chatOpen])

  useEffect(() => {
    chatOpenRef.current = chatOpen
  }, [chatOpen])

  useEffect(() => {
    try {
      sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatMessages))
    } catch (error) {
      console.warn('[chat] Could not save conversation to this session.', error)
    }
  }, [chatMessages])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false)
        setCartOpen(false)
        setChatOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (!chatOpen || !chatBodyRef.current) return
    chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight
  }, [chatMessages, chatStatus, chatOpen])

  useEffect(() => {
    if (!cartMessage) return
    const timer = window.setTimeout(() => setCartMessage(''), 2000)
    return () => window.clearTimeout(timer)
  }, [cartMessage])

  const selectedProduct = useMemo(
    () => demoState.products.find((product) => product.id === selectedProductId) ?? demoState.products[0],
    [demoState.products, selectedProductId],
  )

  const customerName = quoteForm.name || 'Maria Santos'

  const displayProducts = useMemo(() => {
    let list = [...demoState.products]

    if (searchTerm.trim()) {
      list = list.filter((product) =>
        `${product.name} ${product.category} ${product.material}`.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (categoryFilter !== 'all') {
      list = list.filter((product) => product.category === categoryFilter)
    }

    if (materialFilter !== 'all') {
      list = list.filter((product) => product.material.toLowerCase().includes(materialFilter.toLowerCase()))
    }

    if (availabilityFilter !== 'all') {
      list = list.filter((product) => product.availability === availabilityFilter)
    }

    if (priceFilter !== 'all') {
      if (priceFilter === 'under-15k') {
        list = list.filter((product) => product.price < 15000)
      }
      if (priceFilter === '15k-30k') {
        list = list.filter((product) => product.price >= 15000 && product.price <= 30000)
      }
      if (priceFilter === '30k-plus') {
        list = list.filter((product) => product.price > 30000)
      }
    }

    if (sortFilter === 'price-low') list.sort((a, b) => a.price - b.price)
    if (sortFilter === 'price-high') list.sort((a, b) => b.price - a.price)
    if (sortFilter === 'newest') list.sort((a, b) => b.id - a.id)

    return list
  }, [availabilityFilter, categoryFilter, demoState.products, materialFilter, priceFilter, searchTerm, sortFilter])

  const featuredProducts = useMemo(() => demoState.products.slice(0, 8), [demoState.products])
  const cartItems = useMemo(
    () =>
      cart
        .map((item) => {
          const product = demoState.products.find((entry) => entry.id === item.productId)
          if (!product) return null
          return { ...product, quantity: item.quantity }
        })
        .filter((item): item is Product & { quantity: number } => Boolean(item)),
    [cart, demoState.products],
  )

  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = cartSubtotal > 0 ? 450 : 0
  const cartTotal = cartSubtotal + deliveryFee

  const recentNotifications = demoState.notifications.slice(0, 4)

  const handleOpenProduct = (productId: number) => {
    setSelectedProductId(productId)
    setCustomerSubView('product')
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  const goToSection = (sectionId: string) => {
    setActiveView('site')
    setCustomerSubView('home')
    setMobileMenuOpen(false)
    window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 60)
  }

  const handleAddToCart = (productId: number) => {
    const product = demoState.products.find((entry) => entry.id === productId)
    if (!product) return

    setCart((current) => {
      const existing = current.find((item) => item.productId === productId)
      if (existing) {
        return current.map((item) => (item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...current, { productId, quantity: 1 }]
    })

    setCartOpen(true)
    setCartMessage(`✓ ${product.name} added to cart`)
  }

  const handleQuantityChange = (productId: number, nextQuantity: number) => {
    if (nextQuantity <= 0) {
      setCart((current) => current.filter((item) => item.productId !== productId))
      return
    }

    setCart((current) => current.map((item) => (item.productId === productId ? { ...item, quantity: nextQuantity } : item)))
  }

  const handleSaveProduct = (productId: number) => {
    setSavedProducts((current) => (current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]))
  }

  const showCustomerMessages = chatMessages.filter((message) => message.sender === 'customer')
  const showSuggestions = showCustomerMessages.length === 0 && chatStatus !== 'sending'

  const handleContactTeam = () => {
    setChatOpen(false)
    chatOpenRef.current = false
    setActiveView('site')
    setCustomerSubView('home')
    window.setTimeout(() => {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  const handleChatAction = (action: ChatAction) => {
    if (action === 'quote') {
      setChatOpen(false)
      chatOpenRef.current = false
      setQuoteSubmitted(false)
      if (chatProduct) {
        setSelectedProductId(chatProduct.id)
        setQuoteForm((prev) => ({ ...prev, productName: chatProduct.name }))
      }
      setCustomerSubView('quote')
      return
    }

    if (action === 'appointment') {
      setChatOpen(false)
      chatOpenRef.current = false
      setAppointmentSubmitted(false)
      setAccountTab('appointments')
      setCustomerSubView('account')
      return
    }

    handleContactTeam()
  }

  const sendChatMessage = async (rawMessage: string) => {
    const trimmed = rawMessage.trim()
    if (!trimmed || chatSendingRef.current) return

    chatSendingRef.current = true
    setChatStatus('sending')
    setChatInput('')

    const history = buildChatHistory(chatMessages)
    setChatMessages((prev) => [...prev, { sender: 'customer', text: trimmed }])

    try {
      const result = await sendSupportMessage({
        message: trimmed,
        history,
        product: chatProduct,
      })

      const assistantMessage = result.success
        ? { sender: 'assistant' as const, text: result.message, actions: result.actions }
        : {
            sender: 'assistant' as const,
            text: "Sorry, I'm unable to respond right now. You can try again or contact our team directly.",
            actions: ['contact', 'quote'] as ChatAction[],
          }

      setChatMessages((prev) => [...prev, assistantMessage])
      setChatStatus(result.success ? 'idle' : 'error')
      if (!chatOpenRef.current) setUnreadCount((count) => count + 1)
    } finally {
      chatSendingRef.current = false
    }
  }

  const handleSendMessage = () => {
    void sendChatMessage(chatInput)
  }

  const handleAskAboutProduct = () => {
    if (!selectedProduct) return

    setChatProduct(selectedProduct)
    handleOpenChat()
  }

  const handleOpenChat = () => {
    setChatOpen(true)
    chatOpenRef.current = true
    setUnreadCount(0)
  }

  const handleQuoteSubmit = (event: FormEvent) => {
    event.preventDefault()

    const quoteProductName = quoteForm.productName || selectedProduct.name
    const nextState = addQuoteRequest(demoState, {
      customerName,
      furnitureType: quoteProductName,
      dimensions: quoteForm.preferredSize || selectedProduct.dimensions,
      material: quoteForm.material,
      finish: quoteForm.finish,
      quantity: quoteForm.quantity,
      budget: quoteForm.budget,
      details: quoteForm.requirements,
      phone: quoteForm.phone,
      email: quoteForm.email,
      location: quoteForm.location,
    })

    setDemoState(nextState)
    setQuoteSubmitted(true)
    setQuoteSuccess({
      quoteNumber: nextState.quotations[0]?.quoteNumber ?? 'QTN-2026-00128',
      productName: quoteProductName,
      amount: Number.parseInt(quoteForm.budget.replace(/[^\d]/g, ''), 10) || 26500,
    })
    setCustomerSubView('quote')
    setQuoteForm({ ...defaultQuoteForm, productName: quoteProductName })
  }

  const handleAppointmentSubmit = (event: FormEvent) => {
    event.preventDefault()

    const nextState = addAppointmentRequest(demoState, {
      name: appointmentForm.name,
      phone: appointmentForm.phone,
      email: appointmentForm.email,
      date: appointmentForm.date,
      time: appointmentForm.time,
      purpose: appointmentForm.purpose,
    })

    setDemoState(nextState)
    setAppointmentSubmitted(true)
    setAppointmentForm(defaultAppointmentForm)
  }

  const handlePlaceOrder = (event: FormEvent) => {
    event.preventDefault()
    if (!cartItems.length) return

    const orderNumber = `ORD-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`
    const nextOrder: Order = {
      orderNumber,
      customer: checkoutForm.fullName || 'Maria Santos',
      total: cartTotal,
      status: 'For Confirmation',
      date: new Date().toISOString().slice(0, 10),
    }

    setDemoState((current) => ({
      ...current,
      orders: [nextOrder, ...current.orders],
      notifications: [
        {
          id: `ntf-${Date.now()}`,
          customerName: nextOrder.customer,
          message: `Your order ${orderNumber} has been received and is awaiting confirmation.`,
          type: 'order',
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...current.notifications,
      ],
      activities: [
        { id: `act-${Date.now()}`, message: `${nextOrder.customer} created a new order ${orderNumber}.`, timestamp: new Date().toISOString(), type: 'order' },
        ...current.activities,
      ],
    }))

    setOrderConfirmation(nextOrder)
    setCart([])
    setCartOpen(false)
    setCustomerSubView('order-confirmation')
    setCheckoutForm(defaultCheckoutForm)
  }

  const handleAcceptQuote = (quote: QuotationRequest) => {
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`
    const acceptedOrder: Order = {
      orderNumber,
      customer: quote.customer,
      total: quote.amount,
      status: 'For Confirmation',
      date: new Date().toISOString().slice(0, 10),
    }

    setDemoState((current) => ({
      ...current,
      orders: [acceptedOrder, ...current.orders],
      quotations: current.quotations.map((entry) => (entry.quoteNumber === quote.quoteNumber ? { ...entry, status: 'Approved' } : entry)),
      notifications: [
        {
          id: `ntf-${Date.now()}`,
          customerName: quote.customer,
          message: `Your quote ${quote.quoteNumber} was accepted and an order ${orderNumber} was created.`,
          type: 'quote',
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...current.notifications,
      ],
    }))

    setOrderConfirmation(acceptedOrder)
    setCustomerSubView('order-confirmation')
  }

  const handleQuoteStatusChange = (quoteNumber: string, status: QuotationRequest['status']) => {
    setDemoState((current) => updateQuoteStatus(current, quoteNumber, status))
  }

  const handleInquiryStatusChange = (inquiryId: string, status: InquiryThread['status']) => {
    setDemoState((current) => updateInquiryStatus(current, inquiryId, status))
  }

  const handleAppointmentStatusChange = (appointmentId: string, status: Appointment['status']) => {
    setDemoState((current) => updateAppointmentStatus(current, appointmentId, status))
  }

  const handleOrderStatusChange = (orderNumber: string, status: Order['status']) => {
    setDemoState((current) => updateOrderStatus(current, orderNumber, status))
  }

  const accountOrders = demoState.orders.filter((entry) => entry.customer === customerName)
  const accountQuotes = demoState.quotations.filter((entry) => entry.customer === customerName)
  const accountAppointments = demoState.appointments.filter((entry) => entry.customer === customerName)
  const savedItems = demoState.products.filter((product) => savedProducts.includes(product.id))

  return (
    <div className="app-shell">
      {activeView === 'site' && (
        <>
      <header className="topbar">
        <div className="brand-wrap">
          <span className="brand-mark" aria-hidden="true">CF</span>
          <div>
            <div className="brand-name">Craft & Form</div>
            <div className="brand-subtitle">Pampanga Furniture Co.</div>
          </div>
        </div>

        <nav className="nav" aria-label="Main navigation">
          <button type="button" className="nav-link" onClick={() => { setCustomerSubView('catalog'); setActiveView('site'); setMobileMenuOpen(false) }}>Collection</button>
          <button type="button" className="nav-link" onClick={() => goToSection('build')}>Custom</button>
          <button type="button" className="nav-link" onClick={() => goToSection('work')}>Work</button>
          <button type="button" className="nav-link" onClick={() => goToSection('contact')}>Visit</button>
          <button type="button" className="nav-link" onClick={() => { setCartOpen(true); setCustomerSubView('cart') }}>
            Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
          </button>
        </nav>

        <div className="nav-actions desktop-actions">
          <button type="button" className="primary-btn" onClick={() => { setQuoteSubmitted(false); setCustomerSubView('quote'); setActiveView('site') }}>Start a quote</button>
        </div>

        <div className="mobile-header-actions">
          <button type="button" className="nav-link cart-pill" onClick={() => { setCartOpen(true); setCustomerSubView('cart') }}>
            Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
          </button>
          <button
            type="button"
            className={`mobile-menu-button ${mobileMenuOpen ? 'is-open' : ''}`}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((current) => !current)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <>
          <button type="button" className="mobile-menu-backdrop" aria-label="Close menu" onClick={() => setMobileMenuOpen(false)} />
          <aside className="mobile-menu-panel" role="dialog" aria-modal="true" aria-label="Mobile navigation">
            <div className="mobile-menu-header">
              <div className="brand-wrap">
                <span className="brand-mark" aria-hidden="true">CF</span>
                <div>
                  <div className="brand-name">Craft & Form</div>
                  <div className="brand-subtitle">Pampanga Furniture Co.</div>
                </div>
              </div>
              <button type="button" className="close-menu" aria-label="Close menu" onClick={() => setMobileMenuOpen(false)}>×</button>
            </div>

            <nav className="mobile-menu-nav" aria-label="Mobile navigation links">
              <button type="button" className="mobile-menu-link" onClick={() => { setCustomerSubView('catalog'); setActiveView('site'); setMobileMenuOpen(false) }}>Collection</button>
              <button type="button" className="mobile-menu-link" onClick={() => goToSection('build')}>Custom</button>
              <button type="button" className="mobile-menu-link" onClick={() => goToSection('work')}>Work</button>
              <button type="button" className="mobile-menu-link" onClick={() => goToSection('contact')}>Visit</button>
              <button type="button" className="mobile-menu-link" onClick={() => { setCustomerSubView('account'); setActiveView('site'); setMobileMenuOpen(false) }}>Account</button>
              <button type="button" className="mobile-menu-link" onClick={() => { setQuoteSubmitted(false); setCustomerSubView('quote'); setActiveView('site'); setMobileMenuOpen(false) }}>Start a quote</button>
            </nav>
          </aside>
        </>
      )}

        </>
      )}

      {activeView === 'site' ? (
        <main className="site-view">
          {customerSubView === 'home' && (
            <>
              <section className="hero" id="home" aria-labelledby="hero-title">
                <div className="hero-grid">
                  <div className="hero-copy">
                    <h1 id="hero-title">Furniture built to your measure</h1>
                    <p className="hero-lede">
                      Narra, acacia and mahogany, cut and joined on N. M. Hizon Street in Angeles City. Every piece is drawn
                      to your room and delivered in four to six weeks.
                    </p>
                    <div className="hero-actions">
                      <button
                        type="button"
                        className="primary-btn"
                        onClick={() => {
                          setCategoryFilter('all')
                          setCustomerSubView('catalog')
                          window.scrollTo({ top: 0, behavior: 'auto' })
                        }}
                      >
                        Shop the collection
                      </button>
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => {
                          setQuoteSubmitted(false)
                          setCustomerSubView('quote')
                          window.scrollTo({ top: 0, behavior: 'auto' })
                        }}
                      >
                        Start a quote
                      </button>
                    </div>
                    <div className="hero-facts">
                      <div>
                        <strong>1,200 homes</strong>
                        <span>furnished since 2019</span>
                      </div>
                      <div>
                        <strong>4–6 weeks</strong>
                        <span>measurement to delivery</span>
                      </div>
                      <div>
                        <strong>4.9 of 5</strong>
                        <span>from Google reviews</span>
                      </div>
                    </div>
                  </div>
                  <div className="hero-stage">
                    <div className="hero-disc" aria-hidden="true" />
                    <figure className="hero-figure">
                      <img
                        className="hero-photo"
                        src="/img/narra-grain.jpg"
                        width="1600"
                        height="1200"
                        alt="A planed hardwood surface, hand-finished and oiled"
                      />
                      <img
                        className="hero-piece"
                        src="/img/kitchen.jpg"
                        width="1600"
                        height="1067"
                        alt="A built-in kitchen run in plywood and laminate"
                      />
                      <figcaption className="hero-caption">
                        <span>Hand-finished narra, and a built-in run in plywood and laminate.</span>
                        <button type="button" className="ghost-btn" onClick={() => goToSection('process')}>
                          See how a piece is made
                        </button>
                      </figcaption>
                    </figure>
                  </div>
                </div>
                <p className="hero-tag">Showroom open Monday to Saturday, 9–6. Delivery across Pampanga.</p>
              </section>

              <section className="chapter chapter--bone" id="collection" aria-labelledby="rooms-title">
                <div className="chapter-inner">
                  <div className="chapter-head">
                    <h2 id="rooms-title">What we build, and what it starts at</h2>
                    <p className="chapter-note">
                      Seven kinds of piece. The price is a finished piece at its smallest size; anything larger, or built to
                      your wall, is quoted.
                    </p>
                  </div>
                  <div className="rooms">
                    {categories.map((category) => {
                      const items = demoState.products.filter((product) => product.category === category.name)
                      const from = items.length ? Math.min(...items.map((product) => product.price)) : 0
                      return (
                        <button
                          key={category.name}
                          type="button"
                          className="room-row"
                          data-reveal
                          onClick={() => {
                            setCategoryFilter(category.name)
                            setCustomerSubView('catalog')
                            window.scrollTo({ top: 0, behavior: 'auto' })
                          }}
                        >
                          <span className="room-name">{category.name}</span>
                          <span className="room-meta">
                            {items.length
                              ? `From ${formatCurrency(from)} · ${items.length} ${items.length === 1 ? 'piece' : 'pieces'}`
                              : 'By quotation'}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </section>

              <section className="chapter chapter--narra" id="pieces" aria-labelledby="pieces-title">
                <div className="chapter-inner">
                  <div className="chapter-head">
                    <h2 id="pieces-title">Pieces off the workshop floor</h2>
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => {
                        setCategoryFilter('all')
                        setCustomerSubView('catalog')
                        window.scrollTo({ top: 0, behavior: 'auto' })
                      }}
                    >
                      See all twenty
                    </button>
                  </div>
                  <div className="pieces-wall">
                    {featuredProducts.slice(0, 6).map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        className="piece"
                        data-reveal
                        onClick={() => handleOpenProduct(product.id)}
                      >
                        <img
                          src={photoFor(product.id)}
                          width="1600"
                          height="1067"
                          loading="lazy"
                          alt={product.name}
                        />
                        <span className="piece-cap">
                          <span className="piece-name">{product.name}</span>
                          <span className="piece-facts">
                            {formatCurrency(product.price)}
                            <br />
                            {product.leadTime}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="chapter-foot">
                    Pieces marked in stock go straight to the cart and travel in three to five days. Everything else is made
                    to order: it starts with a quote and a free measure in the room.
                  </p>
                </div>
              </section>

              <section className="chapter chapter--white" id="build" aria-labelledby="build-title">
                <div className="chapter-inner">
                  <div className="chapter-head">
                    <h2 id="build-title">Build a piece, see the price</h2>
                    <p className="chapter-note">
                      The same numbers the workshop uses: a base price, then timber, size and finish. A quote fixes it once we
                      have measured.
                    </p>
                  </div>
                  <div className="build">
                    <div className="build-controls">
                      <fieldset className="build-group" data-reveal>
                        <legend>What are we building</legend>
                        <div className="chip-row">
                          {(Object.keys(KINDS) as PieceKind[]).map((kind) => (
                            <button
                              key={kind}
                              type="button"
                              className="chip"
                              aria-pressed={buildKind === kind}
                              onClick={() => handleBuildKind(kind)}
                            >
                              {kind}
                            </button>
                          ))}
                        </div>
                      </fieldset>
                      <fieldset className="build-group" data-reveal>
                        <legend>Timber</legend>
                        <div className="chip-row">
                          {(Object.keys(TIMBERS) as Timber[]).map((timber) => (
                            <button
                              key={timber}
                              type="button"
                              className="chip"
                              aria-pressed={buildTimber === timber}
                              onClick={() => setBuildTimber(timber)}
                            >
                              {timber}
                            </button>
                          ))}
                        </div>
                      </fieldset>
                      <fieldset className="build-group" data-reveal>
                        <legend>Size</legend>
                        <div className="chip-row">
                          {buildSizes.map((size, index) => (
                            <button
                              key={size.label}
                              type="button"
                              className="chip"
                              aria-pressed={buildSize === index}
                              onClick={() => setBuildSize(index)}
                            >
                              {size.label} · {size.dims}
                            </button>
                          ))}
                        </div>
                      </fieldset>
                      <fieldset className="build-group" data-reveal>
                        <legend>Finish</legend>
                        <div className="chip-row">
                          {FINISHES.map((finish, index) => (
                            <button
                              key={finish.label}
                              type="button"
                              className="chip"
                              aria-pressed={buildFinish === index}
                              onClick={() => setBuildFinish(index)}
                            >
                              {finish.label}
                            </button>
                          ))}
                        </div>
                      </fieldset>
                    </div>
                    <div className="build-out" data-reveal aria-live="polite">
                      <p className="build-docket">
                        QTN-{new Date().getFullYear()}-00151 · {buildTimber} · {estimate.dims} · {estimate.finish}
                      </p>
                      <p className="build-price">{formatCurrency(estimate.price)}</p>
                      <p className="build-weeks">Built in {estimate.weeks}</p>
                      <p className="build-note">
                        Estimate only. We measure the room first, then send a fixed quotation within one business day.
                      </p>
                      <div className="build-actions">
                        <button type="button" className="primary-btn" onClick={handleBuildToQuote}>
                          Take it to a quote
                        </button>
                        <button
                          type="button"
                          className="secondary-btn"
                          onClick={() => {
                            setCustomerSubView('catalog')
                            window.scrollTo({ top: 0, behavior: 'auto' })
                          }}
                        >
                          See similar pieces
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="chapter chapter--mahogany" id="floor" aria-labelledby="floor-title">
                <div className="chapter-inner">
                  <div className="mosaic" data-reveal>
                    <img
                      className="mosaic-img"
                      src="/img/interior.jpg"
                      width="1600"
                      height="1067"
                      loading="lazy"
                      alt="A living and dining room furnished with wood pieces"
                    />
                    <div className="tile tile--head">
                      <h2 id="floor-title">One floor, twenty pieces</h2>
                      <span className="piece-facts">Angeles City</span>
                    </div>
                    <div className="tile tile--f1">
                      <p className="tile-fact">
                        4–6 weeks<small>from measurement to delivery</small>
                      </p>
                    </div>
                    <div className="tile tile--f2">
                      <p className="tile-fact">
                        ₱450<small>delivery anywhere in Pampanga</small>
                      </p>
                    </div>
                    <div className="tile tile--f3">
                      <p className="tile-fact">
                        1 business day<small>to answer a quote</small>
                      </p>
                    </div>
                    <div className="tile tile--act">
                      <button
                        type="button"
                        className="small-btn"
                        onClick={() => {
                          setCategoryFilter('all')
                          setCustomerSubView('catalog')
                          window.scrollTo({ top: 0, behavior: 'auto' })
                        }}
                      >
                        See the pieces
                      </button>
                    </div>
                  </div>
                  <p className="mosaic-caption">
                    Every piece leaves the floor finished, photographed and entered in a docket before it travels.
                  </p>
                </div>
              </section>

              <section className="chapter chapter--acacia" id="process" aria-labelledby="process-title">
                <div className="chapter-inner">
                  <div className="chapter-head">
                    <h2 id="process-title">From a measurement to a room</h2>
                    <p className="chapter-note">
                      Three steps and one docket number. You can follow the piece through each of them from your account.
                    </p>
                  </div>
                  <div className="docket">
                    <article className="stage" data-reveal>
                      <div className="stage-photo">
                        <p className="stage-dims">180 × 90 × 76</p>
                      </div>
                      <h3 className="stage-name">Measured</h3>
                      <p className="stage-text">
                        We visit the room, check the door widths and the stairs, and take the sizes the piece has to fit.
                      </p>
                      <p className="stage-weeks">Free inside Pampanga</p>
                    </article>
                    <article className="stage stage--plate" data-reveal>
                      <div className="stage-photo" style={{ '--stage-h': '46vh' } as CSSProperties}>
                        <img
                          src={PLATE_PHOTO}
                          width="1920"
                          height="2802"
                          loading="lazy"
                          alt="An 1775 joinery plate showing a shaving horse and the tools that shape a board"
                        />
                      </div>
                      <h3 className="stage-name">Cut and joined</h3>
                      <p className="stage-text">
                        Narra, acacia or mahogany is sawn, jointed and hand-finished. You get a photograph of the dry fit
                        before we glue up.
                      </p>
                      <p className="stage-weeks">4–6 weeks in the workshop</p>
                    </article>
                    <article className="stage" data-reveal>
                      <div className="stage-photo" style={{ '--stage-h': '60vh' } as CSSProperties}>
                        <img
                          src="/img/sofa-room.jpg"
                          width="1600"
                          height="1067"
                          loading="lazy"
                          alt="A finished sofa and coffee table in a customer's living room"
                        />
                      </div>
                      <h3 className="stage-name">Delivered and set</h3>
                      <p className="stage-text">
                        Two of us deliver, level the piece in the room and take the packing away with us.
                      </p>
                      <p className="stage-weeks">₱450 inside Pampanga</p>
                    </article>
                  </div>
                </div>
              </section>

              <section className="chapter chapter--ink" id="work" aria-labelledby="work-title">
                <div className="chapter-inner">
                  <div className="chapter-head">
                    <h2 id="work-title">Work around Pampanga</h2>
                    <p className="chapter-note">Houses, cafés and offices within an hour of the workshop.</p>
                  </div>
                  <div className="work-wall">
                    {projects.map((project, index) => (
                      <figure
                        key={project.id}
                        className="work-item"
                        data-reveal
                        style={{ '--work-h': `${WORK_HEIGHTS[index % WORK_HEIGHTS.length]}px` } as CSSProperties}
                      >
                        <div className="work-frame">
                          <img
                            src={projectPhoto(project.id)}
                            width="1600"
                            height="1067"
                            loading="lazy"
                            alt={`${project.name}, ${project.location}`}
                          />
                        </div>
                        <figcaption className="work-cap">
                          <span>{project.name}</span>
                          <span>{project.location.replace(', Pampanga', '')}</span>
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </div>
              </section>

              <section className="chapter chapter--steel" id="towns" aria-labelledby="towns-title">
                <div className="chapter-inner">
                  <div className="chapter-head">
                    <h2 id="towns-title">We deliver across Pampanga</h2>
                    <p className="chapter-note">
                      Eight towns within an hour of the workshop. Delivery is ₱450 inside the province; outside it we quote
                      per truck.
                    </p>
                  </div>
                </div>
                <div className="towns">
                  <p className="towns-run">
                    {TOWNS.map((town) => (
                      <span key={town}>{town}</span>
                    ))}
                  </p>
                </div>
              </section>

              <section className="chapter chapter--ink" id="contact" aria-labelledby="visit-title">
                <div className="chapter-inner">
                  <div className="visit-strip" aria-hidden="true">
                    {['/img/hero-room.jpg', '/img/interior.jpg', '/img/sofa-room.jpg', '/img/office.jpg', '/img/kitchen.jpg', '/img/chairs.jpg', '/img/hero-room.jpg', '/img/interior.jpg'].map(
                      (src, index) => (
                        <img key={`${src}-${index}`} src={src} width="1600" height="1067" loading="lazy" alt="" />
                      ),
                    )}
                  </div>
                  <div className="chapter-head">
                    <h2 id="visit-title">Visit the workshop</h2>
                    <p className="chapter-note">
                      42 N. M. Hizon Street, Angeles City. Two blocks from the capitol, parking at the back.
                    </p>
                  </div>
                  <div className="visit-grid">
                    <div className="visit-block">
                      <div className="visit-lines">
                        <a href="tel:+639171234567">+63 917 123 4567</a>
                        <a href="mailto:hello@craftandform.ph">hello@craftandform.ph</a>
                        <span>42 N. M. Hizon St., Angeles City, Pampanga</span>
                      </div>
                      <div className="visit-hours">
                        <span>Monday to Saturday, 9:00 AM – 6:00 PM</span>
                        <span>Closed Sunday and public holidays</span>
                      </div>
                    </div>
                    <div>
                      {visitSent ? (
                        <div className="confirmation-card">
                          <h3>A time in the diary</h3>
                          <p>
                            Thanks, {visitForm.name.split(' ')[0] || 'there'}. We will text {visitForm.contact || 'you'} to
                            confirm a showroom visit tomorrow morning. The request is already on the workshop list.
                          </p>
                          <button
                            type="button"
                            className="secondary-btn"
                            onClick={() => {
                              setVisitSent(false)
                              setVisitForm({ name: '', contact: '' })
                            }}
                          >
                            Request another time
                          </button>
                        </div>
                      ) : (
                        <form className="visit-form" onSubmit={handleVisitRequest}>
                          <label className="sr-only" htmlFor="visit-name">
                            Your name
                          </label>
                          <input
                            id="visit-name"
                            className="visit-cell"
                            placeholder="Your name"
                            autoComplete="name"
                            value={visitForm.name}
                            onChange={(event) => setVisitForm((prev) => ({ ...prev, name: event.target.value }))}
                            required
                          />
                          <label className="sr-only" htmlFor="visit-contact">
                            Phone or email
                          </label>
                          <input
                            id="visit-contact"
                            className="visit-cell"
                            placeholder="Phone or email"
                            autoComplete="tel"
                            value={visitForm.contact}
                            onChange={(event) => setVisitForm((prev) => ({ ...prev, contact: event.target.value }))}
                          />
                          <button type="submit" className="visit-cell">
                            Request a visit
                          </button>
                        </form>
                      )}
                      <p className="visit-small">
                        We confirm showroom visits by text the same day. A custom piece starts with a free measure in the room.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}


          {customerSubView === 'catalog' && (
            <section className="catalog-large catalog-pane">
              <div className="section-heading row-between">
                <div>
                  <h1>Explore our collections.</h1>
                </div>
                <button type="button" className="secondary-btn" onClick={() => setCustomerSubView('home')}>Back Home</button>
              </div>

              <div className="catalog-toolbar">
                <input type="text" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search furniture" />
                <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                  <option value="all">All Categories</option>
                  {categories.map((category) => <option key={category.name} value={category.name}>{category.name}</option>)}
                </select>
                <select value={materialFilter} onChange={(event) => setMaterialFilter(event.target.value)}>
                  <option value="all">Material</option>
                  <option value="narra">Narra</option>
                  <option value="acacia">Acacia</option>
                  <option value="mahogany">Mahogany</option>
                  <option value="wood">Wood</option>
                </select>
                <select value={priceFilter} onChange={(event) => setPriceFilter(event.target.value)}>
                  <option value="all">All Prices</option>
                  <option value="under-15k">Under ₱15k</option>
                  <option value="15k-30k">₱15k - ₱30k</option>
                  <option value="30k-plus">₱30k+</option>
                </select>
                <select value={availabilityFilter} onChange={(event) => setAvailabilityFilter(event.target.value)}>
                  <option value="all">Availability</option>
                  <option value="In Stock">In Stock</option>
                  <option value="Made to Order">Made to Order</option>
                  <option value="Custom">Custom</option>
                  <option value="Limited">Limited</option>
                </select>
                <select value={sortFilter} onChange={(event) => setSortFilter(event.target.value)}>
                  <option value="featured">Featured</option>
                  <option value="price-low">Price Low to High</option>
                  <option value="price-high">Price High to Low</option>
                  <option value="newest">Newest</option>
                </select>
              </div>

              <div className="catalog-summary">{displayProducts.length} products found</div>

              <div className="product-grid large-grid">
                {displayProducts.map((product) => (
                  <article key={product.id} className="product-card premium-card">
                    <img src={photoFor(product.id)} alt={product.name} />
                    <div className="product-info">
                      <div className="product-row">
                        <span className="product-tag">{product.category}</span>
                        <span className="availability">{product.availability}</span>
                      </div>
                      <h3>{product.name}</h3>
                      <div className="meta-line"><span>{product.material}</span><span>{product.dimensions}</span></div>
                      <div className="product-row price-row">
                        <strong>{formatCurrency(product.price)}</strong>
                        <button type="button" className="small-btn" onClick={() => handleOpenProduct(product.id)}>View</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {customerSubView === 'product' && selectedProduct && (
            <section className="product-detail-pane">
              <div className="detail-panel detail-page">
                <div className="detail-image-wrap">
                  <img src={photoFor(selectedProduct.id)} alt={selectedProduct.name} />
                  <div className="thumb-strip">
                    <img src={photoFor(selectedProduct.id)} alt="Gallery 1" />
                    <img src={photoFor(selectedProduct.id)} alt="Gallery 2" />
                    <img src={photoFor(selectedProduct.id)} alt="Gallery 3" />
                  </div>
                </div>
                <div className="detail-copy">
                  <h1>{selectedProduct.name}</h1>
                  <div className="detail-price-row">
                    <strong>{formatCurrency(selectedProduct.price)}</strong>
                    <span>Estimated lead time: {selectedProduct.leadTime}</span>
                  </div>
                  <p>{selectedProduct.description}</p>
                  <div className="spec-grid">
                    <div><span>Material</span><strong>{selectedProduct.material}</strong></div>
                    <div><span>Dimensions</span><strong>{selectedProduct.dimensions}</strong></div>
                    <div><span>Availability</span><strong>{selectedProduct.availability}</strong></div>
                    <div><span>Production</span><strong>{selectedProduct.leadTime}</strong></div>
                    <div><span>Delivery</span><strong>Within Pampanga</strong></div>
                    <div><span>Warranty</span><strong>1-year craftsmanship warranty</strong></div>
                  </div>

                  <div className="detail-actions">
                    <button type="button" className="primary-btn" onClick={() => handleAddToCart(selectedProduct.id)}>Add to Cart</button>
                    <button type="button" className="secondary-btn" onClick={() => setCustomerSubView('quote')}>Request a Quote</button>
                    <button type="button" className="ghost-btn" onClick={handleAskAboutProduct}>Ask About This Product</button>
                    <button type="button" className="secondary-btn" onClick={() => handleSaveProduct(selectedProduct.id)}>{savedProducts.includes(selectedProduct.id) ? 'Saved' : 'Save Product'}</button>
                    <button type="button" className="ghost-btn" onClick={() => { setSelectedProductId(selectedProduct.id); setAppointmentSubmitted(false); setCustomerSubView('account') }}>Book a Consultation</button>
                  </div>

                  {cartMessage && <div className="cart-status">{cartMessage}</div>}
                </div>
              </div>

              <div className="review-box">
                <div className="section-heading">
                  <h2>What clients say</h2>
                </div>
                <div className="review-list">
                  {demoState.reviews.slice(0, 3).map((review, index) => (
                    <div key={`${review.customer}-${index}`} className="review-item">
                      <div className="stars">{'★'.repeat(review.rating)}</div>
                      <p>“{review.quote}”</p>
                      <strong>{review.customer}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {customerSubView === 'cart' && (
            <section className="cart-pane">
              <div className="section-heading row-between">
                <div>
                  <h1>Ready for checkout</h1>
                </div>
                <button type="button" className="secondary-btn" onClick={() => setCustomerSubView('catalog')}>Continue Shopping</button>
              </div>

              {cartItems.length ? (
                <div className="cart-layout">
                  <div className="cart-list">
                    {cartItems.map((item) => (
                      <div key={item.id} className="cart-item">
                        <img src={photoFor(item.id)} alt={item.name} />
                        <div className="cart-details">
                          <h3>{item.name}</h3>
                          <p>{formatCurrency(item.price)} × {item.quantity}</p>
                          <div className="qty-controls">
                            <button type="button" onClick={() => handleQuantityChange(item.id, item.quantity - 1)}>-</button>
                            <span>{item.quantity}</span>
                            <button type="button" onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>+</button>
                          </div>
                        </div>
                        <div className="cart-total">
                          <strong>{formatCurrency(item.price * item.quantity)}</strong>
                          <button type="button" className="ghost-btn" onClick={() => handleQuantityChange(item.id, 0)}>Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <aside className="checkout-summary">
                    <h3>Order Summary</h3>
                    <div className="summary-row"><span>Subtotal</span><strong>{formatCurrency(cartSubtotal)}</strong></div>
                    <div className="summary-row"><span>Estimated Delivery</span><strong>{formatCurrency(deliveryFee)}</strong></div>
                    <div className="summary-row total-row"><span>Total</span><strong>{formatCurrency(cartTotal)}</strong></div>
                    <button type="button" className="primary-btn" onClick={() => setCustomerSubView('checkout')}>Proceed to Checkout</button>
                    <button type="button" className="secondary-btn" onClick={() => setCustomerSubView('catalog')}>Continue Shopping</button>
                  </aside>
                </div>
              ) : (
                <div className="empty-state">Your cart is empty. Start by browsing our catalog.</div>
              )}
            </section>
          )}

          {customerSubView === 'checkout' && (
            <section className="checkout-pane">
              <div className="section-heading row-between">
                <div>
                  <h1>Complete your order</h1>
                </div>
                <button type="button" className="secondary-btn" onClick={() => setCustomerSubView('cart')}>Back</button>
              </div>

              <div className="checkout-layout">
                <form className="checkout-form" onSubmit={handlePlaceOrder}>
                  <div className="form-grid two-col">
                    <label>
                      Full Name
                      <input value={checkoutForm.fullName} onChange={(event) => setCheckoutForm((prev) => ({ ...prev, fullName: event.target.value }))} />
                    </label>
                    <label>
                      Phone Number
                      <input value={checkoutForm.phone} onChange={(event) => setCheckoutForm((prev) => ({ ...prev, phone: event.target.value }))} />
                    </label>
                    <label>
                      Email
                      <input type="email" value={checkoutForm.email} onChange={(event) => setCheckoutForm((prev) => ({ ...prev, email: event.target.value }))} />
                    </label>
                    <label>
                      Address
                      <input value={checkoutForm.address} onChange={(event) => setCheckoutForm((prev) => ({ ...prev, address: event.target.value }))} />
                    </label>
                    <label>
                      Barangay
                      <input value={checkoutForm.barangay} onChange={(event) => setCheckoutForm((prev) => ({ ...prev, barangay: event.target.value }))} />
                    </label>
                    <label>
                      City / Municipality
                      <input value={checkoutForm.city} onChange={(event) => setCheckoutForm((prev) => ({ ...prev, city: event.target.value }))} />
                    </label>
                    <label>
                      Province
                      <input value={checkoutForm.province} onChange={(event) => setCheckoutForm((prev) => ({ ...prev, province: event.target.value }))} />
                    </label>
                    <label>
                      Postal Code
                      <input value={checkoutForm.postalCode} onChange={(event) => setCheckoutForm((prev) => ({ ...prev, postalCode: event.target.value }))} />
                    </label>
                    <label className="full-span">
                      Delivery Method
                      <select value={checkoutForm.deliveryMethod} onChange={(event) => setCheckoutForm((prev) => ({ ...prev, deliveryMethod: event.target.value }))}>
                        <option>Delivery</option>
                        <option>Showroom Pickup</option>
                      </select>
                    </label>
                    <label className="full-span">
                      Customer Notes
                      <textarea rows={3} value={checkoutForm.notes} onChange={(event) => setCheckoutForm((prev) => ({ ...prev, notes: event.target.value }))} />
                    </label>
                  </div>

                  <div className="checkout-actions">
                    <button type="button" className="secondary-btn" onClick={() => setCustomerSubView('cart')}>Back</button>
                    <button type="submit" className="primary-btn">Place Order</button>
                  </div>
                </form>

                <aside className="checkout-summary">
                  <h3>Order Summary</h3>
                  <div className="summary-list">
                    {cartItems.map((item) => (
                      <div key={item.id} className="summary-row">
                        <span>{item.name} × {item.quantity}</span>
                        <strong>{formatCurrency(item.price * item.quantity)}</strong>
                      </div>
                    ))}
                  </div>
                  <div className="summary-row"><span>Subtotal</span><strong>{formatCurrency(cartSubtotal)}</strong></div>
                  <div className="summary-row"><span>Delivery Fee</span><strong>{formatCurrency(deliveryFee)}</strong></div>
                  <div className="summary-row total-row"><span>Total</span><strong>{formatCurrency(cartTotal)}</strong></div>
                  <div className="payment-note">Payment method will be confirmed by our team.</div>
                </aside>
              </div>
            </section>
          )}

          {customerSubView === 'order-confirmation' && orderConfirmation && (
            <section className="confirmation-pane">
              <div className="confirmation-card">
                <div className="success-icon">✓</div>
                <h2>Thank you, {orderConfirmation.customer.split(' ')[0]}!</h2>
                <p>Your order has been received.</p>
                <div className="confirmation-detail">
                  <div><span>Order</span><strong>{orderConfirmation.orderNumber}</strong></div>
                  <div><span>Status</span><strong>For Confirmation</strong></div>
                  <div><span>Delivery Method</span><strong>{checkoutForm.deliveryMethod || 'Delivery'}</strong></div>
                  <div><span>Total</span><strong>{formatCurrency(orderConfirmation.total)}</strong></div>
                </div>
                <div className="confirmation-actions">
                  <button type="button" className="primary-btn" onClick={() => setCustomerSubView('account')}>View My Order</button>
                  <button type="button" className="secondary-btn" onClick={() => setCustomerSubView('catalog')}>Continue Shopping</button>
                </div>
              </div>
            </section>
          )}

          {customerSubView === 'quote' && (
            <section className="quote-pane">
              <div className="section-heading row-between">
                <div>
                  <h1>Request a quote for {selectedProduct?.name ?? 'your product'}</h1>
                </div>
                <button type="button" className="secondary-btn" onClick={() => setCustomerSubView('catalog')}>Back</button>
              </div>

              {!quoteSubmitted ? (
                <form className="quote-form product-quote" onSubmit={handleQuoteSubmit}>
                  <div className="form-grid two-col">
                    <label>
                      Product
                      <input value={quoteForm.productName || selectedProduct?.name || ''} onChange={(event) => setQuoteForm((prev) => ({ ...prev, productName: event.target.value }))} />
                    </label>
                    <label>
                      Preferred Size
                      <input value={quoteForm.preferredSize} onChange={(event) => setQuoteForm((prev) => ({ ...prev, preferredSize: event.target.value }))} placeholder="180cm × 90cm × 75cm" />
                    </label>
                    <label>
                      Quantity
                      <input value={quoteForm.quantity} onChange={(event) => setQuoteForm((prev) => ({ ...prev, quantity: event.target.value }))} />
                    </label>
                    <label>
                      Material
                      <select value={quoteForm.material} onChange={(event) => setQuoteForm((prev) => ({ ...prev, material: event.target.value }))}>
                        <option>Solid Narra</option>
                        <option>Mahogany</option>
                        <option>Acacia</option>
                        <option>Plywood</option>
                        <option>MDF</option>
                      </select>
                    </label>
                    <label>
                      Finish
                      <input value={quoteForm.finish} onChange={(event) => setQuoteForm((prev) => ({ ...prev, finish: event.target.value }))} placeholder="Natural walnut, matte white..." />
                    </label>
                    <label>
                      Color
                      <input value={quoteForm.color} onChange={(event) => setQuoteForm((prev) => ({ ...prev, color: event.target.value }))} placeholder="Natural wood tone" />
                    </label>
                    <label className="full-span">
                      Additional Requirements
                      <textarea rows={4} value={quoteForm.requirements} onChange={(event) => setQuoteForm((prev) => ({ ...prev, requirements: event.target.value }))} />
                    </label>
                    <label>
                      Budget
                      <select value={quoteForm.budget} onChange={(event) => setQuoteForm((prev) => ({ ...prev, budget: event.target.value }))}>
                        <option>₱20,000 - ₱40,000</option>
                        <option>₱40,000 - ₱80,000</option>
                        <option>₱80,000 - ₱150,000</option>
                        <option>₱150,000+</option>
                      </select>
                    </label>
                    <label>
                      Reference Image
                      <input type="file" />
                    </label>
                    <label>
                      Name
                      <input value={quoteForm.name} onChange={(event) => setQuoteForm((prev) => ({ ...prev, name: event.target.value }))} />
                    </label>
                    <label>
                      Phone
                      <input value={quoteForm.phone} onChange={(event) => setQuoteForm((prev) => ({ ...prev, phone: event.target.value }))} />
                    </label>
                    <label>
                      Email
                      <input type="email" value={quoteForm.email} onChange={(event) => setQuoteForm((prev) => ({ ...prev, email: event.target.value }))} />
                    </label>
                    <label>
                      Location
                      <input value={quoteForm.location} onChange={(event) => setQuoteForm((prev) => ({ ...prev, location: event.target.value }))} />
                    </label>
                  </div>
                  <button type="submit" className="primary-btn">Request Quote</button>
                </form>
              ) : (
                <div className="success-box quote-success">
                  <div className="success-icon">✓</div>
                  <h3>Your quotation request has been submitted.</h3>
                  <div className="quote-ref">Quotation Number: {quoteSuccess?.quoteNumber ?? 'QTN-2026-00128'}</div>
                  <div className="quote-ref">Status: Under Review</div>
                  <div className="quote-ref">Expected Response: Within 1 business day</div>
                  <div className="confirmation-actions">
                    <button type="button" className="primary-btn" onClick={() => setCustomerSubView('account')}>View My Quote</button>
                    <button type="button" className="secondary-btn" onClick={() => setCustomerSubView('catalog')}>Continue Browsing</button>
                  </div>
                </div>
              )}
            </section>
          )}

          {customerSubView === 'account' && (
            <section className="account-pane">
              <div className="section-heading row-between">
                <div>
                  <h1>My profile & updates</h1>
                </div>
                <button type="button" className="secondary-btn" onClick={() => setCustomerSubView('home')}>Back</button>
              </div>

              <div className="account-tabs">
                {['overview','orders','quotes','appointments','messages','saved','notifications','profile'].map((tab) => (
                  <button key={tab} type="button" className={accountTab === tab ? 'small-btn active' : 'small-btn'} onClick={() => setAccountTab(tab as CustomerTab)}>{tab}</button>
                ))}
              </div>

              {accountTab === 'overview' && (
                <div className="dashboard-grid account-grid">
                  <div className="dashboard-card wide-card">
                    <h3>Overview</h3>
                    <div className="mini-stats">
                      <div><strong>{demoState.inquiries.filter((item) => item.customer === customerName).length}</strong><span>Inquiries</span></div>
                      <div><strong>{accountQuotes.length}</strong><span>Quotes</span></div>
                      <div><strong>{accountAppointments.length}</strong><span>Appointments</span></div>
                      <div><strong>{accountOrders.length}</strong><span>Orders</span></div>
                    </div>
                  </div>
                  <div className="dashboard-card">
                    <h3>Orders</h3>
                    <ul>{accountOrders.length ? accountOrders.map((item) => <li key={item.orderNumber}>{item.orderNumber} <span>{item.status}</span></li>) : <li>No orders</li>}</ul>
                  </div>
                  <div className="dashboard-card">
                    <h3>Quotes</h3>
                    <ul>{accountQuotes.length ? accountQuotes.map((item) => <li key={item.quoteNumber}>{item.quoteNumber} <span>{item.status}</span></li>) : <li>No quotes</li>}</ul>
                  </div>
                  <div className="dashboard-card">
                    <h3>Appointments</h3>
                    <ul>{accountAppointments.length ? accountAppointments.map((item) => <li key={item.id}>{item.date} <span>{item.time}</span></li>) : <li>No appointments</li>}</ul>
                  </div>
                </div>
              )}

              {accountTab === 'orders' && (
                <div className="account-panel">
                  {accountOrders.length ? accountOrders.map((order) => (
                    <div key={order.orderNumber} className="account-item">
                      <div>
                        <strong>{order.orderNumber}</strong>
                        <span>{order.date}</span>
                      </div>
                      <div>
                        <strong>{order.status}</strong>
                        <span>{formatCurrency(order.total)}</span>
                      </div>
                    </div>
                  )) : <div className="empty-state">No orders yet.</div>}
                </div>
              )}

              {accountTab === 'quotes' && (
                <div className="account-panel">
                  {accountQuotes.length ? accountQuotes.map((quote) => (
                    <div key={quote.quoteNumber} className="account-item quote-item">
                      <div>
                        <strong>{quote.quoteNumber}</strong>
                        <span>{quote.furniture}</span>
                      </div>
                      <div>
                        <strong>{quote.status}</strong>
                        <span>{formatCurrency(quote.amount)}</span>
                      </div>
                      <button type="button" className="primary-btn" onClick={() => handleAcceptQuote(quote)}>Accept Quote</button>
                    </div>
                  )) : <div className="empty-state">No quotes yet.</div>}
                </div>
              )}

              {accountTab === 'appointments' && (
                <div className="account-panel">
                  {!appointmentSubmitted ? (
                    <form className="appointment-form inline-appointment-form" onSubmit={handleAppointmentSubmit}>
                      <div className="form-grid two-col">
                        <label>
                          Name
                          <input value={appointmentForm.name} onChange={(event) => setAppointmentForm((prev) => ({ ...prev, name: event.target.value }))} />
                        </label>
                        <label>
                          Phone
                          <input value={appointmentForm.phone} onChange={(event) => setAppointmentForm((prev) => ({ ...prev, phone: event.target.value }))} />
                        </label>
                        <label>
                          Email
                          <input type="email" value={appointmentForm.email} onChange={(event) => setAppointmentForm((prev) => ({ ...prev, email: event.target.value }))} />
                        </label>
                        <label>
                          Preferred Date
                          <input type="date" value={appointmentForm.date} onChange={(event) => setAppointmentForm((prev) => ({ ...prev, date: event.target.value }))} />
                        </label>
                        <label>
                          Preferred Time
                          <select value={appointmentForm.time} onChange={(event) => setAppointmentForm((prev) => ({ ...prev, time: event.target.value }))}>
                            <option>9:00 AM</option><option>10:30 AM</option><option>1:00 PM</option><option>2:00 PM</option><option>3:30 PM</option>
                          </select>
                        </label>
                        <label>
                          Purpose
                          <select value={appointmentForm.purpose} onChange={(event) => setAppointmentForm((prev) => ({ ...prev, purpose: event.target.value }))}>
                            <option>Product Viewing</option>
                            <option>Custom Furniture Consultation</option>
                            <option>Project Consultation</option>
                          </select>
                        </label>
                      </div>
                      <button type="submit" className="primary-btn">Book a Visit</button>
                    </form>
                  ) : (
                    <div className="success-box compact-box">
                      <div className="success-icon">✓</div>
                      <h3>Appointment request sent</h3>
                      <p>Our team will confirm your preferred date and time soon.</p>
                    </div>
                  )}

                  {accountAppointments.length ? accountAppointments.map((appointment) => (
                    <div key={appointment.id} className="account-item">
                      <div>
                        <strong>{appointment.type}</strong>
                        <span>{appointment.date} {appointment.time}</span>
                      </div>
                      <strong>{appointment.status}</strong>
                    </div>
                  )) : <div className="empty-state">No appointments yet.</div>}
                </div>
              )}

              {accountTab === 'messages' && (
                <div className="account-panel chat-account-panel">
                  {chatMessages.map((message, index) => (
                    <div key={`${message.sender}-${index}`} className={`chat-bubble ${message.sender}`}>
                      {message.text}
                    </div>
                  ))}
                </div>
              )}

              {accountTab === 'saved' && (
                <div className="account-panel">
                  {savedItems.length ? savedItems.map((product) => (
                    <div key={product.id} className="account-item">
                      <div>
                        <strong>{product.name}</strong>
                        <span>{product.category}</span>
                      </div>
                      <button type="button" className="secondary-btn" onClick={() => handleOpenProduct(product.id)}>View</button>
                    </div>
                  )) : <div className="empty-state">No saved products yet.</div>}
                </div>
              )}

              {accountTab === 'notifications' && (
                <div className="account-panel">
                  {recentNotifications.map((notification) => (
                    <div key={notification.id} className="account-item">
                      <div>
                        <strong>{notification.type}</strong>
                        <span>{notification.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {accountTab === 'profile' && (
                <div className="account-panel profile-panel">
                  <div><strong>Customer</strong><span>Maria Santos</span></div>
                  <div><strong>Location</strong><span>Angeles City, Pampanga</span></div>
                  <div><strong>Email</strong><span>maria.santos@gmail.com</span></div>
                  <div><strong>Phone</strong><span>+63 917 112 3456</span></div>
                </div>
              )}
            </section>
          )}

          <div className={`chat-widget${chatOpen ? ' is-open' : ''}`}>
            {chatOpen && (
              <section
                id="customer-chat-dialog"
                className="chat-panel"
                role="dialog"
                aria-modal="false"
                aria-label="Craft & Form customer assistance chat"
              >
                <div className="chat-header">
                  <span className="chat-header-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H5l1.8-3.1A7.5 7.5 0 1 1 20 11.5Z" />
                      <path d="M9 11.5h.01M12.5 11.5h.01M16 11.5h.01" />
                    </svg>
                  </span>
                  <div className="chat-header-copy">
                    <strong>Craft & Form Assistant</strong>
                    <span><i className="chat-online-indicator" /> Furniture & custom order assistance</span>
                  </div>
                  <div className="chat-header-controls">
                    <button type="button" aria-label="Minimize chat" onClick={() => { setChatOpen(false); chatOpenRef.current = false }}>−</button>
                    <button type="button" aria-label="Close chat" onClick={() => { setChatOpen(false); chatOpenRef.current = false }}>×</button>
                  </div>
                </div>
                <div className="chat-body" ref={chatBodyRef} aria-live="polite" aria-relevant="additions text">
                  {chatProduct && (
                    <div className="chat-product-context">
                      <span>You're asking about</span>
                      <strong>{chatProduct.name}</strong>
                      <span>Starting at {formatCurrency(chatProduct.price)} · {chatProduct.material}</span>
                      <span>{chatProduct.availability} · Customizable</span>
                    </div>
                  )}
                  {chatMessages.map((message, index) => (
                    <div key={`${message.sender}-${index}`} className={`chat-bubble ${message.sender}`}>
                      {message.text}
                    </div>
                  ))}
                  {chatStatus === 'sending' && (
                    <div className="chat-typing" role="status">Craft & Form Assistant is typing...</div>
                  )}
                </div>
                {showSuggestions && (
                  <div className="chat-suggestions">
                    {SUGGESTED_QUESTIONS.map((question) => (
                      <button key={question} type="button" onClick={() => { void sendChatMessage(question) }}>{question}</button>
                    ))}
                  </div>
                )}
                <form className="chat-input-row" onSubmit={(event) => { event.preventDefault(); handleSendMessage() }}>
                  <input
                    aria-label="Message Craft & Form Assistant"
                    value={chatInput}
                    onChange={(event) => setChatInput(event.target.value)}
                    placeholder="Ask us anything..."
                    disabled={chatStatus === 'sending'}
                  />
                  <button type="submit" disabled={chatStatus === 'sending' || !chatInput.trim()}>Send</button>
                </form>
                <div className="chat-footer-actions">
                  <button type="button" className="secondary-btn" onClick={() => handleChatAction('quote')}>Request Custom Quote</button>
                  <button type="button" className="ghost-btn" onClick={handleContactTeam}>Talk to Our Team</button>
                </div>
              </section>
            )}
            {!chatOpen && (
              <button
                type="button"
                className="chat-launcher"
                aria-label="Open customer assistance chat"
                aria-expanded={chatOpen}
                aria-controls="customer-chat-dialog"
                onClick={handleOpenChat}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H5l1.8-3.1A7.5 7.5 0 1 1 20 11.5Z" />
                  <path d="M9 11.5h.01M12.5 11.5h.01M16 11.5h.01" />
                </svg>
                <span className="chat-launcher-label">Ask us</span>
                {unreadCount > 0 && <span className="chat-unread-badge" aria-label={`${unreadCount} unread assistant replies`}>{unreadCount}</span>}
              </button>
            )}
          </div>

          {cartOpen && (
            <div className="cart-drawer-backdrop" onClick={() => setCartOpen(false)} />
          )}

          {cartOpen && (
            <aside className="cart-drawer">
              <div className="panel-head cart-head">
                <h3>Cart</h3>
                <button type="button" className="small-btn" onClick={() => setCartOpen(false)}>Close</button>
              </div>
              {cartItems.length ? (
                <>
                  {cartItems.map((item) => (
                    <div key={item.id} className="mini-cart-item">
                      <img src={photoFor(item.id)} alt={item.name} />
                      <div>
                        <strong>{item.name}</strong>
                        <span>{formatCurrency(item.price)} × {item.quantity}</span>
                      </div>
                    </div>
                  ))}
                  <div className="mini-cart-footer">
                    <div className="summary-row"><span>Subtotal</span><strong>{formatCurrency(cartSubtotal)}</strong></div>
                    <div className="summary-row"><span>Delivery</span><strong>{formatCurrency(deliveryFee)}</strong></div>
                    <div className="summary-row total-row"><span>Total</span><strong>{formatCurrency(cartTotal)}</strong></div>
                    <button type="button" className="primary-btn" onClick={() => { setCartOpen(false); setCustomerSubView('checkout') }}>Proceed to Checkout</button>
                    <button type="button" className="secondary-btn" onClick={() => { setCartOpen(false); setCustomerSubView('catalog') }}>Continue Shopping</button>
                  </div>
                </>
              ) : (
                <div className="empty-state">Your cart is empty.</div>
              )}
            </aside>
          )}

          <footer className="site-footer">
            <div className="footer-inner">
              <p className="footer-mark">Craft &amp; Form</p>
              <div className="footer-grid">
                <div className="footer-col">
                  <strong>Shop</strong>
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryFilter('all')
                      setCustomerSubView('catalog')
                      window.scrollTo({ top: 0, behavior: 'auto' })
                    }}
                  >
                    Collection
                  </button>
                  <button type="button" onClick={() => goToSection('build')}>
                    Build a piece
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCartOpen(true)
                      setCustomerSubView('cart')
                    }}
                  >
                    Cart
                  </button>
                  <button type="button" onClick={() => { setCustomerSubView('account'); window.scrollTo({ top: 0, behavior: 'auto' }) }}>
                    Account
                  </button>
                </div>
                <div className="footer-col">
                  <strong>Workshop</strong>
                  <button type="button" onClick={() => goToSection('process')}>
                    How a piece is made
                  </button>
                  <button type="button" onClick={() => goToSection('work')}>
                    Work around Pampanga
                  </button>
                  <button type="button" onClick={() => { setActiveView('admin'); window.scrollTo({ top: 0, behavior: 'auto' }) }}>
                    Business portal
                  </button>
                </div>
                <div className="footer-col">
                  <strong>Visit</strong>
                  <a href="tel:+639171234567">+63 917 123 4567</a>
                  <a href="mailto:hello@craftandform.ph">hello@craftandform.ph</a>
                  <span>42 N. M. Hizon St., Angeles City</span>
                  <span>Monday to Saturday, 9–6</span>
                </div>
              </div>
              <p className="credits">
                Photographs are placeholder stock from{' '}
                <a href="https://unsplash.com" target="_blank" rel="noreferrer noopener">
                  Unsplash
                </a>{' '}
                until the workshop's own shoot replaces them; none shows this workshop's work. The wood surfaces are by Titus
                Tscharntke, public domain. The joinery plate is{' '}
                <a
                  href="https://commons.wikimedia.org/wiki/File:A-J_Roubo_-_L%27Art_du_Menuisier_-_Planche_350.png"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  “A-J Roubo – L'Art du Menuisier – Planche 350”
                </a>{' '}
                by André Jacob Roubo, public domain, via Wikimedia Commons. Prices, lead times and customer records are demo
                data.
              </p>
            </div>
          </footer>
        </main>
      ) : (
        <main className="admin-view">
          <aside className="admin-sidebar">
            <div className="brand-wrap side-brand">
              <span className="brand-mark" aria-hidden="true">CF</span>
              <div>
                <div className="brand-name">Craft & Form</div>
              </div>
            </div>
            <nav className="admin-nav">
              {['Dashboard','Orders','Products','Inventory','Customers','Inquiries','Quotations','Appointments','Reviews','Settings'].map((item) => (
                <button key={item} className={item === 'Dashboard' ? 'active' : ''}>{item}</button>
              ))}
            </nav>
            <button
              type="button"
              className="secondary-btn admin-back"
              onClick={() => {
                setActiveView('site')
                window.scrollTo({ top: 0, behavior: 'auto' })
              }}
            >
              Back to the store
            </button>
          </aside>

          <section className="admin-content">
            <div className="admin-topbar">
              <div>
                <h1>Operations Dashboard</h1>
              </div>
              <button className="primary-btn">Export Report</button>
            </div>

            <div className="stats-grid">
              <div className="stat-card"><span>Total Orders</span><strong>₱{demoState.orders.reduce((sum, item) => sum + item.total, 0).toLocaleString()}</strong></div>
              <div className="stat-card"><span>Pending Quotes</span><strong>{demoState.quotations.filter((quote) => quote.status === 'New' || quote.status === 'Reviewing').length}</strong></div>
              <div className="stat-card"><span>New Inquiries</span><strong>{demoState.inquiries.length}</strong></div>
              <div className="stat-card"><span>Appointments Today</span><strong>{demoState.appointments.filter((item) => item.date === '2026-09-30').length}</strong></div>
              <div className="stat-card"><span>Products</span><strong>{demoState.products.length}</strong></div>
            </div>

            <div className="admin-panels">
              <div className="panel chart-panel">
                <h3>Sales Overview</h3>
                <div className="bar-chart">
                  {adminSalesData.map((value, index) => (
                    <div key={index} className="bar-col">
                      <span style={{ height: `${value}%` }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="panel chart-panel">
                <h3>Inquiry Volume</h3>
                <div className="line-graph">
                  {inquiryVolumeData.map((value, index) => (
                    <div key={index} className="line-point" style={{ left: `${(index / (inquiryVolumeData.length - 1)) * 100}%`, bottom: `${value * 1.2}px` }} />
                  ))}
                </div>
              </div>
              <div className="panel chart-panel">
                <h3>Popular Products</h3>
                <div className="list-chart">
                  {popularProducts.map((item) => (
                    <div key={item.name} className="list-item">
                      <span>{item.name}</span>
                      <div className="progress"><i style={{ width: `${item.value}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="admin-panels two-panel">
              <div className="panel full-panel">
                <div className="panel-head">
                  <h3>Inquiries</h3>
                  <button className="small-btn">View All</button>
                </div>
                <div className="inquiry-list">
                  {demoState.inquiries.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="inquiry-item">
                      <div>
                        <strong>{entry.customer}</strong>
                        <span>{entry.inquiry}</span>
                      </div>
                      <div className="inquiry-meta">
                        <select className="status-select" value={entry.status} onChange={(event) => handleInquiryStatusChange(entry.id, event.target.value as InquiryThread['status'])}>
                          <option value="AI Assisted">AI Assisted</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel full-panel">
                <div className="panel-head">
                  <h3>Quotations</h3>
                  <button className="small-btn">Create</button>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Quote #</th>
                        <th>Customer</th>
                        <th>Furniture</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {demoState.quotations.slice(0, 5).map((request) => (
                        <tr key={request.quoteNumber}>
                          <td>{request.quoteNumber}</td>
                          <td>{request.customer}</td>
                          <td>{request.furniture}</td>
                          <td>₱{request.amount.toLocaleString()}</td>
                          <td>
                            <select className="status-select" value={request.status} onChange={(event) => handleQuoteStatusChange(request.quoteNumber, event.target.value as QuotationRequest['status'])}>
                              <option value="New">New</option>
                              <option value="Reviewing">Reviewing</option>
                              <option value="Quoted">Quoted</option>
                              <option value="Approved">Approved</option>
                              <option value="Rejected">Rejected</option>
                              <option value="Need More Information">Need More Information</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="admin-panels two-panel">
              <div className="panel full-panel">
                <div className="panel-head">
                  <h3>Appointments</h3>
                  <button className="small-btn">Calendar</button>
                </div>
                <div className="appointment-list">
                  {demoState.appointments.map((item) => (
                    <div key={item.id} className="appointment-row">
                      <div>
                        <strong>{item.customer}</strong>
                        <span>{item.type}</span>
                      </div>
                      <div className="appointment-meta">
                        <span>{item.date}</span>
                        <span>{item.time}</span>
                        <select className="status-select" value={item.status} onChange={(event) => handleAppointmentStatusChange(item.id, event.target.value as Appointment['status'])}>
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Rescheduled">Rescheduled</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel full-panel">
                <div className="panel-head">
                  <h3>Order Status</h3>
                  <button className="small-btn">Review</button>
                </div>
                <div className="customer-list">
                  {demoState.orders.slice(0, 5).map((order) => (
                    <div key={order.orderNumber} className="customer-card-mini">
                      <strong>{order.customer}</strong>
                      <span>{order.orderNumber}</span>
                      <small>₱{order.total.toLocaleString()}</small>
                      <select className="status-select" value={order.status} onChange={(event) => handleOrderStatusChange(order.orderNumber, event.target.value as Order['status'])}>
                        <option value="For Confirmation">For Confirmation</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="In Production">In Production</option>
                        <option value="Ready for Delivery">Ready for Delivery</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
      )}
    </div>
  )
}

export default App
