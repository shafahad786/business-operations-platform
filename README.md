# Business Management System

## Overview

A full-stack **Business Management System** for medium-sized operations. It covers the complete sales workflow from customer and product management through inventory, sales orders, invoicing, payments, dashboard analytics, audit logging, and in-app notifications.

Built as a portfolio-grade application with JWT authentication, role-based authorization, PostgreSQL persistence, and a modern React frontend.

## Key Features

- **Authentication & authorization** — JWT login with ADMIN, MANAGER, and STAFF roles
- **Customers** — CRUD with search and pagination
- **Products** — Catalog with SKU, pricing, and stock levels
- **Inventory** — Stock in/out/adjust with movement history and low-stock alerts
- **Sales orders** — Draft → confirm workflow with inventory reduction on confirmation
- **Invoices** — Generated from confirmed orders; unpaid / partially paid / paid lifecycle
- **Payments** — Recorded against invoices (via invoice details); overpayments blocked
- **Dashboard** — KPIs, sales chart, recent orders/payments, low stock, activity feed
- **Audit logs** — Backend-generated trail of business actions
- **Notifications** — In-app alerts for low stock, payments, order confirmations, and more
- **API documentation** — Swagger UI with Bearer token support

## Technology Stack

| Layer | Technologies |
|-------|-------------|
| Backend | Java 21, Spring Boot 3.4.2, Maven, Spring Security, Spring Data JPA |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Axios, Zod, React Router |
| Database | PostgreSQL 16 |
| Auth | JWT (jjwt), BCrypt |
| API docs | Springdoc OpenAPI 3 |

## Architecture

```
React SPA (Vite)  →  REST API (Spring Boot)  →  PostgreSQL
        ↑                      ↑
   JWT in localStorage    JWT filter + @PreAuthorize
```

- **Backend:** Layered architecture — Controller → Service → Repository → Entity
- **Frontend:** Pages, reusable UI components, service layer (`apiClient`), auth context
- **Security:** Stateless JWT; backend `@PreAuthorize` is authoritative; frontend routes mirror roles

## Modules

| Module | Description |
|--------|-------------|
| Auth | Login, current user, JWT issuance |
| Customers | Customer master data |
| Products | Product catalog and pricing |
| Inventory | Stock levels and movements |
| Sales Orders | Order lifecycle (DRAFT → CONFIRMED / CANCELLED) |
| Invoices | Billing from confirmed orders |
| Payments | Payment recording against invoices |
| Dashboard | Aggregated metrics and recent activity |
| Audit Logs | Immutable action history |
| Notifications | Per-user in-app notification center |

## Authentication & Authorization

### Demo credentials (DEVELOPMENT ONLY)

| Role | Email | Password |
|------|-------|----------|
| ADMIN | admin@business.local | Admin123! |
| MANAGER | manager@business.local | Manager123! |
| STAFF | staff@business.local | Staff123! |

> **Do not use these credentials in production.**

### Role access

| Capability | ADMIN | MANAGER | STAFF |
|------------|-------|---------|-------|
| Dashboard (full financial) | ✓ | ✓ | Operational only |
| Customers (view/create/update) | ✓ | ✓ | ✓ |
| Customer delete | ✓ | ✓ | ✗ |
| Products (view) | ✓ | ✓ | ✓ |
| Products (create/update/delete) | ✓ | ✓ | ✗ |
| Inventory (view) | ✓ | ✓ | ✓ |
| Inventory (modify) | ✓ | ✓ | ✗ |
| Orders (view/create/update draft) | ✓ | ✓ | ✓ |
| Orders (confirm/cancel) | ✓ | ✓ | ✗ |
| Invoices (view/history) | ✓ | ✓ | ✓ |
| Invoices (generate/cancel) | ✓ | ✓ | ✗ |
| Payments (record) | ✓ | ✓ | ✗ |
| Audit logs | ✓ | ✓ | ✗ |
| Notifications (own) | ✓ | ✓ | ✓ |

