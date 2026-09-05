# Deployment Guide

This project can be run locally for development or prepared for a hosted environment with a production-ready server setup.

## Local development

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Environment variables

### Backend

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

### Frontend

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=TechStore Pro
```

## Production deployment recommendations

### Option 1: Traditional hosting

- deploy the Express API on a Node.js-compatible server
- run the Vite frontend as a static build or serve through a reverse proxy
- configure a managed MySQL instance
- set environment variables securely in the hosting platform

### Option 2: Proxy + build deployment

1. Build the frontend:

```bash
cd frontend
npm run build
```

2. Serve the static build with NGINX or a hosting platform.
3. Host the backend API on a separate Node process.
4. Route `/api` requests to the backend service.

### Option 3: Docker-based deployment

This project is a good candidate for a future Docker setup:

- one container for the Express API
- one container for the MySQL database
- one container for the frontend static build or dev server

## Operational checklist

- verify environment variables are not committed to version control
- enable HTTPS in production
- rotate JWT secrets regularly
- restrict database access by IP or network policy
- add monitoring and log aggregation
- create a backup strategy for MySQL data

## Suggested process manager

For production Node.js hosting, consider using PM2 or a container orchestrator:

```bash
npm install -g pm2
pm2 start app.js --name techstore-api
```
