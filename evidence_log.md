## Day 06/04/2025
### Tasks Completed
- Researched competitor platforms and market requirements for donut shop e-commerce solutions.
- Analyzed existing solutions like Uber Eats and Deliveroo to identify gaps in inventory management and loyalty features.
### Code / Modules Implemented
- Created initial project structure and wireframes using Mermaid JS for user flows.
### Issues Encountered
- Needed to define clear scope boundaries to avoid feature creep from competitor analysis.
### Fixes Applied
- Documented core feature set focusing on essential e-commerce functionality: menu browsing, cart, checkout, admin dashboard, and loyalty system.
### Notes for Final Report
- Market research findings documented in Chapter 2 to justify technology choices and feature selection.

## Day 10/04/2025
### Tasks Completed
- Designed wireframes for menu page, cart, and admin dashboard using Mermaid JS.
- Conducted initial usability testing with wireframes.
### Code / Modules Implemented
- Created wireframe diagrams showing user flows for customer and admin roles.
### Issues Encountered
- Mobile spacing issues identified where product cards were cramped and navigation overlapped.
### Fixes Applied
- Adjusted wireframe layouts to use responsive breakpoints with single-column mobile and multi-column desktop layouts.
### Notes for Final Report
- Wireframe snapshots included in appendices to show design evolution.

## Day 14/04/2025
### Tasks Completed
- Finalized information architecture mapping all routes, data flows, and user journeys.
### Code / Modules Implemented
- Created IA document detailing page hierarchy and navigation structure.
### Issues Encountered
- Decided on naming conventions for database entities - whether to use singular or plural forms.
### Fixes Applied
- Adopted Prisma best practices using singular model names (User, Product, Order) for consistency.
### Notes for Final Report
- Naming conventions explained in Chapter 3 to demonstrate adherence to industry standards.

## Day 18/04/2025
### Tasks Completed
- Selected Tailwind CSS and shadcn/ui as the UI framework and component library.
### Code / Modules Implemented
- Documented UI stack decision in project specification.
### Issues Encountered
- Considered Material-UI and Chakra UI but they didn't match the minimal bakery aesthetic desired.
### Fixes Applied
- Chose Tailwind for utility-first approach and shadcn/ui for customizable components matching clean design vision.
### Notes for Final Report
- Stack choice justified in Design chapter, explaining mobile-first and minimal aesthetic support.

## Day 22/04/2025
### Tasks Completed
- Refined data model defining relationships between User, Product, and Order entities.
### Code / Modules Implemented
- Created Entity Relationship Diagram (ERD) using Mermaid syntax.
### Issues Encountered
- Needed to decide loyalty points calculation strategy - per item, per order, or total amount, and how to handle decimals.
### Fixes Applied
- Implemented simple strategy: 1 dollar = 1 Dough point, using `Math.floor(totalAmount)` to ensure whole number points.
### Notes for Final Report
- Loyalty rationale documented in Chapter 3, explaining business logic and user benefit calculation.

## Day 26/04/2025
### Tasks Completed
- Drafted Supabase schema with Row Level Security (RLS) plan for data protection.
### Code / Modules Implemented
- Created SQL outlines for table creation and RLS policy definitions.
### Issues Encountered
- Complexity in writing RLS ownership predicates for determining user ownership of orders and loyalty history access.
### Fixes Applied
- Created helper functions to extract claims from JWT tokens and simplified RLS predicates for maintainability.
### Notes for Final Report
- Security-first approach highlighted in Chapter 4, emphasizing RLS defense-in-depth beyond application-level security.

## Day 05/05/2025
### Tasks Completed
- Scaffolded frontend Next.js application using App Router architecture.
### Code / Modules Implemented
- Implemented App Router pages for menu, cart, product details, and dashboard routes.
### Issues Encountered
- Clerk's redirect flow didn't integrate cleanly with Next.js App Router, causing redirect loops and authentication state issues.
### Fixes Applied
- Created dedicated `/auth` redirect page handling Clerk's callback and managing authentication state before redirecting. Finalized on 07/05/2025.
### Notes for Final Report
- SSR choice explained in Chapter 3, detailing how Server Components improve performance and security.

