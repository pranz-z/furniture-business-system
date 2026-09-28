import { useEffect, useMemo, useState, type FormEvent } from 'react'
import './App.css'
import { adminSalesData, categories, inquiryVolumeData, popularProducts, projects } from './data/mockData'
import { getAiReply } from './services/aiService'
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

const CategoryIcon = ({ icon }: { icon: string }) => {
  const sharedProps = {
    viewBox: '0 0 36 36',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  switch (icon) {
    case 'sofa':
      return (
        <svg {...sharedProps} width="36" height="36">
          <path d="M8 19.5h20a3 3 0 0 1 3 3v3H5v-3a3 3 0 0 1 3-3Z" />
          <path d="M10 19.5V14a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v5.5" />
          <path d="M8 25.5v2.5M28 25.5v2.5M12 13.5h12" />
        </svg>
      )
    case 'dining':
      return (
        <svg {...sharedProps} width="36" height="36">
          <path d="M7 13.5h22M10.5 13.5V10.5h15v3M9 18h18a2 2 0 0 1 2 2v2H7v-2a2 2 0 0 1 2-2Z" />
          <path d="M12 23v5M24 23v5M7 26.5h22" />
        </svg>
      )
    case 'bed':
      return (
        <svg {...sharedProps} width="36" height="36">
          <path d="M6 21.5h24a2 2 0 0 1 2 2V25H4v-1.5a2 2 0 0 1 2-2Z" />
          <path d="M9 19V12.5a2.5 2.5 0 0 1 2.5-2.5h13a2.5 2.5 0 0 1 2.5 2.5V19" />
          <path d="M6 25v3M30 25v3M10 15.5h16" />
        </svg>
      )
    case 'desk':
      return (
        <svg {...sharedProps} width="36" height="36">
          <path d="M7 12.5h22a2 2 0 0 1 2 2v7H5v-7a2 2 0 0 1 2-2Z" />
          <path d="M9 21.5V27M27 21.5V27M5 27h26" />
          <path d="M13 12.5V8.5M23 12.5V8.5" />
        </svg>
      )
    case 'cabinet':
      return (
        <svg {...sharedProps} width="36" height="36">
          <path d="M9 8.5h18a2 2 0 0 1 2 2v17a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-17a2 2 0 0 1 2-2Z" />
          <path d="M9 15.5h18M13.5 8.5v19M22.5 8.5v19" />
        </svg>
      )
    case 'outdoor':
      return (
        <svg {...sharedProps} width="36" height="36">
          <path d="M7 23.5h22a2 2 0 0 1 2 2v2H5v-2a2 2 0 0 1 2-2Z" />
          <path d="M12 23.5V15.5a1.5 1.5 0 0 1 1.5-1.5h9a1.5 1.5 0 0 1 1.5 1.5v8" />
          <path d="M9 14.5h18M10 10.5l3 3M26 10.5l-3 3" />
        </svg>
      )
    case 'custom':
      return (
        <svg {...sharedProps} width="36" height="36">
          <path d="M9 27.5V21M18 27.5V10.5M27 27.5V16.5" />
          <path d="M7 19.5h4M16 8.5h4M25 14.5h4" />
          <path d="M9 8.5l3 3 6-6 9 9" />
        </svg>
      )
    default:
      return (
        <svg {...sharedProps} width="36" height="36">
          <circle cx="18" cy="18" r="10" />
          <path d="M18 8.5v19M8.5 18h19" />
        </svg>
      )
  }
}

function App() {
  const [activeView, setActiveView] = useState<'site' | 'admin'>('site')
  const [demoState, setDemoState] = useState(() => getDemoState())
  const [customerSubView, setCustomerSubView] = useState<'home' | 'catalog' | 'product' | 'cart' | 'checkout' | 'order-confirmation' | 'quote' | 'account'>('home')
  const [selectedProductId, setSelectedProductId] = useState<number>(1)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [savedProducts, setSavedProducts] = useState<number[]>([])
  const [chatOpen, setChatOpen] = useState(true)
  const [chatMode, setChatMode] = useState<'ai' | 'human'>('ai')
  const [chatMessages, setChatMessages] = useState([
    { sender: 'assistant', text: 'Hello! How can we help you today?' },
    { sender: 'customer', text: 'Magkano po yung Narra dining table?' },
    { sender: 'assistant', text: 'According to our current catalog, the Narra Dining Table starts at ₱18,500. Final pricing may vary depending on size and customization.' },
    { sender: 'customer', text: 'Pwede po custom size?' },
    { sender: 'assistant', text: 'Yes. We can accommodate custom dimensions. I can help you request a quotation.' },
  ])
  const [chatInput, setChatInput] = useState('')
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

  useEffect(() => {
    persistDemoState(demoState)
  }, [demoState])

  useEffect(() => {
    const shouldLockScroll = mobileMenuOpen || cartOpen
    document.body.style.overflow = shouldLockScroll ? 'hidden' : ''
    document.body.style.touchAction = shouldLockScroll ? 'none' : ''

    return () => {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
  }, [mobileMenuOpen, cartOpen])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false)
        setCartOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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

  const handleSendMessage = () => {
    const trimmed = chatInput.trim()
    if (!trimmed) return

    setChatMessages((prev) => [...prev, { sender: 'customer', text: trimmed }])
    const reply = chatMode === 'ai' ? getAiReply(trimmed, selectedProduct?.name) : 'Connecting you with our customer service team... Our admin team will review your message in the dashboard.'
    setTimeout(() => {
      setChatMessages((prev) => [...prev, { sender: 'assistant', text: reply }])
    }, 180)
    setChatInput('')
  }

  const handleAskAboutProduct = () => {
    const productName = selectedProduct?.name ?? 'Narra Dining Table'
    const text = `Hi! I'm interested in the ${productName}.`
    setChatOpen(true)
    setChatMode('ai')
    setChatMessages((prev) => [...prev, { sender: 'customer', text }, { sender: 'assistant', text: getAiReply(text, productName) }])
  }

  const handleTalkToStaff = () => {
    setChatOpen(true)
    setChatMode('human')
    setChatMessages((prev) => [...prev, { sender: 'assistant', text: 'Connecting you with our customer service team...' }, { sender: 'assistant', text: 'A staff member has been notified. The admin dashboard will now receive the conversation.' }])
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
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-mark">CF</div>
          <div>
            <div className="brand-name">Craft & Form</div>
            <div className="brand-subtitle">Pampanga Furniture Co.</div>
          </div>
        </div>

        <nav className="nav" aria-label="Main navigation">
          <button type="button" className="nav-link" onClick={() => { setCustomerSubView('home'); setActiveView('site'); setMobileMenuOpen(false) }}>Home</button>
          <button type="button" className="nav-link" onClick={() => { setCustomerSubView('catalog'); setActiveView('site'); setMobileMenuOpen(false) }}>Shop</button>
          <button type="button" className="nav-link" onClick={() => { setCustomerSubView('quote'); setActiveView('site'); setMobileMenuOpen(false) }}>Custom Furniture</button>
          <button type="button" className="nav-link" onClick={() => { setCustomerSubView('home'); setActiveView('site'); setMobileMenuOpen(false) }}>Projects</button>
          <button type="button" className="nav-link" onClick={() => { setCustomerSubView('home'); setActiveView('site'); setMobileMenuOpen(false) }}>About</button>
          <button type="button" className="nav-link" onClick={() => { setCustomerSubView('home'); setActiveView('site'); setMobileMenuOpen(false) }}>Contact</button>
        </nav>

        <div className="nav-actions desktop-actions">
          <button className="secondary-btn" onClick={() => { setCustomerSubView('quote'); setActiveView('site') }}>Request a Quote</button>
          <button className="primary-btn" onClick={() => setActiveView('admin')}>Business Portal</button>
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
                <div className="brand-mark">CF</div>
                <div>
                  <div className="brand-name">Craft & Form</div>
                  <div className="brand-subtitle">Pampanga Furniture Co.</div>
                </div>
              </div>
              <button type="button" className="close-menu" aria-label="Close menu" onClick={() => setMobileMenuOpen(false)}>×</button>
            </div>

            <nav className="mobile-menu-nav" aria-label="Mobile navigation links">
              <button type="button" className="mobile-menu-link" onClick={() => { setCustomerSubView('home'); setActiveView('site'); setMobileMenuOpen(false) }}>Home</button>
              <button type="button" className="mobile-menu-link" onClick={() => { setCustomerSubView('catalog'); setActiveView('site'); setMobileMenuOpen(false) }}>Shop</button>
              <button type="button" className="mobile-menu-link" onClick={() => { setCustomerSubView('quote'); setActiveView('site'); setMobileMenuOpen(false) }}>Custom Furniture</button>
              <button type="button" className="mobile-menu-link" onClick={() => { setCustomerSubView('home'); setActiveView('site'); setMobileMenuOpen(false) }}>Projects</button>
              <button type="button" className="mobile-menu-link" onClick={() => { setCustomerSubView('home'); setActiveView('site'); setMobileMenuOpen(false) }}>About</button>
              <button type="button" className="mobile-menu-link" onClick={() => { setCustomerSubView('home'); setActiveView('site'); setMobileMenuOpen(false) }}>Contact</button>
              <button type="button" className="mobile-menu-link" onClick={() => { setCustomerSubView('account'); setActiveView('site'); setMobileMenuOpen(false) }}>Account</button>
              <button type="button" className="mobile-menu-link" onClick={() => { setCustomerSubView('quote'); setActiveView('site'); setMobileMenuOpen(false) }}>Request a Quote</button>
            </nav>
          </aside>
        </>
      )}

      {activeView === 'site' ? (
        <main className="site-view">
          {customerSubView === 'home' && (
            <>
              <section id="home" className="hero-section">
                <div className="hero-copy">
                  <span className="eyebrow">Custom furniture & quality craftsmanship in Pampanga</span>
                  <h1>Furniture Crafted for the Way You Live.</h1>
                  <p>Quality furniture, custom craftsmanship, and made-to-order solutions from Pampanga.</p>
                  <div className="hero-actions">
                    <button type="button" className="primary-btn" onClick={() => setCustomerSubView('catalog')}>Shop Furniture</button>
                    <button type="button" className="secondary-btn" onClick={() => setCustomerSubView('quote')}>Request Custom Furniture</button>
                  </div>
                  <div className="hero-meta">
                    <div><strong>1,200+</strong><span>Homes furnished</span></div>
                    <div><strong>7 yrs</strong><span>Local craftsmanship</span></div>
                    <div><strong>4.9/5</strong><span>Client satisfaction</span></div>
                  </div>
                </div>
                <div className="hero-visual">
                  <img src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80" alt="Luxury living room furniture" />
                  <div className="floating-card">
                    <div className="card-tag">Featured</div>
                    <div className="card-title">Narra Dining Table</div>
                    <div className="card-price">Starting at ₱18,500</div>
                  </div>
                </div>
              </section>

              <section className="section-block">
                <div className="section-heading">
                  <span className="eyebrow">Featured Categories</span>
                  <h2>Designed to suit every room and purpose.</h2>
                </div>
                <div className="category-grid">
                  {categories.map((category) => (
                    <button type="button" key={category.name} className="category-card category-button" onClick={() => { setCategoryFilter(category.name); setCustomerSubView('catalog') }}>
                      <div className="category-icon-wrap" aria-hidden="true">
                        <CategoryIcon icon={category.icon} />
                      </div>
                      <h3>{category.name}</h3>
                      <p>{category.description}</p>
                    </button>
                  ))}
                </div>
              </section>

              <section id="catalog" className="section-block">
                <div className="section-heading row-between">
                  <div>
                    <span className="eyebrow">Featured Products</span>
                    <h2>Best-selling furniture crafted for modern Filipino homes.</h2>
                  </div>
                  <button type="button" className="text-link inline-button" onClick={() => setCustomerSubView('catalog')}>View Catalog</button>
                </div>
                <div className="product-grid">
                  {featuredProducts.map((product) => (
                    <article key={product.id} className="product-card">
                      <img src={product.image} alt={product.name} />
                      <div className="product-info">
                        <div className="product-row">
                          <span className="product-tag">{product.category}</span>
                          <span className="availability">{product.availability}</span>
                        </div>
                        <h3>{product.name}</h3>
                        <p className="material-line">{product.material}</p>
                        <div className="product-row price-row">
                          <strong>{formatCurrency(product.price)}</strong>
                          <button type="button" className="small-btn" onClick={() => handleOpenProduct(product.id)}>View</button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section id="projects" className="projects-section">
                <div className="section-heading">
                  <span className="eyebrow">Our Projects</span>
                  <h2>Recent work across Pampanga homes and businesses.</h2>
                </div>
                <div className="project-grid">
                  {projects.map((project) => (
                    <article key={project.id} className="project-card">
                      <img src={project.image} alt={project.name} />
                      <div className="project-info">
                        <span className="project-badge">{project.type}</span>
                        <h3>{project.name}</h3>
                        <p>{project.description}</p>
                        <div className="project-location">{project.location}</div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section id="about" className="feature-section">
                <div className="section-heading">
                  <span className="eyebrow">Why Choose Us</span>
                  <h2>Thoughtful design, reliable craftsmanship, and local expertise.</h2>
                </div>
                <div className="feature-grid">
                  {[
                    ['Craftsmanship', 'Hand-finished woodwork and durable construction with attention to detail.'],
                    ['Custom Design', 'Furniture tailored to your home, office, or commercial space.'],
                    ['Local Expertise', 'We understand Pampanga homes, styles, and city-specific project needs.'],
                    ['Made-to-Order', 'Built around your dimensions, purpose, and finish preferences.'],
                    ['Delivery & Installation', 'Full-service coordination for safe delivery and setup.'],
                  ].map(([title, text]) => (
                    <div key={title} className="feature-item">
                      <span className="feature-icon">✦</span>
                      <h3>{title}</h3>
                      <p>{text}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="showroom-section">
                <div className="showroom-card">
                  <div className="showroom-copy">
                    <span className="eyebrow">Showroom</span>
                    <h2>Pampanga, Philippines</h2>
                    <p>Visit our design showroom to see furniture pieces, finishes, and custom possibilities in person.</p>
                    <div className="hours-box">
                      <strong>Business hours</strong>
                      <span>Monday–Saturday</span>
                      <span>9:00 AM – 6:00 PM</span>
                    </div>
                    <div className="showroom-actions">
                      <button type="button" className="secondary-btn" onClick={() => setCustomerSubView('account')}>Get Directions</button>
                      <button type="button" className="primary-btn" onClick={() => setCustomerSubView('account')}>Book a Visit</button>
                    </div>
                  </div>
                  <div className="map-placeholder">
                    <div className="map-pin">📍</div>
                    <div className="map-label">Pampanga, Philippines</div>
                  </div>
                </div>
              </section>

              <section className="contact-section" id="contact">
                <div className="contact-card">
                  <div>
                    <span className="eyebrow">Contact</span>
                    <h2>Let’s talk about your next project.</h2>
                    <ul className="contact-list">
                      <li>Phone: +63 917 123 4567</li>
                      <li>Email: hello@craftandform.ph</li>
                      <li>Facebook: @craftandformph</li>
                      <li>Messenger: m.me/craftandformph</li>
                      <li>Showroom: 42 N. M. Hizon St., Angeles City, Pampanga</li>
                      <li>Business Hours: Mon-Sat, 9:00 AM – 6:00 PM</li>
                    </ul>
                  </div>
                  <form className="contact-form">
                    <input placeholder="Name" />
                    <input placeholder="Phone" />
                    <input placeholder="Email" />
                    <textarea rows={4} placeholder="Tell us what you're looking for" />
                    <button className="primary-btn" type="button">Send Inquiry</button>
                  </form>
                </div>
              </section>
            </>
          )}

          {customerSubView === 'catalog' && (
            <section className="catalog-large catalog-pane">
              <div className="section-heading row-between">
                <div>
                  <span className="eyebrow">Product Catalog</span>
                  <h2>Explore our collections.</h2>
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
                    <img src={product.image} alt={product.name} />
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
                  <img src={selectedProduct.image} alt={selectedProduct.name} />
                  <div className="thumb-strip">
                    <img src={selectedProduct.image} alt="Gallery 1" />
                    <img src={selectedProduct.image} alt="Gallery 2" />
                    <img src={selectedProduct.image} alt="Gallery 3" />
                  </div>
                </div>
                <div className="detail-copy">
                  <span className="eyebrow">{selectedProduct.category}</span>
                  <h2>{selectedProduct.name}</h2>
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
                  <span className="eyebrow">Customer Reviews</span>
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
                  <span className="eyebrow">Your Cart</span>
                  <h2>Ready for checkout</h2>
                </div>
                <button type="button" className="secondary-btn" onClick={() => setCustomerSubView('catalog')}>Continue Shopping</button>
              </div>

              {cartItems.length ? (
                <div className="cart-layout">
                  <div className="cart-list">
                    {cartItems.map((item) => (
                      <div key={item.id} className="cart-item">
                        <img src={item.image} alt={item.name} />
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
                  <span className="eyebrow">Checkout</span>
                  <h2>Complete your order</h2>
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
                  <span className="eyebrow">Quotation Request</span>
                  <h2>Request a quote for {selectedProduct?.name ?? 'your product'}</h2>
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
                  <span className="eyebrow">Customer Account</span>
                  <h2>My profile & updates</h2>
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

          <div className="chat-widget">
            {chatOpen && (
              <div className="chat-panel">
                <div className="chat-header">
                  <div>
                    <strong>{chatMode === 'ai' ? 'Craft & Form Assistant' : 'Human Support'}</strong>
                    <span>{chatMode === 'ai' ? 'Online now' : 'Staff is connecting'}</span>
                  </div>
                  <button onClick={() => setChatOpen(false)}>×</button>
                </div>
                <div className="chat-body">
                  {chatMessages.map((message, index) => (
                    <div key={`${message.sender}-${index}`} className={`chat-bubble ${message.sender}`}>
                      {message.text}
                    </div>
                  ))}
                </div>
                <div className="chat-suggestions">
                  <button type="button" onClick={() => setChatInput('How much is this?')}>How much is this?</button>
                  <button type="button" onClick={() => setChatInput('Can I change the size?')}>Can I change the size?</button>
                  <button type="button" onClick={() => setChatInput('Do you deliver in Pampanga?')}>Do you deliver in Pampanga?</button>
                  <button type="button" onClick={() => setChatInput('Where is your showroom?')}>Where is your showroom?</button>
                </div>
                <div className="chat-input-row">
                  <input value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="Type your message..." />
                  <button type="button" onClick={handleSendMessage}>Send</button>
                </div>
                <div className="chat-footer-actions">
                  <button type="button" className="secondary-btn" onClick={() => setCustomerSubView('quote')}>Request Custom Quote</button>
                  <button type="button" className="ghost-btn" onClick={handleTalkToStaff}>Talk to a Staff Member</button>
                </div>
              </div>
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
                      <img src={item.image} alt={item.name} />
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
        </main>
      ) : (
        <main className="admin-view">
          <aside className="admin-sidebar">
            <div className="brand-wrap side-brand">
              <div className="brand-mark">CF</div>
              <div>
                <div className="brand-name">Craft & Form</div>
              </div>
            </div>
            <nav className="admin-nav">
              {['Dashboard','Orders','Products','Inventory','Customers','Inquiries','Quotations','Appointments','Reviews','Settings'].map((item) => (
                <button key={item} className={item === 'Dashboard' ? 'active' : ''}>{item}</button>
              ))}
            </nav>
          </aside>

          <section className="admin-content">
            <div className="admin-topbar">
              <div>
                <span className="eyebrow">Overview</span>
                <h2>Operations Dashboard</h2>
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
