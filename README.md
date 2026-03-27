# Virasat Storefront

Virasat Storefront is a premium ethnicwear ecommerce platform built for Banarasi and apparel brands that want a sellable, brand-ready digital commerce product instead of a basic catalog website.

This project combines:

- a customer-facing storefront
- customer authentication and account management
- product catalog, cart, and checkout flows
- custom design request workflows
- customer-to-admin live support chat
- admin operations for catalog, orders, customers, reviews, and support
- super-admin controls for owner-level business management

The goal is to make this codebase usable as a white-label fashion commerce product for brands that need both a polished shopping experience and a backend operations console.

## Product vision

This project is designed for brands that sell:

- kurtis
- sarees
- lehengas
- dupattas
- blouses
- co-ord sets
- festive and custom apparel

The customer experience is intentionally separated from the business consoles.

- Customers see a clean shopping and account experience.
- Admins see an operations dashboard for day-to-day execution.
- Super admins see a business control tower for sensitive settings and ownership controls.

## Core product areas

## 1. Storefront

The storefront is the public shopping surface of the platform.

Main capabilities:

- homepage and collection-led merchandising
- product listing page with catalog browsing
- product detail page with imagery, pricing, and purchase intent
- cart and checkout flow
- category-driven browsing
- product variants through size and color combinations
- featured and active product controls from admin

## 2. Customer account

The customer dashboard is a buyer-focused account area, not an ERP screen.

Main capabilities:

- account home
- order tracking
- saved addresses
- wishlist
- reviews
- custom design requests
- support chat
- notifications
- profile management

Design goals:

- minimal and premium visual style
- mobile-friendly account navigation
- fast return to shopping
- clear separation from admin or business tools

## 3. Custom design workflow

This project supports made-to-order and inquiry-based fashion requests.

Customer side:

- choose product type such as saree, kurti, lehenga, blouse, or dupatta
- enter fabric, weave, occasion, fit, neckline, sleeve, and size notes
- share measurements
- set quantity, budget, and delivery deadline
- upload inspiration or reference images
- review submitted custom design briefs

Admin side:

- review all custom design requests
- update status
- add admin notes
- estimate pricing
- upload admin reference images or suggested design directions

This makes the platform usable for both ready-to-buy inventory and design-led boutique orders.

## 4. Live support and product inquiry chat

The platform includes a support chat layer between customer and admin.

Customer side:

- create a support ticket
- link the inquiry to a product when needed
- continue a live conversation in the same thread
- ask about products, delivery, order issues, or styling questions

Admin side:

- see all customer support threads
- open a live conversation
- update ticket status and priority
- reply in real time
- manage support as part of daily operations

This moves the project beyond a static ecommerce site into a service-ready commerce platform.

## 5. Admin operations console

The admin dashboard is meant for daily business execution.

Admin modules:

- overview
- products
- inventory
- orders
- coupons
- custom designs
- support
- reviews
- customers

Admin responsibilities:

- manage product catalog and imagery
- manage stock and variants
- review and process orders
- respond to customer chat and product inquiries
- handle custom design requests
- monitor review activity
- manage customer-facing commerce execution

## 6. Super admin control tower

The super admin console isolates sensitive business controls from normal admin users.

Super admin modules:

- owner overview
- team and access
- brand control
- orders
- customers
- catalog
- logistics

Super admin responsibilities:

- manage access roles
- control brand-level settings
- oversee operations across the business
- act as owner-level operator for the platform

## Roles and portal behavior

### Customer

- login route: `/auth`
- customer auth supports Google and email/password
- after login, customers are sent to `/shop`
- customer dashboard route: `/dashboard`

### Admin

- login route: `/admin/login`
- admin login is email/password only
- admin dashboard route: `/admin`
- business-only access, hidden from normal customer flow

### Super admin

- sign-in route: `/superadmin`
- dashboard route: `/super-admin`
- super admin login is email/password only
- owner-only access with elevated controls

## Route structure

### Public routes

- `/` : storefront home
- `/auth` : customer login and signup
- `/admin/login` : admin login
- `/superadmin` : super admin login
- `/shop` : product listing
- `/product/:slug` : product detail page
- `*` : 404 fallback

### Protected customer routes

- `/checkout`
- `/dashboard`

### Protected business routes

- `/admin`
- `/super-admin`

## Customer dashboard flow

The customer dashboard is structured around a simple buyer journey.

### Account Home

- fast return to shopping
- recent orders summary
- account stats
- quick links to wishlist, custom design, and support

### My Orders

- order history
- order items
- status timeline
- shipment details
- tracking information when available

### Addresses

- saved address book
- shipping and billing defaults
- delivery details reuse for checkout

