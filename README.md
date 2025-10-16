## NeuroBuy — Multivendor E‑Commerce & Logistics (Cameroon ↔ China)

NeuroBuy is a multivendor e‑commerce platform built on Next.js + Supabase + Vercel. It enables product browsing, carts, checkout (orders), vendor storefronts, and logistics tracking, aligned with the project SRS and timing plan.

### Tech Stack
- Frontend: Next.js (App Router), React, TailwindCSS
- Backend/DB: Supabase (PostgreSQL, Auth, Storage, Realtime)
- Hosting: Vercel (frontend + API routes)

### Environment Variables
Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_or_anon_key
```

The code accepts either `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### Local Development
```
npm install
npm run dev
```
Dev server runs at http://localhost:3000 (or the next free port). If another process uses 3000, Next.js will choose 3001/3002.

### Supabase Schema & Seeding
- Apply `DOC/supabase_schema.sql` in Supabase SQL editor (tables: stores, products, orders, order_items, logistics, shipments, payments; RLS placeholders enabled).
- Seed products locally:

```
curl -X POST http://localhost:3001/api/seed
```

### Implemented (Phases 3–5)
- Product Catalog & Details: `/products`, `/products/[id]`
- Cart (localStorage): `/cart` (add/update/remove)
- Checkout API: `POST /api/orders` (creates `orders` + `order_items`; requires signed‑in user)
- Vendor Storefront: `/vendors/[vendorId]`
- Order Tracking: `/tracking/[orderId]`
- Dashboards:
  - Customer: `/dashboard/customer` (recent orders)
  - Vendor: `/dashboard/vendor` (vendor products)
  - Logistics: `/dashboard/logistics` (update shipment status via `PATCH /api/shipments`)
  - Admin: `/dashboard/admin` (skeleton)

### How to Test (Phases 3–5)
1) Ensure `.env.local` is set and dev server is running.
2) Apply schema and seed products.
3) Browse `/products` → open a product → Add to cart → `/cart`.
4) Sign in via the starter auth pages (`/auth/login` or `/auth/sign-up`).
5) Checkout on `/cart` to create an order; copy the `orderId` from the alert.
6) Tracking: `/tracking/[orderId]`. Update status from `/dashboard/logistics`.
7) Vendor storefront: assign a product’s `vendor_id` to your user id in Supabase, then open `/vendors/[vendorId]` or `/dashboard/vendor` when signed in.

### Deployment (Vercel)
- Set env vars in Vercel Project → Settings → Environment Variables for Production/Preview:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Configure Supabase Auth Redirect URLs to include your domains (local + Vercel).
