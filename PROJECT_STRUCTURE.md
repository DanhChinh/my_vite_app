```
TechStore Pro - Full Stack Project
===================================

📁 FRONTEND STRUCTURE
frontend/src/
├── 📄 main.jsx                 # Entry point
├── 📄 App.jsx                  # Router chính
│
├── 📂 constants/               # Hằng số
│   ├── api.js                  # API endpoints, roles
│   └── index.js                # Export
│
├── 📂 utils/                   # Helper functions (stateless)
│   ├── auth.js                 # Token, role management
│   ├── format.js               # Currency, date, text formatting
│   └── index.js                # Export
│
├── 📂 services/                # API calls (axios)
│   ├── authService.js          # Login
│   ├── productService.js       # Product CRUD
│   ├── categoryService.js      # Categories
│   ├── customerService.js      # Customer profile, cart checkout
│   ├── staffService.js         # Staff operations
│   ├── adminService.js         # Admin operations
│   └── index.js                # Export
│
├── 📂 hooks/                   # Custom React Hooks
│   ├── useAuth.js              # Authentication logic
│   └── index.js                # Export
│
├── 📂 context/                 # Global State
│   └── CartContext.jsx         # Cart management
│
├── 📂 components/              # Reusable UI Components
│   ├── 📂 common/              # Utility components
│   │   └── ProtectedRoute.jsx  # Role-based route protection
│   │
│   ├── 📂 shared/              # Shared UI
│   │   ├── Navbar.jsx          # Navigation bar
│   │   ├── ProductCard.jsx     # Product display card
│   │   └── CategoryList.jsx    # Category filter
│   │
│   └── 📂 modules/             # Feature-specific modules
│       ├── ProductManager.jsx  # Admin: CRUD products
│       ├── StaffManager.jsx    # Admin: Manage staff
│       ├── PartnerManager.jsx  # Admin: Manage partners
│       └── StatisticsView.jsx  # Admin: View stats
│
└── 📂 features/                # Pages by role
    ├── 📂 guest/               # Unauthenticated
    │   ├── HomePage.jsx        # Product browsing
    │   └── LoginPage.jsx       # Authentication
    │
    ├── 📂 customer/            # Customer role
    │   ├── CartPage.jsx        # Shopping cart
    │   ├── CheckoutPage.jsx    # Checkout and cart persistence
    │   └── CustomerDashboardPage.jsx
    │
    ├── 📂 staff/               # Staff role
    │   └── StaffDashboardPage.jsx  # Cart review
    │
    └── 📂 admin/               # Admin role
        └── AdminDashboardPage.jsx  # Management dashboard


📁 BACKEND STRUCTURE
backend/
├── 📄 app.js                   # Express app + routes mounting
├── 📄 package.json             # Dependencies
├── 📄 .env                     # Config (DB, JWT)
│
├── 📂 config/
│   └── db.js                   # MySQL connection pool
│
├── 📂 middlewares/
│   ├── authMiddleware.js       # JWT verification & role check
│   └── uploadMiddleware.js     # Multer image upload validation
│
├── 📂 uploads/                 # Runtime product image files
│   └── .gitkeep
│
├── 📂 routes/                  # API endpoints (organized by role)
│   ├── guestRoutes.js          # Public: login, categories, products
│   ├── customerRoutes.js       # Customer: profile, products, cart checkout
│   ├── staffRoutes.js          # Staff: products and cart review
│   └── adminRoutes.js          # Admin: staff, partners, products
│
└── 📂 controllers/             # Business logic
    ├── authController.js       # Login & JWT
    ├── guestController.js      # Public listings
    ├── customerController.js   # Customer operations
    ├── staffController.js      # Staff operations
    └── adminController.js      # Admin operations


🔗 DATABASE TABLES
users          ← user accounts (id, username, password, role, created_at)
customers      ← customer info (id, user_id(if->user.id), full_name, phone, address, created_at)
staff          ← staff info (id, user_id(if->user.id), full_name, phone, address, position ,created_at)
categories     ← product categories (id, name, attributes, slug) trong do name dung lam navbar, name, attributes dung   the them cac thuoc tinh khi admin sua, them san pham
products       ← products (id, category_id(fk->categories.id), name, price, stock, description, attributes)
product_images ← product images (id, product_id(FK → products.id), image_url, is_primary(thiet lap anh chinh neu san pham co nhieu anh(0,1)))
carts          ← shopping carts (id, user_id(fk->user.id), updated_at)
cart_items     ← cart contents (id, cart_id(fk->cart.id), product_id(fk->products.id), quantity)
partners       ← suppliers (id, name, supply_type, details, quality_info, created_at)


📋 IMPORT PATTERNS

# Constants
import { API_BASE_URL, ADMIN_ENDPOINTS, ROLES } from '../constants';

# Services
import { authService, productService, adminService } from '../services';

# Utils
import { formatCurrencyVND, getAuthHeader, isAuthenticated } from '../utils';

# Hooks
import { useAuth, useCart } from '../hooks';

# Components
import Navbar from '../components/shared/Navbar';
import ProtectedRoute from '../components/common/ProtectedRoute';
import ProductManager from '../components/modules/ProductManager';
```

**Key Features:**
✅ Role-based API separation  
✅ Service layer for API calls  
✅ Centralized constants & utilities  
✅ Custom hooks for reusable logic  
✅ Clear component organization  
✅ Protected routes per role  
✅ Modular architecture  
