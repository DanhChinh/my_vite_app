# Database Schema

This document describes the relational model currently used by the application.

## Core tables

### users
Stores login credentials and role information.

| Column | Type | Notes |
| --- | --- | --- |
| id | INT / BIGINT PK | unique user id |
| username | VARCHAR | unique login identifier |
| password | VARCHAR | hashed password |
| role | ENUM | admin, staff, customer |
| created_at | TIMESTAMP | audit field |

### customers
Stores customer-specific personal and shipping details.

| Column | Type | Notes |
| --- | --- | --- |
| id | INT / BIGINT PK | customer id |
| user_id | INT / BIGINT FK | references users.id |
| full_name | VARCHAR | display name |
| phone | VARCHAR | contact number |
| address | TEXT | shipping address |
| created_at | TIMESTAMP | audit field |

### categories
Stores product categories used by the storefront.

| Column | Type | Notes |
| --- | --- | --- |
| id | INT / BIGINT PK | category id |
| name | VARCHAR | category title |
| attributes | JSON / TEXT | category-specific product attributes |
| slug | VARCHAR | URL/filter identifier and navbar value |

### products
Stores the product catalogue.

| Column | Type | Notes |
| --- | --- | --- |
| id | INT / BIGINT PK | product id |
| category_id | INT / BIGINT FK | references categories.id |
| name | VARCHAR | product name |
| description | TEXT | product details |
| price | DECIMAL(10,2) | sale price |
| stock | INT | available inventory |
| attributes | JSON / TEXT | product-specific attribute values |

### product_images
Stores product images and identifies the primary image.

| Column | Type | Notes |
| --- | --- | --- |
| id | INT / BIGINT PK | image id |
| product_id | INT / BIGINT FK | references products.id |
| image_url | VARCHAR | image path or URL |
| is_primary | TINYINT / BOOLEAN | `1` for the primary image, otherwise `0` |

### orders
Stores a submitted checkout and its lifecycle status (`pending`, `confirmed`, `shipping`, `completed`, `cancelled`).

### order_items
Stores immutable product quantities and prices captured at checkout.

### carts
Stores a cart associated with a user. The current checkout flow creates a cart record; this schema does not contain a separate order record.

| Column | Type | Notes |
| --- | --- | --- |
| id | INT / BIGINT PK | cart id |
| user_id | INT / BIGINT FK | references users.id |
| updated_at | TIMESTAMP | last cart update |

### cart_items
Stores the products and quantities belonging to a cart.

| Column | Type | Notes |
| --- | --- | --- |
| id | INT / BIGINT PK | cart item id |
| cart_id | INT / BIGINT FK | references carts.id |
| product_id | INT / BIGINT FK | references products.id |
| quantity | INT | quantity in cart |

### staff
Stores staff-specific profile information.

| Column | Type | Notes |
| --- | --- | --- |
| id | INT / BIGINT PK | staff id |
| user_id | INT / BIGINT FK | references users.id |
| full_name | VARCHAR | display name |
| phone | VARCHAR | contact number |
| address | TEXT | address |
| position | VARCHAR | staff position |
| created_at | TIMESTAMP | audit field |

### customer_addresses
Stores multiple delivery addresses for a customer and identifies the default address.

### password_resets
Stores hashed, expiring, one-time password reset tokens. Plain reset tokens must never be stored.

### partner_staff
Associates staff members with the partners they manage.

### product_reviews
Stores product ratings and comments. Reviews can be moderated through `pending`, `approved`, `rejected`, and `hidden` statuses. A completed order and its product line verify a purchase.

### product_review_images
Stores optional images attached to product reviews.

### partners
Stores supplier and partner information.

| Column | Type | Notes |
| --- | --- | --- |
| id | INT / BIGINT PK | partner id |
| name | VARCHAR | partner name |
| supply_type | VARCHAR | supplied product/service type |
| details | TEXT | partner details |
| quality_info | TEXT | quality information |
| created_at | TIMESTAMP | audit field |

## Relationship overview

- one `user` can have one associated `customer` profile
- one `category` can contain many `products`
- one `user` can own many `carts` over time
- one `cart` can contain many `cart_items`
- each `cart_item` belongs to one `product`
- one `product` can have many `product_images`
- one `customer` can have many `customer_addresses`
- one `product` can belong to one `partner`
- one `partner` can have many assigned staff members

## Suggested constraints

In a production-grade implementation, these relationships should be enforced with:

- foreign key constraints
- non-null validations
- unique constraints on usernames and categories if required
- check constraints for positive quantities and prices
- indexes on `category_id`, `user_id`, `cart_id`, and `product_id`

## Notes

The migration in `backend/migrations/001_orders.sql` adds persistent order status, payment method, notes, and checkout line items.