## Day 09/05/2025
### Tasks Completed
- Configured Tailwind CSS with custom theme variables and global styles for bakery branding.
### Code / Modules Implemented
- Set up Tailwind configuration with custom colors, fonts, and breakpoints aligned with design system.
### Issues Encountered
- Tailwind styles not applying correctly due to incorrect PostCSS configuration and missing content paths.
### Fixes Applied
- Fixed PostCSS configuration and ensured Tailwind config properly scanned all component and page files for class usage.
### Notes for Final Report
- Mobile-first design notes included in Chapter 3, explaining responsive design approach.

## Day 13/05/2025
### Tasks Completed
- Implemented menu page skeleton with product cards displaying images, names, prices, and descriptions.
### Code / Modules Implemented
- Created menu page component with ProductCard components in responsive grid layout.
### Issues Encountered
- Image aspect ratio problems where product images had inconsistent dimensions, causing grid misalignment.
### Fixes Applied
- Applied `object-fit: cover` styling with fixed aspect ratio containers ensuring uniform image display.
### Notes for Final Report
- UI iteration logs documented in Chapter 3, showing design decisions based on user testing feedback.

## Day 17/05/2025
### Tasks Completed
- Implemented custom React hooks for cart management and authentication state (useCart and useAuth).
### Code / Modules Implemented
- Created useCart.tsx and useAuth.ts hooks managing client-side state and backend API interaction.
### Issues Encountered
- State merge edge cases where adding same product multiple times created duplicates instead of incrementing quantity, and cart state reset on page refresh.
### Fixes Applied
- Implemented update functions checking for existing items before adding, properly merging quantities, and persisting cart state to localStorage.
### Notes for Final Report
- Hooks rationale explained in Chapter 3, demonstrating how custom hooks encapsulate business logic.

## Day 21/05/2025
### Tasks Completed
- Created admin dashboard layout with navigation sidebar and main content area.
### Code / Modules Implemented
- Implemented dashboard shell component with DashboardNav and conditional rendering based on user role.
### Issues Encountered
- Client-side role checks could be bypassed, creating security vulnerability where non-admin users could potentially access admin routes.
### Fixes Applied
- Implemented server-side role verification in backend API endpoints, ensuring backend rejects unauthorized requests even if users navigate to admin routes.
### Notes for Final Report
- Guard patterns documented in Chapter 4, explaining defense-in-depth approach to authorization.

## Day 25/05/2025
### Tasks Completed
- Finalized frontend milestone, polishing UI with consistent spacing, typography, and interactive states.
### Code / Modules Implemented
- Applied UI polish across all pages ensuring consistent button styles, loading states, and error messages.
### Issues Encountered
- Inconsistencies in button styles, spacing, and color usage across pages making application feel unprofessional.
### Fixes Applied
- Created design system document and standardized all UI components ensuring consistent use of colors, spacing, and typography.
### Notes for Final Report
- Frontend learnings summarized in Chapter 5, reflecting on maintaining design consistency in component-based architecture.

## Day 03/06/2025
### Tasks Completed
- Initialized backend project as separate Node.js TypeScript application.
### Code / Modules Implemented
- Set up backend directory structure with TypeScript configuration and package dependencies for Express, Prisma, and backend libraries.
### Issues Encountered
- Module resolution errors where TypeScript couldn't find module imports, and bundler wasn't correctly resolving path aliases.
### Fixes Applied
- Configured TypeScript path mapping in tsconfig.json and ensured bundler (tsx for development) correctly resolved all module paths.
### Notes for Final Report
- Backend setup notes documented in Chapter 3, explaining decision to separate frontend and backend for security and maintainability.

