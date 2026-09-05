# Architecture Overview

## 1. System purpose

TechStore Pro is a full-stack commerce platform designed for a technology retail workflow. It is structured to support browsing, ordering, staff operations, and administrative management using a modular backend and a client-side React application.

## 2. High-level components

### Frontend application
The frontend lives in `frontend/` and is built with React and Vite. It is responsible for:

- rendering the storefront and catalogue views
- handling navigation and protected routes
- managing cart state with React Context
- calling the API for authentication, catalogue, and cart actions

### Backend API
The backend lives in `backend/` and is built with Node.js and Express. It is responsible for:

- exposing REST endpoints
- validating authorization
- handling route-level business logic
- interacting with MySQL for persistent storage

### Database layer
The project uses MySQL with connection pooling. The database contains users, customer and staff profiles, categories, products, product images, carts, cart items, and partners. It does not currently contain persistent order or order-item tables.

## 3. Request flow

1. User opens a page in the React frontend.
2. The page calls a backend endpoint through Axios or a similar HTTP client.
3. Express route handlers validate the request and apply middleware checks.
4. Authentication middleware verifies JWT tokens for protected routes.
5. Controller logic processes the request and interacts with the database.
6. Response is returned as JSON to the frontend application.
7. React updates UI state and rerenders the user view.

## 4. Security model

- JWTs are used for user authentication.
- Protected API routes require the `Authorization: Bearer <token>` format.
- Admin-only operations are enforced through role checks.
- Sensitive configuration is stored in environment files instead of source code.

## 5. Folder responsibilities

```text
backend/
├── app.js              # Express application entry point
├── config/             # database and runtime configuration
├── controllers/        # business logic for each route group
├── middlewares/        # auth and route protection logic
├── routes/             # endpoint declarations
└── .env.example        # example environment file

frontend/
├── src/                # page, component, styling, and state code
├── public/             # static assets
├── vite.config.js      # Vite configuration
├── .env.example        # frontend runtime configuration
└── package.json        # frontend dependencies and scripts
```

## 6. Design notes

The structure intentionally mirrors what teams often use in a real project:

- clearly separated frontend and backend
- route-level grouping by business area
- configurations externalized into `.env` files
- middleware-based authorization checks
- clear responsibilities across services and modules

## 7. Planned improvements

To move closer to a production-ready deployment, the project would benefit from:

- database migrations
- standardized validation middleware
- test suites for controllers and routes
- centralized error handling
- CI/CD pipelines
- Docker and container orchestration
