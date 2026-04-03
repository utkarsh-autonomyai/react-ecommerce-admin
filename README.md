# React Ecommerce Admin

[![CI](https://github.com/Kris1027/react-ecommerce-admin/actions/workflows/ci.yml/badge.svg)](https://github.com/Kris1027/react-ecommerce-admin/actions/workflows/ci.yml)

A production-ready **admin dashboard** for the [NestJS Ecommerce API](https://github.com/Kris1027/nestjs-ecommerce-api), built with React 19, TypeScript 5.9, TanStack Router, TanStack Query, and shadcn/ui. Features auto-generated API client from OpenAPI spec, secure JWT authentication with token rotation, real-time notifications, 80+ unit tests, and 45 E2E tests.

---

## Tech Stack

| Category            | Technology                                        |
| ------------------- | ------------------------------------------------- |
| **Build**           | Vite 7                                            |
| **Compiler**        | React Compiler (via babel-plugin-react-compiler)  |
| **Framework**       | React 19                                          |
| **Language**        | TypeScript 5.9 (strict mode)                      |
| **Routing**         | TanStack Router (file-based, auto code splitting) |
| **Server State**    | TanStack Query 5                                  |
| **Client State**    | Zustand 5                                         |
| **Data Tables**     | TanStack Table 8 (via shadcn)                     |
| **UI Components**   | shadcn/ui + Radix UI                              |
| **Styling**         | Tailwind CSS 4                                    |
| **Forms**           | React Hook Form 7 + Zod 4                         |
| **Charts**          | Recharts 3                                        |
| **Toasts**          | Sonner                                            |
| **API Client**      | @hey-api/openapi-ts (auto-generated from Swagger) |
| **Unit Tests**      | Vitest 4 + React Testing Library + MSW 2          |
| **E2E Tests**       | Playwright                                        |
| **Bundle Budgets**  | size-limit                                        |
| **CI/CD**           | GitHub Actions                                    |
| **Package Manager** | pnpm 10                                           |

---

## Features

### Dashboard

- Stat cards — total orders, revenue, active products, registered users
- Revenue chart (line chart, last 30 days)
- Orders by status (donut chart)
- Recent orders, low stock alerts, pending reviews — quick views with links

### Product Management

- Full CRUD with server-side pagination, sorting, and filtering
- Category and search filters
- Slug auto-generation from product name
- Multi-image upload with drag-and-drop (Cloudinary via backend)
- Featured and active toggles

### Category Management

- Full CRUD with image upload
- Slug auto-generation, parent category selection
- Sort order and active status management

### Order Management

- Order list with status badge filtering
- Order detail — customer info, shipping address, items table, financial summary
- Status workflow transitions with admin notes
- Status transition validation (client-side state machine)

### Payment Management

- Payment list with status filtering
- Full and partial refund dialog with validation
- Expire abandoned payments action

### Review Moderation

- Review list with status and rating filters
- Quick approve/reject inline actions
- Moderation dialog with admin notes

### Coupon Management

- Full CRUD — percentage and fixed amount types
- Validation rules: min order, max discount, usage limits, validity dates
- Active/inactive toggle

### Shipping Methods

- Full CRUD — base price, free shipping threshold, estimated days
- Sort order and active status

### Inventory Management

- Low stock alerts dashboard
- Per-product stock detail — current, reserved, available, threshold
- Stock adjustment form (adjustment, restock, return with reason)
- Movement history audit trail

### Notifications

- Notification bell with unread count (polling)
- Notification list with type and read status filters
- Mark as read / mark as unread toggle per notification
- Mark all as read (bell popover and notifications page)
- Delete individual notifications and delete all read

### Authentication & Security

- JWT access token in memory (never persisted) + refresh token in httpOnly cookie
- Silent refresh on app load (seamless page reload experience)
- 401 interceptor with automatic token refresh and request queue
- Multi-tab sync via BroadcastChannel (logout/token refresh)
- Admin role validation (rejects non-admin users)
- Security headers via `vercel.json` — CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- CSP meta tag fallback for non-Vercel environments (injected at build time)

### UI/UX

- Dark/light/system theme with persistence
- Per-route page titles for multi-tab UX (`{Page} | Admin`)
- Collapsible sidebar with mobile responsive drawer
- **Mobile-first responsive design** — all pages optimized for 375px, 768px, and 1280px+ viewports
- **Global command palette** (⌘K / Ctrl+K) — search across all entities with live product results
- Server-side paginated data tables with column visibility, faceted filters
- Loading skeletons, empty states, confirmation dialogs
- Global error boundary + route-level error components
- Offline detection banner
- Toast notifications on all mutations

---

## Getting Started

### Prerequisites

- **Node.js** 22 LTS
- **pnpm** 10+
- **Backend** — [NestJS Ecommerce API](https://github.com/Kris1027/nestjs-ecommerce-api) running on `http://localhost:3000`

### Local Setup

```bash
# Clone the repository
git clone https://github.com/Kris1027/react-ecommerce-admin.git
cd react-ecommerce-admin

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env.development
# Edit .env.development — set VITE_API_URL to your backend URL (default: http://localhost:3000)

# Generate API client from backend Swagger spec
pnpm api:generate

# Start development server (uses local backend)
pnpm dev

# Or start against production API
pnpm dev:prod
```

The admin panel runs on **`http://localhost:3001`**.

Login with the admin credentials from the backend seed data.

---

## Scripts

| Command              | Description                                             |
| -------------------- | ------------------------------------------------------- |
| `pnpm dev`           | Start Vite dev server with local backend (port 3001)    |
| `pnpm dev:prod`      | Start Vite dev server with production backend           |
| `pnpm build`         | TypeScript check + Vite production build                |
| `pnpm build:analyze` | Build with bundle visualizer (opens treemap)            |
| `pnpm preview`       | Preview production build locally                        |
| `pnpm lint`          | ESLint (includes React Compiler rules)                  |
| `pnpm lint:fix`      | ESLint with auto-fix                                    |
| `pnpm format`        | Prettier format all files                               |
| `pnpm format:check`  | Check formatting without writing                        |
| `pnpm typecheck`     | TypeScript type checking only                           |
| `pnpm api:generate`  | Generate API client from backend OpenAPI spec           |
| `pnpm test`          | Run unit tests (Vitest)                                 |
| `pnpm test:watch`    | Run tests in watch mode                                 |
| `pnpm test:coverage` | Generate coverage report                                |
| `pnpm test:e2e`      | Run Playwright E2E tests                                |
| `pnpm test:e2e:ui`   | Run E2E tests with Playwright UI                        |
| `pnpm validate`      | Run all checks (lint, format, types, test, build, size) |
| `pnpm size`          | Check bundle size against budgets                       |

---

## Project Structure

```
src/
├── api/
│   ├── generated/              # OpenAPI codegen output (gitignored)
│   └── client.ts               # Configured fetch with auth interceptors
├── components/
│   ├── layout/                 # AppLayout, Sidebar, Header
│   ├── shared/                 # DataTable, GlobalSearch, ConfirmDialog, StatusBadge, ErrorBoundary, etc.
│   └── ui/                     # shadcn/ui components (managed by CLI)
├── config/
│   └── env.ts                  # Zod-validated environment
├── features/
│   ├── auth/                   # Login, refresh, logout, auth init
│   ├── dashboard/              # StatCard, RevenueChart, RecentOrders
│   ├── users/                  # User list, detail, role management
│   ├── products/               # Product CRUD, image management
│   ├── categories/             # Category CRUD, image upload
│   ├── orders/                 # Order list, detail, status workflow
│   ├── payments/               # Payment list, refund dialog
│   ├── reviews/                # Review list, moderation dialog
│   ├── coupons/                # Coupon CRUD, validation rules
│   ├── shipping/               # Shipping method CRUD
│   ├── inventory/              # Stock management, movement history
│   └── notifications/          # Notification bell, list, read/unread/delete actions
├── hooks/                      # useDocumentTitle, useDebounce, useMediaQuery, useOnlineStatus
├── lib/
│   ├── api-error.ts            # API error parsing utility
│   ├── query-client.ts         # TanStack Query client config
│   └── utils.ts                # cn() helper, formatters
├── routes/                     # TanStack Router file-based routes
├── stores/
│   ├── auth.store.ts           # Zustand auth state (in-memory)
│   └── theme.store.ts          # Zustand theme (persisted)
└── main.tsx                    # Entry point
```

---

## Testing

```bash
# Run all unit tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run E2E tests (requires backend running)
pnpm test:e2e
```

- **15 test suites** with **90+ unit tests**
- **8 E2E test suites** with **45 Playwright tests**
- MSW v2 for API mocking (handlers per domain)
- Fresh QueryClient per test (no cache leakage)
- E2E scenarios: login flow, auth guard, product CRUD, category CRUD, order workflow, review moderation, search/filter, full navigation

---

## CI/CD

GitHub Actions runs **5 parallel jobs** on every PR and push to main:

| Job                    | Description                            |
| ---------------------- | -------------------------------------- |
| **Lint & Format**      | ESLint + Prettier checks               |
| **Type Check & Build** | TypeScript compilation + Vite build    |
| **Unit Tests**         | All Vitest tests                       |
| **Bundle Size**        | size-limit budget enforcement          |
| **Security Audit**     | `pnpm audit` for known vulnerabilities |

- GitHub Actions pinned by SHA (supply chain protection)
- pnpm dependency caching
- Concurrency control (cancels stale PR runs)
- Dependabot for automated dependency updates (npm + GitHub Actions)

---

## Environment Variables

See [`.env.example`](.env.example) for all required variables.

| Variable       | Description          | Default                 |
| -------------- | -------------------- | ----------------------- |
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000` |

| File               | Mode                     | API Target                   |
| ------------------ | ------------------------ | ---------------------------- |
| `.env.development` | `pnpm dev`               | Local backend (localhost)    |
| `.env.production`  | `pnpm dev:prod` / Vercel | Production backend (Railway) |

All environment variables are validated at build time via Zod. The app will not build with missing or invalid configuration.

---

## Security

- Access tokens stored in memory only (never localStorage/sessionStorage)
- Refresh tokens in httpOnly cookies (JS never sees them)
- Token rotation with reuse detection
- CSRF protection via SameSite=Strict + custom header
- Multi-tab session sync (logout propagation)
- Admin role enforcement (rejects non-admin users at login)
- Content Security Policy (CSP) — restricts script, style, image, and connect sources
- HSTS with 2-year max-age, includeSubDomains, and preload
- X-Frame-Options: DENY — prevents clickjacking
- Permissions-Policy — disables camera, microphone, geolocation
- No `any` types — strict TypeScript with ESLint enforcement
- React Compiler lint rules for purity and immutability
- Bundle size budgets to catch accidental large imports
- Automated security audit in CI pipeline

---

## License

Copyright (c) 2026 Krzysztof Obarzanek. **All Rights Reserved.**

This project is proprietary. No part of the source code may be copied, modified, distributed, or used without prior written permission. See [LICENSE](LICENSE) for details.
