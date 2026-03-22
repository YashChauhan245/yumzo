# 🍔 Yumzo - Food Delivery App

A full-stack food delivery platform built with modern web technologies.

## Tech Stack

| Layer      | Technology                          |
| ---------- | ----------------------------------- |
| Frontend   | React.js (Vite), CSS                |
| Backend    | Node.js, Express.js                 |
| Database   | PostgreSQL (hosted on Supabase)     |
| ORM        | Prisma                              |
| Auth       | JWT (Access + Refresh Tokens)       |
| Real-time  | Socket.io                           |

## Project Structure

```
yumzo/
├── backend/
│   ├── prisma/          # Database schema & migrations
│   └── src/
│       ├── config/      # App configuration
│       ├── controllers/ # Route handlers (business logic)
│       ├── db/          # Database seed data
│       ├── middleware/   # Auth middleware, validation
│       ├── models/       # Database queries (Prisma)
│       ├── routes/       # API route definitions
│       ├── services/     # Business logic layer
│       ├── utils/        # Helper functions
│       └── server.js     # Entry point
│
├── frontend/
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── context/     # React Context (Auth, Cart)
│       ├── pages/       # App pages (Home, Menu, Cart)
│       ├── services/    # API call functions
│       └── styles/      # CSS stylesheets
│
└── README.md
```

## How to Run

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on → `http://localhost:5000`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on → `http://localhost:5173`

## API Endpoints

### Auth
- `POST /api/auth/signup` — Register a new user
- `POST /api/auth/login` — Login & get JWT token
- `GET  /api/auth/me` — Get logged-in user info *(protected)*

### Restaurants
- `GET /api/restaurants` — List all restaurants
- `GET /api/restaurants/:id/menu` — Get restaurant menu

### Cart *(protected)*
- `GET    /api/cart` — View cart
- `POST   /api/cart` — Add item to cart
- `PUT    /api/cart` — Update cart item
- `DELETE /api/cart` — Remove item from cart

### Orders *(protected)*
- `GET  /api/orders` — View order history
- `POST /api/orders` — Place a new order

### Payments *(protected)*
- `GET  /api/payments/:orderId` — Get payment status
- `POST /api/payments/:orderId` — Make payment

## Key Features

- 🔐 **JWT Authentication** — Secure login with access & refresh tokens
- 🍕 **Restaurant Browsing** — Browse restaurants and their menus
- 🛒 **Cart Management** — Add, update, remove items
- 📦 **Order Placement** — Place orders and track history
- 🎬 **Reels Section** — Instagram-style food reels
- 🌙 **Dark Theme** — Modern dark UI design
- 📱 **Responsive** — Works on mobile and desktop

## Environment Variables

Create a `.env` file in `backend/`:

```env
DATABASE_URL=your_supabase_postgresql_url
PORT=5000
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=30d
ALLOWED_ORIGINS=http://localhost:5173
```

Create a `.env` file in `frontend/`:

```env
VITE_API_URL=http://localhost:5000/api
```