## Business Workflow

```
Customer → Product → Sales Order (DRAFT)
                          ↓ confirm
                    Inventory ↓ (stock OUT)
                          ↓
                      Invoice → Payment → Dashboard / Audit / Notifications
```

**Rules preserved:**
- Inventory is reduced only when an order is **CONFIRMED**
- Invoices do not modify inventory
- Payments do not modify inventory
- Overpayments are rejected
- Cancelled invoices cannot receive payments
- One invoice per confirmed sales order

## Backend Structure

```
backend/src/main/java/com/businessmanagement/
├── config/          DataInitializer, Security, JPA auditing
├── controller/      REST endpoints
├── dto/             Request/response objects
├── entity/          JPA entities and enums
├── exception/       Custom exceptions + GlobalExceptionHandler
├── mapper/          Entity ↔ DTO mappers
├── repository/      Spring Data JPA repositories
├── security/        JWT filter, SecurityUtils
└── service/         Business logic
```

## Frontend Structure

```
frontend/src/
├── components/      UI components (dashboard, forms, layout)
├── contexts/        AuthContext
├── hooks/           useBackendHealth
├── layouts/         AppLayout (sidebar + top nav)
├── lib/             apiClient, navigation, schemas, utils
├── pages/           Route pages
├── services/        API service functions
└── types/           TypeScript interfaces
```

## Database

- PostgreSQL with `spring.jpa.hibernate.ddl-auto=update`
- Seeded idempotently on startup via `DataInitializer`
- Optimistic locking on `Inventory` and `Invoice` where required

### Docker Compose (recommended)

From the project root:

```bash
docker compose up -d
```

| Setting | Value |
|---------|-------|
| Database | `business_management` |
| Username | `postgres` |
| Password | `postgres` |
| Port | `5432` |

## API Documentation

After starting the backend:

- **Swagger UI:** http://localhost:8080/swagger-ui.html
- **OpenAPI JSON:** http://localhost:8080/v3/api-docs

Use **Authorize** with `Bearer <token>` after logging in via `/api/auth/login`.

## Local Setup

### Prerequisites

- Java 21
- Maven 3.9+
- Node.js 18+
- PostgreSQL 16 (or Docker)

### Environment variables

Copy `.env.example` to configure your environment:

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `business_management` | Database name |
| `DB_USERNAME` | `postgres` | Database user |
| `DB_PASSWORD` | `postgres` | Database password |
| `JWT_SECRET` | (dev default) | JWT signing key (min 32 chars) |
| `JWT_EXPIRATION_MS` | `86400000` | Token lifetime |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,...` | Allowed frontend origins |

> If PostgreSQL runs on a non-default port (e.g. `55432`), set `DB_PORT` accordingly for both the application and tests.

### Backend

```bash
# Start database (if using Docker)
docker compose up -d

# Run backend
cd backend
mvn spring-boot:run
```

Backend: http://localhost:8080

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

Optional `frontend/.env`:

```
VITE_API_BASE_URL=http://localhost:8080/api
```

### Running tests

Integration tests require a **running PostgreSQL** instance with the database configured above.

```bash
cd backend

# Windows PowerShell example (adjust port/password if needed)
$env:DB_HOST="localhost"
$env:DB_PORT="5432"
$env:DB_NAME="business_management"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="postgres"
mvn test
```

Test configuration lives in `backend/src/test/resources/application.yml` and uses the same environment variables as the main application, with an explicit PostgreSQL dialect.

If PostgreSQL is not running or credentials are wrong, integration tests will fail with a datasource connection error — this is an **environment issue**, not an application bug.

### Production build

```bash
cd frontend
npm run build
```

Output: `frontend/dist/`

## URLs Summary

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8080 |
| Health | http://localhost:8080/api/health |
| Login API | http://localhost:8080/api/auth/login |
| Swagger | http://localhost:8080/swagger-ui.html |

## License

Portfolio / demonstration project.
