# API Reference

This document summarizes the primary backend routes used by the application.

## Base URL

By default, the local API is served at:

```text
http://localhost:5000/api
```

## Authentication

Protected routes expect a JWT token in the request header:

```http
Authorization: Bearer <token>
```

## Public endpoints

### Login

```http
POST /api/login
```

Request body:

```json
{
  "username": "admin",
  "password": "password123"
}
```

Expected behavior:

- validates the user credentials
- returns a JWT token on successful login
- returns an authentication error for invalid credentials

### Get product categories

```http
GET /api/categories
```

### Get all products

```http
GET /api/products
```

## Customer routes

All customer routes require authentication.

### Get profile

```http
GET /api/customer/profile
```

### Update profile

```http
PUT /api/customer/profile
```

Example request body:

```json
{
  "fullName": "Nguyen Van A",
  "phone": "0909123456",
  "address": "123 Le Loi Street"
}
```

## Cart checkout

### Submit cart contents

```http
POST /api/customer/orders
```

Authorization required.

Example request body:

```json
{
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 3, "quantity": 1 }
  ],
  "shipping_address": "123 Main Street",
  "total_price": 12500000
}
```

The endpoint stores the submitted data in `carts` and `cart_items`. The current schema does not persist an order record, payment, shipping history, or order status.

## Staff routes

### Get carts for staff view

```http
GET /api/staff/orders
```

### Validate a cart reference

```http
PUT /api/staff/orders/:orderId
```

Example request body:

```json
{
  "status": "processing"
}
```

The endpoint checks that the cart exists, but cannot persist `status` because the `carts` table has no status column.

## Admin routes

All admin routes are protected with token verification and role enforcement.

### Dashboard statistics

```http
GET /api/admin/statistics
```

### Get staff list

```http
GET /api/admin/staff
```

### Create staff account

```http
POST /api/admin/staff
```

### Reset staff password

```http
PUT /api/admin/staff/:id/reset-password
```

### Delete staff account

```http
DELETE /api/admin/staff/:id
```

### Get partners

```http
GET /api/admin/partners
```

### Create partner

```http
POST /api/admin/partners
```

### Update partner

```http
PUT /api/admin/partners/:id
```

### Delete partner

```http
DELETE /api/admin/partners/:id
```

### Create product (admin)

```http
POST /api/admin/products
```

### Update product (admin)

```http
PUT /api/admin/products/:id
```

### Delete product (admin)

```http
DELETE /api/admin/products/:id
```

## Error handling conventions

The API generally uses standard HTTP status codes:

- `200` OK
- `201` Created
- `401` Unauthorized
- `403` Forbidden
- `404` Not Found
- `500` Internal Server Error

Responses are usually returned as JSON objects with a `success` flag and a message.
