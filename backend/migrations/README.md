# Database migrations

Run migrations in numeric order against the configured database. Execute these commands from the project root:

```bash
mysql -u root -p techstore_pro < backend/migrations/000_initial_schema.sql
mysql -u root -p techstore_pro < backend/migrations/001_orders.sql
mysql -u root -p techstore_pro < backend/migrations/002_customer_accounts.sql
mysql -u root -p techstore_pro < backend/migrations/003_customer_addresses.sql
mysql -u root -p techstore_pro < backend/migrations/004_product_partners.sql
mysql -u root -p techstore_pro < backend/migrations/005_password_resets.sql
mysql -u root -p techstore_pro < backend/migrations/006_product_reviews.sql
```

## Files

- `000_initial_schema.sql`: all core tables required by the application.
- `001_orders.sql`: persistent orders and order items.
- `002_customer_accounts.sql`: customer email, account activation state, and avatar URL.
- `003_customer_addresses.sql`: multiple shipping addresses with a default address flag.
- `004_product_partners.sql`: product-to-partner ownership and partner staff assignments.
- `005_password_resets.sql`: one-time password reset token storage.
- `006_product_reviews.sql`: product ratings, verified purchases, moderation, admin replies, and review images.

The `ALTER TABLE` migrations assume the existing core tables are created by `000_initial_schema.sql`. Run each file once per database. Before rerunning an `ALTER TABLE` file, check whether its columns, indexes, or foreign keys were already created. Back up an existing database before applying these migrations; they do not migrate legacy data from a different schema.
