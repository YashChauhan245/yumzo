# Yumzo Interview Prep Sheet

This file is a quick revision guide for explaining the project in interviews.

## 1) 60-Second Project Pitch

Yumzo is a full stack food delivery app with Customer, Driver, and Admin roles.
I built React + Vite frontend and Node/Express backend with Prisma on Supabase PostgreSQL.
The main focus was complete order lifecycle handling, role-based access, and practical UI flows.

## 2) Core Features You Can Explain

- Customer can browse restaurants, manage cart, place orders, and track status.
- Driver can see available orders, accept, reject with reason, and update delivery stages.
- Admin can manage restaurants, menu items, and orders from dashboard tools.
- Reels module supports feed, likes, and comments.

## 3) Order Lifecycle (Important)

Primary path:

- pending -> confirmed -> preparing -> picked_up -> out_for_delivery -> delivered

Driver rejection path:

- If assigned driver rejects in preparing stage:
  - driver_id is cleared
  - order returns to confirmed queue
  - rejection reason is stored in notes
  - order becomes available for other drivers

Admin cancellation path:

- Admin sets status to cancelled with reason.
- Reason is appended in order notes with admin cancellation tag.

## 4) Tech Stack (Why These Choices)

Frontend:

- React + Vite for fast development and routing-based role pages.
- Axios for API calls.
- Tailwind CSS for quick UI iteration.

Backend:

- Express for simple REST APIs.
- Prisma for type-safe DB operations.
- JWT auth for role-based protected routes.
- express-validator for request validation.

Database:

- Supabase PostgreSQL used as hosted relational DB.

## 5) Architecture You Can Draw

- Routes -> Controllers -> Services -> Prisma/DB
- Middleware handles JWT auth + role checks.
- Separate route groups for auth, user, driver, and admin.

This keeps code beginner-friendly and easy to debug.

## 6) Security/Access Points to Mention

- JWT-protected APIs.
- Role-based route guards on frontend and backend.
- Admin email allowlist enforcement.
- Input validation with express-validator.

## 7) Real Problems Solved During Development

- Legacy DB rows with null owner_id caused ORM decode issues:
  - solved using safe SQL for affected list endpoints.
- Invalid UUID route params caused server errors:
  - fixed with validation and safe handling.
- Driver rejection needed operational flow:
  - added reject endpoint, reason capture, queue reassignment.

## 8) Interview Questions + Sample Answers

Q1. Why Prisma instead of raw SQL everywhere?

- Prisma made CRUD simple and clean. For normal paths, it reduced boilerplate.
- I still used raw SQL in specific legacy-data cases where ORM assumptions broke.

Q2. How did you handle role-based access?

- Backend middleware validates JWT and role.
- Frontend uses protected routes and role checks.
- Admin is additionally restricted by allowed email logic.

Q3. How do you ensure data validity?

- express-validator at route level.
- Type and range checks (example: status enums, UUID checks, reason length).

Q4. What happens when driver rejects an order?

- Rejection reason is recorded, assignment is removed, status moves back so other drivers can pick it.

Q5. What would you improve next?

- Move more polling flows to socket listeners for true realtime.
- Add unit/integration tests for lifecycle transitions.
- Add observability logs and dashboards.

## 9) Strength Points to Highlight in Resume Discussion

- Implemented complete multi-role workflow.
- Fixed production-like issues (legacy schema mismatch, role restrictions, flow edge cases).
- Improved UI consistency by extracting reusable modal components.
- Kept architecture simple and interview-friendly.

## 10) Quick Revision Before Interview

- Learn exact order status transitions.
- Remember why rejection/cancellation reasons are stored in notes.
- Be ready to explain one bug and how you debugged it end-to-end.
- Practice drawing the request flow from route to DB.
