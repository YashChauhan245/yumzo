# Yumzo Frontend (React + Vite)

This is the frontend for Yumzo food delivery app.

## Prerequisites

- Node.js 18+
- Backend API running on `http://localhost:5000`

## Environment setup

Create `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:5000/api
```

You can also use `VITE_API_URL=/api` and keep Vite proxy enabled in `vite.config.js`.

## Install and run

```bash
npm install
npm run dev
```

Useful scripts:

- `npm run start` - start dev server (same as `dev`)
- `npm run dev` - run Vite dev server
- `npm run build` - create production build
- `npm run preview` - preview production build
- `npm run lint` - run ESLint

## Auth flow used

1. Signup or login on UI
2. Access token is stored in localStorage
3. Token is attached to API requests as `Authorization: Bearer <token>`
4. Protected routes redirect to `/login` when user is not authenticated
