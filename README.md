# Yumzo - Full-Stack Food Delivery App

Yumzo is a full-stack food delivery platform with customer ordering, driver delivery workflow, and short food reels.

## Project Overview

- Customer app: browse restaurants, add to cart, place and track orders, complete payments.
- Driver app: login, view available orders, accept delivery, update order status.
- Reels: authenticated feed with likes and comments.
- Backend uses a role-based API structure with separate namespaces:
	- `/api/user/*`
	- `/api/driver/*`
	- `/api/reels/*`

## Tech Stack

### Frontend
- React 19 + Vite
- React Router
- Axios
- Tailwind CSS v4
- GSAP (used in reels interactions)

### Backend
- Node.js + Express
- Prisma ORM
- PostgreSQL (Supabase-hosted)
- JWT authentication
- bcryptjs
- express-validator
- Socket.io

### Database
- Main DB engine: PostgreSQL
- Hosted on: Supabase
- Accessed via: Prisma Client

## Key Features

### Customer
- Signup/Login with JWT
- Browse restaurants and menus
- Cart add/update/remove/clear
- Place orders and view order history
- Payment processing (mock gateway)

### Driver
- Dedicated driver login
- Available orders list
- Accept order
- Assigned orders list
- Update delivery status (`picked_up`, `out_for_delivery`, `delivered`)

### Reels
- Authenticated reels feed
- Toggle like
- View/add comments

## Folder Structure (Simplified)

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
			server.js

	frontend/
		src/
			components/
			context/
			pages/
				driver/
			services/
			styles/
			App.jsx
```

## Local Setup

### 1. Install dependencies

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

### 2. Configure environment variables

Create `backend/.env`:

```env
DATABASE_URL=your_supabase_postgres_connection_string
PORT=5000
JWT_SECRET=your_access_token_secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRES_IN=30d
ALLOWED_ORIGINS=http://localhost:5173
```

Create `frontend/.env`:

```env
VITE_API_URL=/api
```

### 3. Prisma setup

```bash
npm --prefix backend run prisma:generate
npm --prefix backend run prisma:push
```

Optional seed data:

```bash
npm --prefix backend run seed:demo
npm --prefix backend run seed:reels
```

### 4. Run backend and frontend

```bash
npm run dev:backend
npm run dev:frontend
```

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`

## Basic API Overview

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Customer APIs
- `GET /api/user/restaurants`
- `GET /api/user/restaurants/:id/menu`
- `GET/POST/PUT/DELETE /api/user/cart...`
- `POST /api/user/orders`
- `GET /api/user/orders`
- `GET /api/user/orders/:id`
- `POST /api/user/payments/:orderId`
- `GET /api/user/payments/:orderId`

### Driver APIs
- `POST /api/driver/login`
- `GET /api/driver/orders/available`
- `POST /api/driver/orders/:orderId/accept`
- `GET /api/driver/orders/assigned`
- `PATCH /api/driver/orders/:orderId/status`

### Reels APIs
- `GET /api/reels`
- `POST /api/reels/:reelId/like`
- `GET /api/reels/:reelId/comments`
- `POST /api/reels/:reelId/comments`

## Notes

- Customer and driver pages are role-protected in frontend routes.
- The app is intentionally kept beginner-friendly with straightforward controller/service patterns.
