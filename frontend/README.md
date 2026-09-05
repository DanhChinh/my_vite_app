# Frontend Application

This folder contains the React client for TechStore Pro. It is built with Vite and uses a component-driven structure to render the storefront, customer dashboard, admin dashboard, and staff workflows.

## Responsibilities

- display the home and catalogue experience
- manage navigation and route guards
- handle cart state through a shared context provider
- connect UI actions to backend endpoints through Axios or similar HTTP calls
- render role-specific interfaces such as admin, staff, and customer views

## Key directories

```text
src/
├── components/
├── context/
├── pages/
├── App.jsx
├── main.jsx
├── index.css
└── App.css
```

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

## Environment variables

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=TechStore Pro
```

## Build

```bash
npm run build
```

## Notes

The frontend is intentionally organized to support a realistic commerce application, including protected routes and role-specific views. As the project matures, it can be expanded with form validation, reusable API utilities, and test coverage.