### Wishlist

- saved products for later purchase

### Reviews

- submitted product reviews
- approval status visibility

### Custom Designs

- create a detailed design brief
- upload reference images
- review admin notes and estimated pricing
- see admin-suggested design option images

### Support

- open a support conversation
- choose general support or product-linked support
- continue live message thread with admin

### Notifications

- customer alerts and updates

### Profile

- buyer profile details
- contact information
- delivery information snapshot

## Admin operations flow

The admin console is organized for daily operational work.

### Overview

- revenue snapshot
- total orders
- customer count
- product count
- low stock alerts
- pending order visibility
- payment and delivery partner monitoring

### Product management

- create and edit products
- manage product images
- assign categories
- define fabrics, sizes, colors
- maintain active and featured product states

### Inventory

- stock review
- low stock awareness
- operational catalog monitoring

### Orders

- order list and detail handling
- status progression
- shipment visibility
- delivery monitoring

### Custom designs

- review design briefs
- update status
- add internal notes
- estimate pricing
- upload admin-side design suggestions

### Support

- open live customer chats
- respond to support threads
- set ticket status and priority

### Reviews

- view customer reviews
- manage moderation workflow

### Customers

- browse customer data and activity-linked records

## Super admin flow

The super admin portal is the owner layer.

It exists to isolate sensitive decisions from day-to-day admin operations.

Main flow:

- review owner overview metrics
- manage team roles and access
- update brand settings
- oversee catalog and customers
- monitor logistics and business direction

## Data and backend structure

The project uses Supabase as the backend layer.

Main backend responsibilities:

- authentication
- role-based access control
- relational data storage
- storage buckets for media uploads
- realtime support chat updates

Key data domains include:

- `profiles`
- `user_roles`
- `categories`
- `products`
- `product_variants`
- `orders`
- `order_items`
- `customer_addresses`
- `custom_designs`
- `support_tickets`
- `support_messages`
- `notifications`
- `payment_orders`
- `order_shipments`
- `shipment_events`
- `delivery_providers`

## Current migration strategy

SQL migrations are stored in:

- `supabase/migrations`

Important recent migrations:

- `20260328110000_ecommerce_productization_foundation.sql`
- `20260328123000_admin_bootstrap_helpers.sql`
- `20260328143000_admin_signup_automation.sql`
- `20260328150000_bootstrap_admin_promotion.sql`
- `20260328159000_add_super_admin_to_app_role.sql`
- `20260328160000_super_admin_roles_and_design_briefs.sql`
- `20260328170000_access_seed_accounts.sql`
- `20260328180000_seed_catalog_products.sql`
- `20260328193000_support_chat_and_design_assets.sql`

These migrations cover:

- productization foundation tables
- admin and super admin bootstrap
- seeded access accounts
- catalog seed data
- support chat
- custom design reference image infrastructure

## Storage buckets

The project currently uses storage for media uploads.

Primary buckets:

- `product-images`
- `design-reference-images`

## Local development setup

### Requirements

- Node.js
- npm
- Supabase project credentials

### Install

```sh
npm install
```

### Run locally

```sh
npm run dev
```

### Production build

```sh
npm run build
```

## Environment variables

Typical environment values used by the project:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TEST_ADMIN_EMAIL`
- `TEST_ADMIN_PASSWORD`
- `TEST_ADMIN_FULL_NAME`

Use service-role values only on trusted backend or local admin bootstrap flows.

## Useful scripts

```sh
npm run dev
npm run build
npm run test
npm run lint
npm run preview
npm run routes:check
npm run migrations:check
npm run admin:bootstrap
npm run demo:bootstrap
```

## Demo and bootstrap workflow

The project includes helper scripts and migrations for:

- demo customer accounts
- demo admin accounts
- demo super admin account
- admin bootstrap setup

This makes it easier to demonstrate the full product to a client without manually assigning every role from the database.

## Architecture summary

Frontend:

- React
- Vite
- TypeScript
- Tailwind CSS
- Framer Motion
- TanStack Query

Backend:

- Supabase Auth
- Supabase Database
- Supabase Realtime
- Supabase Storage

Application style:

- monolith-style frontend application
- role-based portal separation
- modular dashboard components
- ecommerce + service workflow hybrid

## What this project is meant to become

This project is not just a shopping site.

It is intended to be a sellable fashion commerce platform that can support:

- direct-to-consumer selling
- design consultation
- support operations
- multi-role admin handling
- owner-level control
- white-label brand deployment

That makes it suitable for boutique apparel brands, Banarasi labels, ethnicwear houses, and custom fashion businesses that need both commerce and operational depth.