## Day 07/06/2025
### Tasks Completed
- Aligned Prisma schema with ERD, defining all models (User, Product, Order, OrderItem, LoyaltyHistory) with proper relationships.
### Code / Modules Implemented
- Created Prisma schema file with all models, relations, and field types matching database design.
### Issues Encountered
- Mapping decimal/float types for price and totalAmount fields - JavaScript's number type loses precision for currency, but Prisma's Decimal type required special handling.
### Fixes Applied
- Used `@db.Decimal(10,2)` in Prisma schema to store currency values as precise decimals in PostgreSQL, and implemented conversion functions (`Number(price)`) when needed for calculations.
### Notes for Final Report
- Type mapping decisions documented in Chapter 3, explaining why Decimal types are critical for financial applications.

## Day 11/06/2025
### Tasks Completed
- Created authentication service verifying Clerk JWT tokens and extracting user information.
### Code / Modules Implemented
- Implemented auth service with Clerk token verification logic and user role extraction.
### Issues Encountered
- Accessing user roles from Clerk's public metadata required careful token parsing, and role wasn't always available in expected token claims, causing authentication failures.
### Fixes Applied
- Implemented fallback mechanism checking multiple token locations (claims, public metadata) and syncing role to database on login, ensuring role information always available.
### Notes for Final Report
- Auth flow discussed in Chapter 4, explaining token verification process and role synchronization strategy.

## Day 14/06/2025
### Tasks Completed
- Upgraded project from Next.js 14 to Next.js 16 (Active LTS) for long-term support.
### Code / Modules Implemented
- Updated all frontend dependencies including Next.js, React, and related packages to compatible versions.
### Issues Encountered
- Breaking changes in Next.js 16's App Router API, particularly with middleware and server component patterns requiring code updates.
### Fixes Applied
- Reviewed Next.js 16 migration guide and updated all affected code ensuring compatibility with new App Router conventions.
### Notes for Final Report
- Upgrade decision mentioned under Implementation and Reflection, explaining rationale for choosing Active LTS versions.

## Day 18/06/2025
### Tasks Completed
- Implemented ProductsService querying database and returning only active products for menu page.
### Code / Modules Implemented
- Created ProductsService with methods to fetch all active products and individual product details.
### Issues Encountered
- Converting Prisma Decimal types to JavaScript numbers - Decimal type returns Decimal object, not primitive number, causing type errors in frontend.
### Fixes Applied
- Implemented `Number(price)` conversion when returning product data from service, normalizing Decimal values to JavaScript numbers for JSON serialization.
### Notes for Final Report
- Normalization choices documented in Chapter 3, explaining trade-offs between precision and usability when handling currency values.

## Day 01/07/2025
### Tasks Completed
- Implemented server gateway (servercomms.ts) routing API requests to appropriate services and handling authentication.
### Code / Modules Implemented
- Created servercomms.ts as centralized gateway validating Clerk tokens, checking user roles, and routing requests to service layers.
### Issues Encountered
- Inconsistent error response formats across endpoints - some returned error objects, others returned strings, making error handling in frontend difficult.
### Fixes Applied
- Standardized all error responses to use consistent JSON shape `{ error: string, code?: string }` with appropriate HTTP status codes.
### Notes for Final Report
- Error handling policy documented in Chapter 4, explaining how consistent error formats improve debugging and user experience.

## Day 05/07/2025
### Tasks Completed
- Implemented OrdersService creating orders, calculating totals, and managing order items with validation.
### Code / Modules Implemented
- Created OrdersService with methods to create orders, calculate line item totals, and validate order data before database insertion.
### Issues Encountered
- Edge case where user could attempt to order product deleted or deactivated between adding to cart and checkout, causing order creation to fail silently.
### Fixes Applied
- Implemented defensive checks validating all products exist and are active before order creation, throwing clear `ProductNotFound` error with helpful messaging.
### Notes for Final Report
- Defensive programming practices discussed in Chapter 4, showing how input validation prevents data corruption and improves error messages.

