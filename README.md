# General Auto Electric - Multi-Project Application

This repository contains three independent Next.js applications for General Auto Electric's business operations.

## Project Structure

```
my-app/
├── admin-panel/       # Admin dashboard (Port 3002)
├── billing-portal/    # Billing system (Port 3003)
├── frontend/          # Customer-facing website (Port 3001)
└── README.md
```

## Projects Overview

### 1. Frontend (Customer Website)
**Port:** 3001  
**Purpose:** Public-facing e-commerce website for customers to browse products and contact the business.

**Features:**
- Product catalog
- Product details
- Contact page
- Responsive design

### 2. Admin Panel
**Port:** 3002  
**Purpose:** Backend management system for administrators to manage products, users, and analytics.

**Features:**
- Product management (CRUD operations)
- User management
- Dashboard analytics
- Authentication system

### 3. Billing Portal
**Port:** 3003  
**Purpose:** Dedicated billing and invoicing system for processing transactions.

**Features:**
- Create bills/invoices
- Product selection
- GST calculations
- Bill history
- Debit management
- Authentication system

## Getting Started

Each project is completely independent with its own dependencies and configuration.

### Initial Setup

Navigate to each project directory and install dependencies:

```bash
# Install frontend dependencies
cd frontend
npm install

# Install admin-panel dependencies
cd ../admin-panel
npm install

# Install billing-portal dependencies
cd ../billing-portal
npm install
```

### Running Individual Projects

**Run Frontend:**
```bash
cd frontend
npm run dev
```
Visit: [http://localhost:3001](http://localhost:3001)

**Run Admin Panel:**
```bash
cd admin-panel
npm run dev
```
Visit: [http://localhost:3002](http://localhost:3002)

**Run Billing Portal:**
```bash
cd billing-portal
npm run dev
```
Visit: [http://localhost:3003](http://localhost:3003)

### Running All Projects Simultaneously

You can run all three projects at the same time in separate terminals:

```bash
# Terminal 1
cd frontend && npm run dev

# Terminal 2
cd admin-panel && npm run dev

# Terminal 3
cd billing-portal && npm run dev
```

## Project Dependencies

All three projects use:
- **Next.js** (latest) - React framework
- **React** (latest) - UI library
- **TypeScript** (latest) - Type safety
- **Tailwind CSS** (latest) - Styling

## Authentication

**Admin Panel:**
- Email: `admin@demo.com`
- Password: `admin123`

**Billing Portal:**
- Email: `billing@demo.com`
- Password: `billing123`

## Building for Production

Build each project independently:

```bash
# Build frontend
cd frontend && npm run build

# Build admin-panel
cd admin-panel && npm run build

# Build billing-portal
cd billing-portal && npm run build
```

## Starting Production Servers

After building, start production servers:

```bash
# Start frontend production server
cd frontend && npm start

# Start admin-panel production server
cd admin-panel && npm start

# Start billing-portal production server
cd billing-portal && npm start
```

## Notes

- **Root node_modules folder:** There may be a leftover `node_modules` folder at the root level. This can be safely deleted manually (close all running processes first).
- Each project maintains its own state using localStorage.
- Projects can share data through localStorage keys (e.g., products added in admin-panel are visible in billing-portal).
- All projects are configured to use different ports to avoid conflicts.

## Tech Stack

- **Framework:** Next.js 15.x
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Hooks + localStorage
- **UI Components:** Custom components with Tailwind

## Development

Each project follows Next.js 13+ App Router conventions:
- `/app` directory for routes
- `/components` for reusable UI components
- `/lib` for utilities, types, and data management

## Support

For issues or questions, please refer to individual project documentation or contact the development team.
