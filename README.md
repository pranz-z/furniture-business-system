# Furniture Business Platform

This project is a furniture business demo and operations platform designed to connect the customer shopping journey with internal sales, quotation, appointment, and order management workflows. It combines storefront browsing, custom product requests, customer account experiences, and an administrative dashboard into a single interactive interface.

A modern furniture business platform designed to connect the customer shopping experience with quotation, appointment, order, inventory, and administrative workflows.

## Overview

Furniture businesses often need more than a standard online store. They may sell fixed-price products alongside made-to-order and custom furniture, manage quote requests, coordinate showroom visits, handle customer inquiries, track order production stages, and maintain staff-facing operational visibility. This repository brings those workflows together in a single demo platform so that customer actions and business operations can be viewed in the same system.

This implementation is built as a front-end business workflow prototype for a Pampanga, Philippines-based furniture company. It demonstrates how a customer can browse products, request a quote, book an appointment, place an order, and then see administrative updates reflected in the same shared state model.

## Technology Stack

This repository currently uses:

- React 19
- TypeScript
- Vite
- CSS for the custom interface styling
- Browser localStorage for state persistence
- Mock data for catalog, customer, quotation, order, and inquiry records

This is not a deployed production backend or a live multi-user system. The current application is a local interactive demo designed to simulate the flow of a furniture business platform in the browser.

## Key Features

### Customer Experience

- Furniture catalog and featured product sections
- Product search and filtering by category, material, price, and availability
- Product detail views
- Shopping cart with quantity controls and summary totals
- Checkout flow with a shipping/delivery form
- Customer account dashboard with overview, orders, quotes, appointments, saved products, notifications, and profile views
- Custom furniture quotation requests
- Product inquiry and customer support chat behavior
- Appointment booking for showroom visits or consultations
- Order confirmation flow
- Saved products feature
- Customer reviews and testimonials
- Notification feed for updates relevant to the customer

### Business / Admin

- Admin dashboard overview
- Quote management with status updates
- Inquiry management and status changes
- Appointment management and scheduling updates
- Order status updates and tracking
- Customer activity and notification tracking
- Product and catalog-driven sales overview panels
- Review and operations reporting-style data cards
- Shared state updates that reflect customer actions in the admin interface

## Customer Workflow

Customer discovers the business
↓
Browses the furniture catalog
↓
Views product details and pricing
↓
Adds items to cart or requests a custom quote
↓
Books a showroom appointment when needed
↓
Places an order through checkout
↓
Tracks order and quote status in the customer account
↓
Receives notifications and updates from the business
↓
Leaves a review after the purchase or service experience

## Business Workflow

Customer inquiry or quote request
↓
Customer action is captured in the shared demo state
↓
Admin sees the inquiry, quote, or appointment in the dashboard
↓
Staff updates the quote, inquiry, or order status
↓
Customer sees the status change reflected in their account view
↓
Order progresses through operational stages
↓
Delivery and follow-up are coordinated by the business
↓
Customer review and feedback complete the cycle

## Interactive Demo

This project is designed around connected customer and admin workflows in the same browser-based application. The underlying state is managed in the shared demo service layer and persisted in browser localStorage, which lets the interface behave like a connected system without requiring a real backend database or API.

Examples of the implemented interaction model:

- Customer submits a quotation request → Admin receives it in the quotations section
- Admin updates a quotation status → Customer sees the updated status in the account dashboard
- Customer sends a message via chat → The interaction is displayed in the customer experience and admin context
- Customer books an appointment → Admin sees the appointment and can update its status
- Customer places an order → Admin can change its order stage in the dashboard and the customer sees the latest state

Current implementation characteristics:

- Shared state is managed in the browser via localStorage
- Mock data is used as the baseline business data
- No real backend API, database, authentication, or production deployment is implemented in this repository

## Screenshots / Demo

Screenshots are not currently included in the repository, but the following sections are represented in the current interface:

### Customer Experience

```text
Add screenshots here:
- Homepage
- Product catalog
- Product detail view
- Shopping cart
- Checkout flow
- Custom quote request
- Customer account dashboard
- Order confirmation
```

### Admin Experience

```text
Add screenshots here:
- Dashboard overview
- Quote management
- Inquiry list
- Appointment management
- Order status controls
```

## Project Structure

```text
.
├── public/
├── src/
│   ├── assets/
│   ├── data/
│   │   └── mockData.ts
│   ├── services/
│   │   ├── aiService.ts
│   │   └── demoService.ts
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
├── .gitignore
├── .oxlintrc.json
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the local development server:

```bash
npm run dev
```

3. Build the production bundle:

```bash
npm run build
```

4. Optionally preview the production build locally:

```bash
npm run preview
```

## Available Scripts

```bash
npm run dev      # Start Vite development server
npm run build    # Type-check and build the project for production
npm run preview  # Preview the production build locally
npm run lint     # Run the project linter
```

## Scope and Limitations

This repository demonstrates a realistic furniture business workflow in a browser-based prototype. It is intended for product presentation, UI flow validation, stakeholder walkthroughs, and business process storytelling.

The current application does not include:

- a real backend server
- a production database
- user authentication
- payment processing
- email/SMS notifications
- inventory reconciliation with a managed database
- real-time multi-user collaboration

## Planned / Future Improvements

The following items are intended as future enhancements and are not currently implemented in this repository:

- Real backend API and database layer
- Authentication and role-based admin access
- Inventory tracking with stock levels and stock movement history
- Payment processing integration
- Email and SMS notifications
- PDF quote generation and document export
- Real scheduling and calendar synchronization
- Production management and manufacturing workflows
- Multi-location inventory and fulfillment support
- Search and filtering backed by a data service
- Deployment pipeline for staging and production environments

## Summary

This project demonstrates how a furniture business can unify the customer experience and internal operations in a single digital workflow. It is positioned as a polished front-end prototype for product discovery, quoting, appointments, orders, and admin management, with the shared-state interaction model intentionally designed to show how customer actions and operational updates can work together in one system.
