# 🍩 Doughlicious

A full-stack bakery management and ordering system built with Next.js, TypeScript, and Supabase.

## Quick Start

Get up and running in just two commands:

```bash
# Install dependencies and setup the project
pnpm setup

# Start the development server
pnpm dev
```

That's it! The app will be running at:
- Frontend: http://localhost:3000
- Backend: http://localhost:4000

## Prerequisites

Before you begin, make sure you have installed:

- **Node.js** (v18 or higher)
- **pnpm** (v8 or higher) - Install with: `npm install -g pnpm`

## 🛠️ Manual Setup

If you prefer to set things up step by step:

### 1. Clone the repository

```bash
git clone https://github.com/sshssn/Doughlicious.git
cd Doughlicious
```

### 2. Configure environment variables

Create a `.env.local` file in the root directory with your credentials:

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database
DATABASE_URL=your_database_url

# Clerk Authentication
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# URLs
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:4000
```

### 3. Install dependencies

```bash
# Root dependencies
pnpm install

# Backend dependencies
cd backend && pnpm install

# Frontend dependencies
cd ../frontend && pnpm install
```

### 4. Setup database

```bash
cd backend

# Generate Prisma client
pnpm run prisma:generate

# Run migrations
pnpm run prisma:migrate

# (Optional) Seed the database
pnpm run seed
```

### 5. Start development servers

```bash
# From the root directory
pnpm dev
```

## 📁 Project Structure

```
Doughlicious/
├── backend/              # Express + TypeScript backend
│   ├── src/
│   │   ├── api/         # API routes
│   │   ├── db/          # Database & Prisma
│   │   ├── services/    # Business logic
│   │   └── server.ts    # Server entry point
│   └── package.json
├── frontend/            # Next.js frontend
│   ├── app/            # Next.js app directory
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities
│   └── package.json
├── scripts/            # Build & dev scripts
└── package.json        # Root workspace config
```

## 🔧 Available Scripts

### Root Level

- `pnpm setup` - Complete project setup (install deps, migrations, etc.)
- `pnpm dev` - Start both frontend and backend in development mode
- `pnpm dev:frontend` - Start only th- `pnpm dev:backend` - Start only the backend
- `pnpm sync-env` - Sync environment variables

### Backend

- `pnpm dev` - Start backend dev server
- `pnpm build` - Build for production
- `pnpm prisma:generate` - Generate Prisma client
- `pnpm prisma:migrate` - Run database migrations
- `pnpm seed` - Seed the database
- `pnpm test:db` - Test database connection

### Frontend

- `pnpm dev` - Start frontend dev server
- `pnpm build` - Build for production
- `pnpm start` - Start production server

## 🔑 Key Features

- **User Authentication** - Powered by Clerk
- **Payment Processing** - Stripe integration
- **Order Management** - Full order lifecycle tracking
- **Loyalty Program** - Points and rewards system
- **Admin Dashboard** - Manage products, orders, and users
- **Real-time Updates** - Live order status updates

## 🗄️ Database

The project uses PostgreSQL via Supabase with Prisma ORM. The schema includes:

- Users & Authentication
- Products & Categories
- Orders & Order Items
- Loyalty Points
- Admin Management

## 🚢 Deployment

### Vercel (Recommended for Frontend)

The frontend is configured for Vercel deployment. Make sure to:

1. Set all `NEXT_PUBLIC_*` environment variables in Vercel
2. The build command is: `next build`
3. The output directory is: `.next`

### Backend Deployment

The backend can be deployed to any Node.js hosting service:

1. Set all environment variables
2. Run `pnpm build` to compile TypeScript
3. Start with `node dist/server.js`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 🆘 Troubleshooting

### Build fails with TypeScript errors

Make sure all dependencies are installed:
```bash
cd frontend && pnpm install
```

### Database connection fails

Check your `DATABASE_URL` in `.env.local` and ensure your database is accessible.

### Port already in use

Change the ports in your environment variables or kill the process using the port:
```bash
# Find process on port 3000
lsof -ti:3000 | xargs kill -9

# Find process on port 4000
lsof -ti:4000 | xargs kill -9
```

## 📧 Support

For issues or questions, please open an issue on GitHub.