## Day 12/07/2025
### Tasks Completed
- Began planning Stripe integration, researching checkout session creation and webhook handling patterns.
### Code / Modules Implemented
- Created API stubs for checkout endpoints and webhook handlers establishing integration structure.
### Issues Encountered
- Understanding Stripe's idempotency concept and implementing it correctly to prevent duplicate charges if webhooks are retried.
### Fixes Applied
- Researched Stripe's idempotency key format and implemented strategy using order IDs as idempotency keys ensuring retried requests don't create duplicate payments.
### Notes for Final Report
- Payments design documented in Chapter 4, explaining idempotency and how it ensures payment reliability.

## Day 20/07/2025
### Tasks Completed
- Implemented Stripe checkout session creation in PaymentService allowing users to proceed to Stripe's hosted payment page.
### Code / Modules Implemented
- Created PaymentService with methods to create checkout sessions, configure success/cancel URLs, and handle session metadata.
### Issues Encountered
- Currency conversion issues - Stripe requires amounts in smallest currency unit (pence for GBP), but working with pound values caused incorrect charge amounts due to floating-point precision errors.
### Fixes Applied
- Implemented `Math.round(unit*100)` to convert pounds to pence, ensuring accurate currency conversion and preventing rounding errors.
### Notes for Final Report
- Currency handling documented in Chapter 4, explaining importance of proper currency conversion for financial accuracy.

## Day 28/07/2025
### Tasks Completed
- Implemented Stripe webhook verification using webhook signing secret to ensure requests are authentic.
### Code / Modules Implemented
- Created webhook handler verifying webhook signatures and processing checkout.session.completed events.
### Issues Encountered
- Stripe's webhook signature verification requires raw request body as string, but Express was parsing body as JSON, corrupting signature verification and causing all webhooks to fail security checks.
### Fixes Applied
- Configured Express to preserve raw body as Buffer for webhook endpoint and pass it as string to Stripe's `constructEvent` function enabling proper signature verification.
### Notes for Final Report
- Security on webhooks highlighted in Chapter 4, explaining how signature verification prevents malicious webhook injection attacks.

## Day 02/08/2025
### Tasks Completed
- Upgraded React to version 19 and verified compatibility with Next.js 16 App Router and all existing components.
### Code / Modules Implemented
- Updated frontend dependencies including React, React DOM, and related packages to React 19 compatible versions.
### Issues Encountered
- Compatibility warnings and deprecated React patterns needing updates, particularly around ref handling and component prop types.
### Fixes Applied
- Reviewed React 19 migration guides, updated component patterns to use new APIs, and ran comprehensive compatibility checks.
### Notes for Final Report
- Upgrade referenced in Chapter 5 and test impact documented in Chapter 6, showing how version upgrades require thorough testing.

## Day 03/08/2025
### Tasks Completed
- Implemented inventory decrement logic reducing product stock when payment is successfully completed via Stripe webhook.
### Code / Modules Implemented
- Added stock update logic to webhook handler decrementing inventory for each ordered item when checkout.session.completed is received.
### Issues Encountered
- Concurrency concerns where multiple webhook deliveries or simultaneous orders could cause race conditions, potentially overselling products if stock isn't properly locked.
### Fixes Applied
- Implemented atomic database updates using Prisma's transaction support ensuring stock decrements happen atomically per item preventing race conditions.
### Notes for Final Report
- Consistency notes documented in Chapter 4, explaining how database transactions ensure inventory accuracy under concurrent load.

## Day 11/08/2025
### Tasks Completed
- Implemented loyalty points award strategy automatically granting Dough points when orders are paid.
### Code / Modules Implemented
- Created LoyaltyService with methods to award points, track point history, and calculate point balances for users.
### Issues Encountered
- Points rounding - using `Math.round()` could award fractional points for orders with decimal amounts, needed to decide whether to round up, down, or to nearest integer.
### Fixes Applied
- Implemented `Math.floor(totalAmount)` to always round down, ensuring customers receive whole number points preventing fractional point calculations.
### Notes for Final Report
- Loyalty rationale documented in Chapter 3, explaining business logic and user benefit of 1 dollar = 1 Dough point system.

