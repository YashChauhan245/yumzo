# Yumzo - Full Stack Food Delivery Project

Yumzo is a resume-ready food delivery app built with React, Node.js, Express, Prisma, and Supabase PostgreSQL.

It includes three major roles:

- Customer: browse restaurants, place orders, track status.
- Driver: accept and manage delivery requests.
- Admin: manage restaurants, menu, orders, and platform stats.

## What Is Implemented

### Customer Side

- Auth flow with JWT (signup/login/me).
- Restaurant listing and restaurant menu pages.
- Cart flow: add, update, remove, clear.
- Place order and see order history.
- Payment endpoint integration (mock gateway).
- Order status notifications (polling-based).
- Group ordering room flow:
  - Create room and share room code
  - Join room and add items collaboratively
  - Host checkout control with split-bill style summary
- Smart combo / diet planning flow:
  - User can pick a goal (for example: high protein or budget under amount)
  - Backend returns a practical combo suggestion from restaurant menu

### Driver Side

- Dedicated driver login.
- Available orders queue.
- Accept order.
- Reject assigned order with reason.
- Assigned orders lifecycle updates:
  - preparing -> picked_up -> out_for_delivery -> delivered
- Rejection puts the order back to queue for other drivers.

### Admin Side

- Dashboard cards and chart-style UI widgets.
- Manage restaurants (create, edit, delete).
- Manage menu items (create, edit, delete).
- Orders overview and status updates.
- Cancel order flow with reason capture (saved in notes).

### Reels

- Authenticated reels feed.
- Like/unlike and comments.
- Light mode visual polish:
  - Softer video overlay contrast
  - Brighter action pills with better readability on mobile

### Recent Final Improvements

- Pagination added with simple page + limit approach:
  - Restaurants list
  - Customer order history
  - Reels feed
  - Admin restaurants list
  - Admin menu list
  - Admin orders list
- Address management added for customers:
  - Save address
  - Update address
  - Delete address
  - Mark default address
  - Select saved address during checkout
- Ratings and reviews added:
  - One review per user per restaurant
  - 1-5 star rating with optional text review
  - Average rating displayed in restaurant UI
- Driver UX improvements:
  - Cleaner card-based dashboard sections for available and assigned orders
  - Clear Accept and Deliver actions
- Customer order tracking improvements:
  - Better order progress timeline in UI
- Customer order cancellation:
  - Customer can cancel own order from Orders page
  - Allowed only for pending and confirmed orders
  - Cancellation reason (optional) is saved in notes
- Order role responsibility tightened:
  - Admin can manage early-stage order decisions (pending, confirmed, cancelled)
  - Delivery stage statuses are handled from driver flow
- UI cleanup:
  - Consistent minimal dark theme
  - Reduced visual noise on driver pages
- Reels UX update:
  - Like icon is white by default and red when liked
- Cart UX update:
  - Cart nav button shows live item count and updates instantly after add-to-cart
- Cleanup:
  - Removed old backend test files for a simpler beginner-level setup
  - Removed empty unused frontend folder

## Architecture Notes

- Backend API namespaces:
  - /api/auth/*
  - /api/user/*
  - /api/driver/*
  - /api/admin/*
- Code structure follows simple controller + service layering.
- Supabase PostgreSQL is accessed through Prisma Client.
- Legacy DB compatibility handling is included in backend scripts.

## Tech Stack

### Frontend

- React 19
- Vite
- React Router
- Axios
- Tailwind CSS v4
- react-hot-toast

### Backend

- Node.js
- Express
- Prisma ORM
- PostgreSQL (Supabase)
- JWT + bcryptjs
- express-validator
- Socket.io

## Project Structure (Simplified)

```txt
yumzo/
  backend/
    prisma/
      schema.prisma
    src/
      config/
      controllers/
      middleware/
      routes/
      services/
      db/
      scripts/
      server.js

  frontend/
    src/
      components/
      context/
      pages/
      services/
      styles/
      App.jsx
```

## Local Setup

### 1) Install dependencies

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

### 2) Backend env

Create backend/.env:

```env
DATABASE_URL=your_supabase_postgres_connection_string
PORT=5000
JWT_SECRET=your_access_token_secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRES_IN=30d
ALLOWED_ORIGINS=http://localhost:5173
ADMIN_EMAIL=owner@example.com
```

Admin access note:

- ADMIN_EMAIL is enforced for admin role checks.
- Gmail-style canonical matching is handled in role checks.

### 3) Frontend env

Create frontend/.env:

```env
VITE_API_URL=/api
```

### 4) Prisma and database setup

```bash
npm --prefix backend run prisma:generate
npm --prefix backend run prisma:push
```

If you are using an older DB state, run:

```bash
npm --prefix backend run db:compat
```

Optional seeds:

```bash
npm --prefix backend run seed:demo
npm --prefix backend run seed:reels
```

### 5) Run app

```bash
npm --prefix backend run dev
npm --prefix frontend run dev
```

- Backend: <http://localhost:5000>
- Frontend: <http://localhost:5173>

## Useful Scripts

### Root Scripts

- npm run dev:backend
- npm run dev:frontend
- npm run build

### Backend Scripts

- npm run dev
- npm run seed:demo
- npm run seed:reels
- npm run db:compat
- npm run smoke:roles
- npm run prisma:generate
- npm run prisma:push
- npm run test

Current note:

- backend test script is a placeholder that prints: "No backend tests configured"

### Frontend Scripts

- npm run dev
- npm run build
- npm run lint
- npm run preview

## API Snapshot

### Auth

- POST /api/auth/signup
- POST /api/auth/login
- GET /api/auth/me

### Customer

- GET /api/user/restaurants
- GET /api/user/restaurants/:id/menu
- GET /api/user/restaurants/:id/reviews
- POST /api/user/restaurants/:id/reviews
- GET/POST/PUT/DELETE /api/user/cart...
- POST /api/user/orders
- GET /api/user/orders
- GET /api/user/orders/:id
- PATCH /api/user/orders/:id/cancel
- POST /api/user/group-orders/rooms
- POST /api/user/group-orders/rooms/join
- GET /api/user/group-orders/rooms/:roomCode
- POST /api/user/group-orders/rooms/:roomCode/items
- POST /api/user/group-orders/rooms/:roomCode/checkout
- POST /api/user/restaurants/:id/smart-combo
- GET /api/user/addresses
- POST /api/user/addresses
- PUT /api/user/addresses/:addressId
- DELETE /api/user/addresses/:addressId
- POST /api/user/payments/:orderId
- GET /api/user/payments/:orderId

### Driver

- POST /api/driver/login
- GET /api/driver/orders/available
- POST /api/driver/orders/:orderId/accept
- POST /api/driver/orders/:orderId/reject
- GET /api/driver/orders/assigned
- PATCH /api/driver/orders/:orderId/status

### Admin

- GET /api/admin/dashboard
- GET /api/admin/restaurants
- POST /api/admin/restaurants
- PUT /api/admin/restaurants/:restaurantId
- DELETE /api/admin/restaurants/:restaurantId
- GET /api/admin/menu
- POST /api/admin/menu
- PUT /api/admin/menu/:menuItemId
- DELETE /api/admin/menu/:menuItemId
- GET /api/admin/orders
- PATCH /api/admin/orders/:orderId/status


