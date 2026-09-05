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
