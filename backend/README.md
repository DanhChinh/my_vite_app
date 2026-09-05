# Backend API

This folder contains the Express-based API for TechStore Pro. It exposes the application logic for authentication, product listings, cart checkout, profile management, and administrative operations.

## Responsibilities

- define HTTP endpoints for the application
- validate JWT authentication and authorization middleware
- orchestrate controller logic and database access
- return JSON responses using a consistent success/error pattern

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

## Environment variables

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=techstore_pro
JWT_SECRET=replace_with_a_long_random_secret
CORS_ORIGIN=http://localhost:5173
```

## Main route groups

- `authRoutes` for login
- `productRoutes` for catalogue endpoints
- `customerRoutes` for user profile actions
- `customerRoutes` for cart checkout
- `staffRoutes` for staff operations
- `adminRoutes` for administrative management

## Notes

The API is structured to support role-specific access and a realistic storefront workflow. In a production setting, it would benefit from stronger validation, centralized error handling, and a migration system for schema changes.