## Day 18/08/2025
### Tasks Completed
- Implemented admin product list page with actions to activate/deactivate, edit, and delete products.
### Code / Modules Implemented
- Created AdminProductRow component displaying product information and providing action buttons for product management.
### Issues Encountered
- UX confusion with toggle active button - users couldn't easily understand whether clicking would activate or deactivate product, and button text didn't clearly indicate current state or action.
### Fixes Applied
- Improved button copy to show current state and action clearly (e.g., "Activate" when inactive, "Deactivate" when active), and added visual indicators (badges) showing product status at a glance.
### Notes for Final Report
- Admin usability discussed in Chapter 5, explaining how clear UI copy and visual feedback improve administrative efficiency.

## Day 24/08/2025
### Tasks Completed
- Implemented new product form allowing admins to create products with name, description, price, category, image URL, stock, and pack size.
### Code / Modules Implemented
- Created /dashboard/products/new page with form component submitting product data to backend API.
### Issues Encountered
- Client-side validation could be bypassed, and invalid data (negative prices, empty names, invalid URLs) could reach database potentially corrupting product data.
### Fixes Applied
- Implemented Zod validation schemas on backend API endpoint ensuring all product data is validated server-side before database insertion providing security layer that can't be bypassed.
### Notes for Final Report
- Validation layers documented in Chapter 4, explaining defense-in-depth approach of validating on both client and server.

## Day 02/09/2025
### Tasks Completed
- Implemented orders admin view displaying all orders with customer information, items, totals, and status.
### Code / Modules Implemented
- Created /dashboard/orders page with table component showing order details and status management controls.
### Issues Encountered
- Time formatting issues where order dates were displayed in ISO format (UTC), making it difficult for admins to understand when orders were placed in their local timezone.
### Fixes Applied
- Implemented date formatting converting ISO timestamps to local timezone using JavaScript's Intl.DateTimeFormat displaying dates in human-readable format (e.g., "2 Sep 2025, 3:45 PM").
### Notes for Final Report
- Admin reporting discussed in Chapter 5, explaining how proper date formatting improves administrative decision-making.

## Day 10/09/2025
### Tasks Completed
- Implemented inventory editor allowing admins to view and update stock levels for all products in real-time.
### Code / Modules Implemented
- Created /dashboard/inventory page with inline editing capabilities for stock quantities and visual indicators for low stock items.
### Issues Encountered
- Initially implemented input debouncing to reduce API calls, but this created UX issues where users had to wait for debounce delays, and rapid changes could be lost if user navigated away before debounce completed.
### Fixes Applied
- Switched to manual update per change with explicit save buttons giving users control over when updates are sent and providing clear feedback on save status.
### Notes for Final Report
- Performance considerations documented in Chapter 5, explaining trade-offs between debouncing and manual updates for admin interfaces.

## Day 18/09/2025
### Tasks Completed
- Implemented KPI dashboard counters showing total orders, revenue, active products, and low stock items for admin overview.
### Code / Modules Implemented
- Created /admin/kpis endpoint calculating aggregate statistics using database queries.
### Issues Encountered
- Efficient aggregation queries - initially fetching all records and summing in JavaScript was slow and memory-intensive for large datasets causing performance issues.
### Fixes Applied
- Used Prisma's aggregate functions (`_count`, `_sum`) to perform calculations at database level significantly improving performance by leveraging PostgreSQL's optimized aggregation capabilities.
### Notes for Final Report
- KPI selection documented in Chapter 5, explaining which metrics provide most value for administrative decision-making.

