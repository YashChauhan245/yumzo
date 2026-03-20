# Yumzo - Full Stack Food Delivery App

Yumzo is a beginner-friendly full stack food delivery project with:

- Backend: Node.js, Express, PostgreSQL (Supabase), JWT auth
- Frontend: React (Vite), Tailwind CSS, Axios, protected routes

## Project structure

- `backend/` - REST API, DB models, JWT middleware, tests
- `frontend/` - React app with auth pages and dashboard

## 1) Backend setup

1. Open terminal in `backend/`
2. Install dependencies:

```bash
npm install
```

1. Create `backend/.env` from `backend/.env.example`
2. Fill required values:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRES_IN=30d
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

1. Start backend:

```bash
npm run dev
```

Backend health check: `http://localhost:5000/health`

## 2) Frontend setup

1. Open terminal in `frontend/`
2. Install dependencies:

```bash
npm install
```

1. Create `frontend/.env.local` from `frontend/.env.example`
2. Set API URL:

```env
VITE_API_URL=http://localhost:5000/api
```

1. Start frontend:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

## 3) Auth flow

1. Signup from `/signup`
2. Login from `/login`
3. App stores JWT access token in localStorage
4. Protected route (`/dashboard`) uses token + `/api/auth/me` verification

## Useful scripts

Backend (`backend/package.json`):

- `npm run dev` - start with nodemon
- `npm run start` - start with node
- `npm test` - run Jest test suite

Frontend (`frontend/package.json`):

- `npm run start` - start Vite dev server
- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run preview` - preview production build
- `npm run lint` - lint checks

## API endpoints

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me` (protected)
- `GET /api/restaurants`
- `GET /api/restaurants/:id/menu`
- `GET/POST/PUT/DELETE /api/cart` (protected)
- `GET/POST /api/orders` (protected)
- `GET/POST /api/payments/:orderId` (protected)

## Notes

- If JWT secrets are missing in local development, backend now uses safe fallback secrets to avoid startup/signup crashes.
- For production, always set strong JWT secrets explicitly.
