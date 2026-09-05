# Business Operations Platform

A full-stack business operations platform built with **React, TypeScript, Spring Boot, and PostgreSQL**.

The platform centralizes core business workflows such as customers, products, inventory, sales orders, invoices, payments, dashboards, notifications, and audit logs in one application.

## Features

- 🔐 JWT-based authentication and role-based authorization
- 👥 Customer management
- 📦 Product management
- 📊 Inventory tracking and stock movements
- 🧾 Sales order management
- 💰 Invoice management
- 💳 Payment recording and tracking
- 📈 Operational dashboard and sales insights
- 🔔 Notifications
- 📝 Audit logs
- 🌗 Light and dark mode inside the application
- 📱 Responsive React UI
- 📚 Swagger/OpenAPI documentation
- ✅ Automated backend tests
- 🐘 PostgreSQL database
- 🐳 Docker Compose support

## User Roles

### Administrator

Full access to the platform, including:

- Customers
- Products
- Inventory
- Sales Orders
- Invoices
- Payments
- Dashboard
- Audit Logs
- Notifications

### Manager

Operational access to most modules, including:

- Customers
- Products
- Inventory
- Sales Orders
- Invoices
- Dashboard
- Audit Logs
- Notifications

Payment operations are restricted.

### Staff

Operational access focused on day-to-day activities:

- Dashboard
- Customers
- Sales Orders
- Inventory
- Invoices
- Notifications

Administrative operations such as product creation, inventory modification, payment operations, and audit-log access are restricted according to role permissions.

## Core Business Workflow

The platform supports a typical business workflow:

```text
Customer
   ↓
Product
   ↓
Sales Order
   ↓
Order Confirmation
   ↓
Inventory Reduction
   ↓
Invoice
   ↓
Payment
   ↓
Dashboard / Audit Log / Notifications



Business-Management-System/
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   └── test/
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md


Host: localhost
Port: 5432
Database: business_management
Username: postgres
Password: postgres



Running the Application
1. Start PostgreSQL
If using Docker:

Bash

docker compose up -d
2. Run the Backend
Open a terminal:

Bash

cd backend
mvn spring-boot:run
Backend:


http://localhost:8081
3. Run the Frontend
Open another terminal:

Bash

cd frontend
npm install
npm run dev
Frontend:


http://localhost:5173
The Vite development server proxies /api requests to the Spring Boot backend running on port 8081.

Optional Frontend Environment Variable
The frontend can use:

env

VITE_API_BASE_URL=/api
This is the recommended development configuration because the Vite proxy forwards API requests to the backend.

Demo Accounts
The application includes development/demo users for testing different authorization levels.

Role	Email	Password
Administrator	admin@business.local	Admin123!
Manager	manager@business.local	Manager123!
Staff	staff@business.local	Staff123!

These credentials are for local development/demo purposes only and must not be used in production.

API Documentation
Swagger UI:


http://localhost:8081/swagger-ui.html
OpenAPI specification:


http://localhost:8081/v3/api-docs
Health Check
The backend exposes a health endpoint:


http://localhost:8081/api/health
Expected response:

JSON

{
  "status": "UP",
  "application": "Business Management System"
}
Running Tests
Backend tests require a running PostgreSQL instance with the database configured.

Example for Windows PowerShell:

PowerShell

cd backend

$env:DB_HOST="localhost"
$env:DB_PORT="5432"
$env:DB_NAME="business_management"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="postgres"

mvn test
Test configuration is located at:


backend/src/test/resources/application.yml
The test configuration uses the same database environment variables as the main application.

If PostgreSQL is not running or the credentials are incorrect, integration tests will fail with a datasource connection error. This is an environment configuration issue rather than an application defect.

Frontend Production Build
To create a production build:

Bash

cd frontend
npm run build
The generated files are placed in:


frontend/dist/
Application URLs
Service	URL
Frontend	http://localhost:5173
Backend	http://localhost:8081
Health Check	http://localhost:8081/api/health
Login API	http://localhost:8081/api/auth/login
Swagger UI	http://localhost:8081/swagger-ui.html
OpenAPI Docs	http://localhost:8081/v3/api-docs

Security
The application implements:

JWT authentication

BCrypt password hashing

Stateless Spring Security authentication

Role-based endpoint authorization

Protected frontend routes

Role-based frontend navigation

Global API exception handling

Request validation

CORS configuration

Optimistic locking for sales orders

Business Rules
Some important business rules implemented in the application include:

Product SKU must be unique

Selling price must be greater than zero

Inventory cannot become negative

Stock adjustments require a reason

Products with inventory history are deactivated instead of deleted

Sales orders must have sufficient stock before confirmation

Confirming a sales order automatically creates a stock-out movement

Invoice numbers are generated sequentially by year

An invoice can only be generated for a confirmed sales order

Duplicate invoices for the same sales order are prevented

Payments cannot exceed the invoice balance

Invoice payment status is updated automatically

Role-based authorization restricts sensitive operations

Testing
The backend contains unit and integration tests covering:

Authentication and authorization

Customer operations

Product operations

Inventory operations

Sales orders

Invoice operations

Payment operations

Dashboard services

Notifications

Audit logs

Role-based access control

Project Status

The project intentionally focuses on core business workflows rather than attempting to implement a complete ERP system.







.