## Day 26/09/2025
### Tasks Completed
- Planned functional tests covering user flows, admin operations, payment processing, and edge cases.
### Code / Modules Implemented
- Created comprehensive test checklist documenting all test scenarios and expected behaviors.
### Issues Encountered
- Critical testing challenge with payment replay - Stripe webhooks can be retried multiple times, needed to ensure system handles duplicate webhook deliveries without creating duplicate orders or awarding duplicate loyalty points.
### Fixes Applied
- Planned idempotency tests verifying webhook handlers can safely process duplicate events ensuring retried webhooks don't cause data corruption or duplicate charges.
### Notes for Final Report
- Testing approach documented in Chapter 6, explaining how idempotency testing ensures payment reliability.

## Day 04/10/2025
### Tasks Completed
- Created security test plan for Row Level Security (RLS) policies ensuring users can only access their own data.
### Code / Modules Implemented
- Documented RLS test scenarios covering user isolation, admin access, and unauthorized access attempts.
### Issues Encountered
- RLS policies require proper JWT token mapping to Supabase claims, and incorrect claim extraction could allow users to access other users' data creating critical security vulnerability.
### Fixes Applied
- Implemented proper claim extraction functions correctly mapping Clerk JWT tokens to Supabase RLS claims ensuring RLS policies can correctly identify requesting user and enforce data isolation.
### Notes for Final Report
- Security validation notes documented in Chapter 6, explaining how RLS testing ensures data privacy and security.

## Day 15/10/2025
### Tasks Completed
- Conducted performance audits using Google Lighthouse to measure page load times, Core Web Vitals, and optimization opportunities.
### Code / Modules Implemented
- Created audit notes documenting performance metrics, bottlenecks, and optimization recommendations.
### Issues Encountered
- Large, uncompressed product images significantly impacting page load times causing poor Lighthouse scores and slow user experience especially on mobile devices.
### Fixes Applied
- Compressed all product images using image optimization tools reducing file sizes by 60-80% while maintaining visual quality, and implemented Next.js Image component with automatic optimization.
### Notes for Final Report
- Performance results documented in Chapter 6, showing before/after metrics and impact of image optimization on user experience.

## Day 24/10/2025
### Tasks Completed
- Created documentation chapters outline for final report structuring all sections and appendices.
### Code / Modules Implemented
- Established final report structure with chapters covering introduction, literature review, design, implementation, testing, and reflection.
### Issues Encountered
- Citation formatting requirements - initially using inconsistent citation styles that didn't meet academic standards.
### Fixes Applied
- Standardized all citations to Harvard referencing style ensuring consistency throughout document and compliance with academic writing requirements.
### Notes for Final Report
- Documentation plan followed ensuring all chapters are complete and properly referenced.

## Day 02/11/2025
### Tasks Completed
- Created appendices diagrams using Mermaid syntax including use case diagrams, sequence diagrams, and Entity Relationship Diagram.
### Code / Modules Implemented
- Generated use case diagrams showing user interactions, sequence diagrams for payment flow, and updated ERD reflecting final database schema.
### Issues Encountered
- Diagram alignment issues where different diagrams used inconsistent styling, colors, and formatting making appendices look unprofessional.
### Fixes Applied
- Established consistent diagram style guide with standardized colors, shapes, and formatting across all Mermaid diagrams ensuring visual consistency.
### Notes for Final Report
- All diagrams placed in appendices section ensuring they are properly referenced in main chapters where relevant.

## Day 18/11/2025
### Tasks Completed
- Performed final polish and review of entire codebase, documentation, and evidence log ensuring everything is complete and ready for submission.
### Code / Modules Implemented
- Completed minor refactors to improve code quality, fix remaining bugs, and ensure consistency across application.
### Issues Encountered
- Several minor issues during final review including inconsistent error messages, unused code, and documentation gaps needing addressing before submission.
### Fixes Applied
- Systematically addressed all identified issues, cleaned up unused code, standardized error messages, and filled documentation gaps ensuring project meets all requirements and quality standards.
### Notes for Final Report
- Reflections summarized in Chapter 7, discussing lessons learned, challenges overcome, and how project met or exceeded initial objectives.
