import type { Appointment, Category, Customer, InquiryThread, Order, Product, Project, QuotationRequest, Review } from '../types.js'

export const categories: Category[] = [
  { name: 'Living Room', icon: 'sofa', description: 'Sofas, coffee tables, and statement pieces for everyday comfort.' },
  { name: 'Dining', icon: 'dining', description: 'Wooden dining sets crafted for family meals and hosting guests.' },
  { name: 'Bedroom', icon: 'bed', description: 'Solid wood beds and bedroom storage designed for rest and organization.' },
  { name: 'Office', icon: 'desk', description: 'Executive desks, storage cabinets, and ergonomic seating.' },
  { name: 'Cabinets', icon: 'cabinet', description: 'Custom cabinetry built around your home or commercial space.' },
  { name: 'Outdoor', icon: 'outdoor', description: 'Durable outdoor seating and patio furniture built for Pampanga weather.' },
  { name: 'Custom Furniture', icon: 'custom', description: 'Tailored designs for homes, offices, cafes, and commercial spaces.' },
]

export const products: Product[] = [
  { id: 1, name: 'Narra Dining Table', category: 'Dining', price: 18500, material: 'Solid Narra', dimensions: '180 x 90 x 76 cm', leadTime: '4-6 weeks', availability: 'In Stock', style: 'Modern Classic', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80', description: 'A statement dining table featuring warm narra wood grain, a clean silhouette, and durable construction designed for family gatherings.', location: 'Angeles City' },
  { id: 2, name: 'Acacia Coffee Table', category: 'Living Room', price: 9800, material: 'Acacia Wood', dimensions: '110 x 56 x 38 cm', leadTime: '3-4 weeks', availability: 'In Stock', style: 'Minimalist', image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80', description: 'A compact coffee table with a softened edge profile and a smooth finish suited for cozy living spaces.', location: 'San Fernando' },
  { id: 3, name: 'Modern TV Console', category: 'Living Room', price: 21400, material: 'Walnut Veneer', dimensions: '180 x 42 x 52 cm', leadTime: '5-7 weeks', availability: 'Made to Order', style: 'Contemporary', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80', description: 'A clean-lined media console with concealed storage and premium wood texture for modern homes.', location: 'Mabalacat' },
  { id: 4, name: 'Solid Wood Bed', category: 'Bedroom', price: 26800, material: 'Mahogany', dimensions: '200 x 180 x 45 cm', leadTime: '6-8 weeks', availability: 'Custom', style: 'Premium', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80', description: 'A sturdy wood bed frame with a warm finish and layered headboard detail tailored for elegant bedrooms.', location: 'Clark' },
  { id: 5, name: 'Executive Office Desk', category: 'Office', price: 32500, material: 'Mahogany + Steel', dimensions: '180 x 75 x 74 cm', leadTime: '4-6 weeks', availability: 'Made to Order', style: 'Executive', image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80', description: 'A premium workstation for growing businesses, featuring cable management and durable surfaces.', location: 'Porac' },
  { id: 6, name: 'Custom Kitchen Cabinet', category: 'Cabinets', price: 41900, material: 'Plywood + Laminate', dimensions: '300 x 60 x 220 cm', leadTime: '8-10 weeks', availability: 'Custom', style: 'Functional', image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80', description: 'Built for efficient kitchen storage with durable finishes and tailor-made cabinet sizing.', location: 'Bacolor' },
  { id: 7, name: 'Upholstered Sofa', category: 'Living Room', price: 28900, material: 'Pine + Fabric', dimensions: '240 x 90 x 84 cm', leadTime: '5-7 weeks', availability: 'Made to Order', style: 'Contemporary', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80', description: 'Comfort-driven seating with a structured silhouette and soft upholstery suited to family lounges.', location: 'Mexico' },
  { id: 8, name: 'Outdoor Dining Set', category: 'Outdoor', price: 23800, material: 'Teak Effect / Metal', dimensions: '240 x 100 x 76 cm', leadTime: '4-5 weeks', availability: 'Limited', style: 'Casual', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80', description: 'Weather-ready furniture for patios and terraces, built with lasting comfort and easy maintenance in mind.', location: 'Guagua' },
  { id: 9, name: 'Narra Console Table', category: 'Living Room', price: 14250, material: 'Solid Narra', dimensions: '140 x 42 x 76 cm', leadTime: '3-5 weeks', availability: 'In Stock', style: 'Classic', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80', description: 'A refined console table for entryways and living spaces that balances storage and elegance.', location: 'Angeles City' },
  { id: 10, name: 'L-Shape Workstation', category: 'Office', price: 36700, material: 'Plywood + Laminate', dimensions: '280 x 150 x 74 cm', leadTime: '6-8 weeks', availability: 'Made to Order', style: 'Modern', image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80', description: 'Designed for productivity and flexible office layout planning across growing teams.', location: 'San Fernando' },
  { id: 11, name: 'Rustic Dining Chairs', category: 'Dining', price: 3400, material: 'Solid Wood', dimensions: '47 x 52 x 92 cm', leadTime: '2-3 weeks', availability: 'In Stock', style: 'Rustic', image: 'https://images.unsplash.com/photo-1512212621149-107ffe572d2f?auto=format&fit=crop&w=1200&q=80', description: 'Comfortable, durable dining chairs with a handcrafted feel and natural wood finish.', location: 'Mabalacat' },
  { id: 12, name: 'Custom Wardrobe', category: 'Cabinets', price: 28600, material: 'MDF + Laminate', dimensions: '240 x 60 x 220 cm', leadTime: '5-7 weeks', availability: 'Custom', style: 'Minimal', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80', description: 'A built-in wardrobe solution for bedrooms, guest spaces, and compact apartment living.', location: 'Clark' },
  { id: 13, name: 'Pine Accent Chair', category: 'Living Room', price: 7200, material: 'Pine Wood', dimensions: '62 x 58 x 80 cm', leadTime: '2-4 weeks', availability: 'In Stock', style: 'Scandinavian', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80', description: 'A light, inviting accent chair that adds warmth to reading corners and lounges.', location: 'Porac' },
  { id: 14, name: 'Bistro Outdoor Table', category: 'Outdoor', price: 12100, material: 'Metal + Wood', dimensions: '120 x 70 x 75 cm', leadTime: '3-4 weeks', availability: 'Limited', style: 'Modern', image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80', description: 'A smart outdoor table with a compact footprint for cafes, balconies, and patios.', location: 'Bacolor' },
  { id: 15, name: 'Solid Mahogany Sideboard', category: 'Dining', price: 25400, material: 'Solid Mahogany', dimensions: '180 x 45 x 80 cm', leadTime: '5-6 weeks', availability: 'Made to Order', style: 'Traditional', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80', description: 'A sideboard solution for dining rooms and living spaces that need extra storage and character.', location: 'Guagua' },
  { id: 16, name: 'Corner Desk Suite', category: 'Office', price: 19800, material: 'Plywood + Veneer', dimensions: '150 x 120 x 74 cm', leadTime: '4-5 weeks', availability: 'In Stock', style: 'Compact', image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80', description: 'A practical corner workstation designed for home offices and hybrid work setups.', location: 'Mexico' },
  { id: 17, name: 'Contemporary Bed Headboard', category: 'Bedroom', price: 17300, material: 'Walnut Veneer', dimensions: '200 x 160 x 65 cm', leadTime: '4-6 weeks', availability: 'In Stock', style: 'Contemporary', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80', description: 'Statement bedroom furniture featuring a relaxed headboard and premium finish.', location: 'Angeles City' },
  { id: 18, name: 'Built-in Pantry', category: 'Cabinets', price: 33200, material: 'MDF + Laminate', dimensions: '280 x 60 x 240 cm', leadTime: '6-8 weeks', availability: 'Custom', style: 'Functional', image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80', description: 'Storage cabinetry tailored for kitchens, laundry rooms, and service areas.', location: 'San Fernando' },
  { id: 19, name: 'Leather Lounge Chair', category: 'Living Room', price: 16900, material: 'Leatherette + Wood', dimensions: '74 x 74 x 79 cm', leadTime: '4-5 weeks', availability: 'Limited', style: 'Luxury', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80', description: 'A lounge chair designed for welcoming seating with a plush, elevated finish.', location: 'Clark' },
  { id: 20, name: 'Patio Seating Set', category: 'Outdoor', price: 27900, material: 'Powder-Coated Metal', dimensions: '210 x 85 x 82 cm', leadTime: '5-7 weeks', availability: 'Custom', style: 'Resort', image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80', description: 'A stylish and durable outdoor seating set for hospitality and residential terraces.', location: 'Mexico' },
]

export const customers: Customer[] = [
  { id: 1, name: 'Maria Santos', phone: '+63 917 112 3456', email: 'maria.santos@gmail.com', location: 'Angeles City, Pampanga', orders: 2, quotes: 3, appointments: 1, inquiries: 2 },
  { id: 2, name: 'Ricardo Dela Cruz', phone: '+63 915 876 2201', email: 'ricardo.dc@gmail.com', location: 'San Fernando, Pampanga', orders: 1, quotes: 1, appointments: 2, inquiries: 1 },
  { id: 3, name: 'Ana Reyes', phone: '+63 922 431 9988', email: 'ana.reyes@yahoo.com', location: 'Mabalacat, Pampanga', orders: 4, quotes: 2, appointments: 1, inquiries: 3 },
  { id: 4, name: 'Julius Cruz', phone: '+63 999 455 1122', email: 'julius.cruz@outlook.com', location: 'Clark, Pampanga', orders: 3, quotes: 2, appointments: 2, inquiries: 2 },
  { id: 5, name: 'Liza Garcia', phone: '+63 920 987 3451', email: 'l.garcia@gmail.com', location: 'Mexico, Pampanga', orders: 5, quotes: 4, appointments: 3, inquiries: 4 },
  { id: 6, name: 'Ramon Navarro', phone: '+63 905 441 6578', email: 'ramon.n@gmail.com', location: 'Porac, Pampanga', orders: 2, quotes: 1, appointments: 1, inquiries: 2 },
  { id: 7, name: 'Cherry Ocampo', phone: '+63 918 642 9800', email: 'cherry.ocampo@gmail.com', location: 'Bacolor, Pampanga', orders: 1, quotes: 2, appointments: 2, inquiries: 3 },
  { id: 8, name: 'Benjie Villanueva', phone: '+63 906 300 9521', email: 'benjie.v@protonmail.com', location: 'Guagua, Pampanga', orders: 2, quotes: 2, appointments: 1, inquiries: 1 },
  { id: 9, name: 'Cecile Tan', phone: '+63 926 882 3417', email: 'cecil.tan@gmail.com', location: 'Bacolor, Pampanga', orders: 3, quotes: 3, appointments: 2, inquiries: 2 },
  { id: 10, name: 'Carlito Mendez', phone: '+63 919 551 7810', email: 'carlito.m@live.com', location: 'Angeles City, Pampanga', orders: 1, quotes: 1, appointments: 1, inquiries: 2 },
]

export const inquiries: InquiryThread[] = [
  { id: 'INQ-2026-001', customer: 'Maria Santos', location: 'Angeles City, Pampanga', inquiry: 'Custom dining table for 6-seater family meals', status: 'AI Assisted', productName: 'Narra Dining Table', messages: [
    { sender: 'customer', text: 'Hi, I saw the Narra dining table. Can I have a custom 6-seater version?' },
    { sender: 'assistant', text: 'Yes, we can accommodate custom dimensions. Would you like to request a quotation?' },
    { sender: 'admin', text: 'I can help with material, size, and finish selection for the custom dining set.' },
  ] },
  { id: 'INQ-2026-002', customer: 'Ricardo Dela Cruz', location: 'San Fernando, Pampanga', inquiry: 'Office desk with storage', status: 'In Progress', productName: 'Executive Office Desk', messages: [
    { sender: 'customer', text: 'Do you have an office desk for a small business setup?' },
    { sender: 'assistant', text: 'Yes, we have desk options with storage and can help with custom dimensions.' },
  ] },
  { id: 'INQ-2026-003', customer: 'Ana Reyes', location: 'Mabalacat, Pampanga', inquiry: 'Wardrobe and bedroom set', status: 'AI Assisted', productName: 'Custom Wardrobe', messages: [
    { sender: 'customer', text: 'We need a built-in wardrobe for a 3-bedroom setup.' },
    { sender: 'assistant', text: 'We can design a built-in wardrobe around your room dimensions and storage needs.' },
  ] },
  { id: 'INQ-2026-004', customer: 'Julius Cruz', location: 'Clark, Pampanga', inquiry: 'Outdoor dining set for café patio', status: 'Resolved', productName: 'Outdoor Dining Set', messages: [
    { sender: 'customer', text: 'We are looking for outdoor dining furniture for a terrace area.' },
    { sender: 'assistant', text: 'We can provide a custom outdoor dining set and installation support.' },
    { sender: 'admin', text: 'Customer was provided with a quote and selected a sample layout.' },
  ] },
  { id: 'INQ-2026-005', customer: 'Liza Garcia', location: 'Mexico, Pampanga', inquiry: 'Dining chairs for event venue', status: 'In Progress', productName: 'Rustic Dining Chairs', messages: [
    { sender: 'customer', text: 'Need durable dining chairs for a restaurant venue.' },
    { sender: 'assistant', text: 'We can help with bulk quantities and finishes for commercial use.' },
  ] },
  { id: 'INQ-2026-006', customer: 'Ramon Navarro', location: 'Porac, Pampanga', inquiry: 'Custom TV console for apartment', status: 'AI Assisted', productName: 'Modern TV Console', messages: [
    { sender: 'customer', text: 'Can I get a slim TV console for my apartment living room?' },
    { sender: 'assistant', text: 'Yes, we can do custom dimensions for your wall and television size.' },
  ] },
  { id: 'INQ-2026-007', customer: 'Cherry Ocampo', location: 'Bacolor, Pampanga', inquiry: 'Sofa and accent chair for home', status: 'Resolved', productName: 'Upholstered Sofa', messages: [
    { sender: 'customer', text: 'Interested in a cozy sofa for a family living room.' },
    { sender: 'assistant', text: 'We can share fabric options and layout recommendations based on your space.' },
    { sender: 'admin', text: 'A quotation was sent and approved by the customer.' },
  ] },
  { id: 'INQ-2026-008', customer: 'Benjie Villanueva', location: 'Guagua, Pampanga', inquiry: 'Patio seating for a resort', status: 'AI Assisted', productName: 'Patio Seating Set', messages: [
    { sender: 'customer', text: 'We need outdoor furniture for a resort lounge area.' },
    { sender: 'assistant', text: 'We can design weather-resistant outdoor seating for hospitality spaces.' },
  ] },
  { id: 'INQ-2026-009', customer: 'Cecile Tan', location: 'Bacolor, Pampanga', inquiry: 'Coffee table and side table set', status: 'In Progress', productName: 'Acacia Coffee Table', messages: [
    { sender: 'customer', text: 'Looking for a natural wood coffee table with matching side tables.' },
    { sender: 'assistant', text: 'We have wood-finish options and can match a design to your living room.' },
  ] },
  { id: 'INQ-2026-010', customer: 'Carlito Mendez', location: 'Angeles City, Pampanga', inquiry: 'Custom cabinet and kitchen organizer', status: 'AI Assisted', productName: 'Custom Kitchen Cabinet', messages: [
    { sender: 'customer', text: 'I need a custom cabinet for a small kitchen area.' },
    { sender: 'assistant', text: 'We can prepare a layout and quotation for your kitchen storage needs.' },
  ] },
]

export const quotationRequests: QuotationRequest[] = [
  { quoteNumber: 'QTN-2026-00128', customer: 'Maria Santos', furniture: 'Custom Dining Table', amount: 26500, date: '2026-09-22', status: 'Reviewing' },
  { quoteNumber: 'QTN-2026-00129', customer: 'Ricardo Dela Cruz', furniture: 'Executive Office Desk', amount: 34100, date: '2026-09-24', status: 'New' },
  { quoteNumber: 'QTN-2026-00130', customer: 'Ana Reyes', furniture: 'Built-in Wardrobe', amount: 29800, date: '2026-09-21', status: 'Quoted' },
  { quoteNumber: 'QTN-2026-00131', customer: 'Julius Cruz', furniture: 'Outdoor Dining Set', amount: 25900, date: '2026-09-20', status: 'Approved' },
  { quoteNumber: 'QTN-2026-00132', customer: 'Liza Garcia', furniture: 'Dining Chairs', amount: 18250, date: '2026-09-18', status: 'Reviewing' },
  { quoteNumber: 'QTN-2026-00133', customer: 'Ramon Navarro', furniture: 'Modern TV Console', amount: 23400, date: '2026-09-17', status: 'Quoted' },
  { quoteNumber: 'QTN-2026-00134', customer: 'Cherry Ocampo', furniture: 'Upholstered Sofa', amount: 31600, date: '2026-09-14', status: 'Approved' },
  { quoteNumber: 'QTN-2026-00135', customer: 'Benjie Villanueva', furniture: 'Patio Seating Set', amount: 27900, date: '2026-09-13', status: 'Rejected' },
]

export const appointments: Appointment[] = [
  { id: 'APT-2026-0042', customer: 'Maria Santos', date: '2026-09-30', time: '2:00 PM', type: 'Custom Furniture Consultation', status: 'Confirmed' },
  { id: 'APT-2026-0043', customer: 'Ricardo Dela Cruz', date: '2026-09-29', time: '10:30 AM', type: 'Product Viewing', status: 'Pending' },
  { id: 'APT-2026-0044', customer: 'Ana Reyes', date: '2026-09-28', time: '4:15 PM', type: 'Project Consultation', status: 'Confirmed' },
  { id: 'APT-2026-0045', customer: 'Julius Cruz', date: '2026-09-30', time: '11:00 AM', type: 'Product Viewing', status: 'Pending' },
  { id: 'APT-2026-0046', customer: 'Liza Garcia', date: '2026-09-27', time: '3:00 PM', type: 'Custom Furniture Consultation', status: 'Completed' },
  { id: 'APT-2026-0047', customer: 'Ramon Navarro', date: '2026-09-26', time: '9:45 AM', type: 'Project Consultation', status: 'Cancelled' },
]

export const orders: Order[] = [
  { orderNumber: 'ORD-2026-00431', customer: 'Maria Santos', total: 26400, status: 'For Confirmation', date: '2026-09-22' },
  { orderNumber: 'ORD-2026-00432', customer: 'Ana Reyes', total: 19100, status: 'Confirmed', date: '2026-09-20' },
  { orderNumber: 'ORD-2026-00433', customer: 'Ricardo Dela Cruz', total: 28400, status: 'In Production', date: '2026-09-18' },
  { orderNumber: 'ORD-2026-00434', customer: 'Julius Cruz', total: 21300, status: 'Ready for Delivery', date: '2026-09-17' },
  { orderNumber: 'ORD-2026-00435', customer: 'Liza Garcia', total: 17400, status: 'Confirmed', date: '2026-09-16' },
  { orderNumber: 'ORD-2026-00436', customer: 'Benjie Villanueva', total: 28600, status: 'For Confirmation', date: '2026-09-14' },
  { orderNumber: 'ORD-2026-00437', customer: 'Cherry Ocampo', total: 32800, status: 'In Production', date: '2026-09-11' },
  { orderNumber: 'ORD-2026-00438', customer: 'Cecile Tan', total: 20250, status: 'Ready for Delivery', date: '2026-09-09' },
  { orderNumber: 'ORD-2026-00439', customer: 'Ramon Navarro', total: 16800, status: 'Confirmed', date: '2026-09-07' },
  { orderNumber: 'ORD-2026-00440', customer: 'Carlito Mendez', total: 24100, status: 'For Confirmation', date: '2026-09-05' },
]

export const projects: Project[] = [
  { id: 1, name: 'Residential Dining Area', type: 'Dining', location: 'Angeles City, Pampanga', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80', description: 'Warm wood dining set for a family home with integrated lighting and compact lounge seating.' },
  { id: 2, name: 'Café Furniture Package', type: 'Commercial', location: 'San Fernando, Pampanga', image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80', description: 'Outdoor and indoor seating designed for a community café with durable, easy-to-maintain finishes.' },
  { id: 3, name: 'Office Fit-Out', type: 'Office', location: 'Clark, Pampanga', image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80', description: 'A clean, professional office environment with modular workstations and integrated storage.' },
  { id: 4, name: 'Custom Bedroom', type: 'Bedroom', location: 'Mexico, Pampanga', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80', description: 'A wood-toned bedroom suite designed around comfort, storage, and a restful atmosphere.' },
  { id: 5, name: 'Restaurant Tables', type: 'Dining', location: 'Mabalacat, Pampanga', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80', description: 'Durable dining tables and chairs configured for a busy family restaurant setting.' },
  { id: 6, name: 'Custom Cabinet Project', type: 'Cabinets', location: 'Guagua, Pampanga', image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80', description: 'Tailored cabinetry that balances functionality and clean, modern visual lines.' },
]

export const reviews: Review[] = [
  { customer: 'Maria Santos', project: 'Residential Dining Area', rating: 5, quote: 'The craftsmanship is excellent and the team helped us choose the right material and finish for our home.' },
  { customer: 'Julius Cruz', project: 'Office Fit-Out', rating: 5, quote: 'We appreciated the design guidance and how quickly the team turned our office requirements into a complete solution.' },
  { customer: 'Ana Reyes', project: 'Custom Bedroom', rating: 5, quote: 'Our wardrobe and bed set feels premium and fits our space perfectly.' },
  { customer: 'Ricardo Dela Cruz', project: 'Office Fit-Out', rating: 4, quote: 'Professional service and thoughtful layout recommendations for our growing team.' },
  { customer: 'Liza Garcia', project: 'Restaurant Tables', rating: 5, quote: 'The furniture is sturdy, elegant, and built to handle daily use without compromising style.' },
  { customer: 'Benjie Villanueva', project: 'Café Furniture Package', rating: 5, quote: 'The pieces look beautiful and the installation was handled very professionally.' },
  { customer: 'Cherry Ocampo', project: 'Custom Bedroom', rating: 4, quote: 'Strong communication all throughout the process and very helpful with finish options.' },
  { customer: 'Ramon Navarro', project: 'Office Fit-Out', rating: 5, quote: 'We got a custom solution that balances comfort, storage, and professional aesthetics.' },
]

export const adminOverview = {
  totalOrders: '₱184,500',
  pendingQuotes: 12,
  newInquiries: 24,
  appointmentsToday: 4,
  products: 126,
}

export const adminSalesData = [54, 72, 64, 88, 94, 118, 110, 126, 132, 118, 146, 150]
export const inquiryVolumeData = [18, 22, 26, 30, 36, 28, 41, 34, 39, 45, 52, 48]
export const popularProducts = [
  { name: 'Narra Dining Table', value: 92 },
  { name: 'Solid Wood Bed', value: 87 },
  { name: 'Custom Kitchen Cabinet', value: 82 },
  { name: 'Executive Office Desk', value: 79 },
  { name: 'Outdoor Dining Set', value: 74 },
]
export const quotationStats = [15, 12, 18, 23, 21, 26, 24, 17]
