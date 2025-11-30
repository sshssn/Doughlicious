## Key Requirements Summary
- Tech stack: `Next.js 16` (App Router, Server Components), `React 19`, `TypeScript`, `Tailwind CSS`, `shadcn/ui`.
- Backend: `Supabase (PostgreSQL)` with `Prisma`, strict RLS; `Clerk` for auth (roles: `customer`, `admin`); `Stripe` for payments.
- Architecture: Two top-level dirs `frontend/` and `backend/`; strict separation of concerns; no business logic in React; all heavy logic in backend services.
- Data model: `User`, `Product`, `Order`, `OrderItem`, `LoyaltyHistory` (exact fields as specified).
- Security: Enforce RLS, verified Stripe webhooks, role checks, no secrets in frontend, Zod validation everywhere.
- Testing: Functional, performance, security, and payment tests; include webhook replay/idempotency.
- Logs & report: Maintain `evidence_log.md` with dated entries; include version upgrade logs; produce Final Report structure and Mermaid diagrams in appendices.
- Deployment: Vercel environments (Development/Preview/Production). Forbidden: changing stack, adding libraries without permission, JS files, direct DB/frontend access.

## Repository Setup
- Create `backend/` and `frontend/` directories to match the mandatory structures.
- Initialize `TypeScript` in both; configure project references if beneficial.
- Add baseline `package.json` files with pinned dependencies per spec and scripts for dev, build, test.

## Backend Implementation
- DB & ORM: Define `prisma.schema` with the authoritative models; generate Prisma client; align with Supabase tables and enable RLS.
- Services: Implement `product.service.ts`, `order.service.ts`, `auth.service.ts`, `loyalty.service.ts`, `payment.service.ts` with business logic and Zod validation.
- API: Implement `products.ts`, `orders.ts`, `checkout.ts`, `webhook.stripe.ts` with Clerk session validation and standardized responses.
- Server gateway: Implement `backend/src/servercomms.ts` to centralize auth checks, role enforcement, routing to services, and error normalization.
- Lib: Add `validation.ts` (Zod schemas), `logger.ts` (structured logs), `utils.ts` (helpers), `client.ts` (Prisma client factory).

## Frontend Implementation
- App Router: Scaffold `app/` pages (`menu`, `product/[id]`, `cart`, `account`, `dashboard`, `auth`), `layout.tsx`, `page.tsx`.
- Components: Add `components/ui` (shadcn), `components/forms`, `components/shared`; style with Tailwind; mobile-first.
- Hooks: Implement `useCart.ts` and `useAuth.ts` for client-side interactivity.
- Data fetching: Use Server Components by default; forward calls via `frontend/lib/servercomms.ts` to backend endpoints; no secrets or business logic.

## Security & Auth
- Clerk: Store roles in metadata; add middleware and server-side validation to all protected routes.
- RLS: Implement and verify Supabase policies so customers can only access their own orders; admins have full access.
- Input validation: All mutating endpoints and server actions validated with Zod; reject on missing/invalid input.

## Payments
- Stripe: Implement checkout sessions; webhook verification with signing secret; idempotency keys on mutations.
- On success: Mark order `paid`, award loyalty points, reduce inventory; persist `sessionId`/`paymentIntent`.

## Data Model
- Implement exact fields for `User`, `Product`, `Order`, `OrderItem`, `LoyaltyHistory` in Prisma, mirroring Supabase schema.
- Add referential integrity, indexes where needed (e.g., `orderId`, `productId`).

## Testing Plan
- Functional: Cart add/remove, Stripe payment success, admin product CRUD, order display/filtering.
- Security: RLS policy tests, protected route access, broken-access tests.
- Payment: Success, cancellation, webhook replay to assert idempotency.
- Performance: Lighthouse/PageSpeed checks; SSR behavior; image optimization.

## Logging & Documentation
- Create `evidence_log.md` with dated entries per Gantt phases; include at least two version upgrade logs (e.g., Next.js upgrades).
- Generate Final Report chapters (Title, Abstract, Contents, Chapters 1–7, References, Appendices) and all required Mermaid diagrams in appendices.

## Deployment
- Configure Vercel projects for Dev/Preview/Prod; set environment variables (`STRIPE_SECRET_KEY`, `SUPABASE_*`, `CLERK_SECRET_KEY`) securely.
- No secrets in repo; no `.env` committed; use environment management.

## Acceptance Criteria
- Directory structure matches spec; no business logic in React components.
- All required features implemented for customer/admin.
- Security rules enforced (RLS, roles, webhook verification, idempotency).
- Tests for functional/security/payment/performance pass.
- Logs and Final Report artifacts generated; diagrams in Mermaid.

## Next Actions
- After approval, scaffold `frontend/` and `backend/` per structure, implement `servercomms.ts` (both sides), define Prisma schema aligned to Supabase, wire Clerk/Stripe, build baseline pages/components, and start the evidence log with initial entries including version upgrade notes.