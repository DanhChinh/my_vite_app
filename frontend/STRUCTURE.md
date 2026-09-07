# Frontend Structure Documentation

## Cấu trúc thư mục

```
frontend/src/
├── App.jsx                 # Router chính (định tuyến chính của app)
├── main.jsx                # Entry point
├── index.css               # Styles chung
│
├── constants/              # Hằng số cấu hình
│   └── api.js              # API endpoints & configuration
│
├── utils/                  # Hàm tiện ích
│   ├── auth.js             # Quản lý token, role
│   └── format.js           # Format tiền tệ, ngày tháng, text
│
├── services/               # API calls (axiosService)
│   ├── authService.js      # Login
│   ├── productService.js   # Quản lý sản phẩm
│   ├── categoryService.js  # Quản lý danh mục
│   ├── customerService.js  # Profile, cart checkout
│   ├── staffService.js     # Cart review
│   └── adminService.js     # Staff, partners, statistics
│
├── hooks/                  # Custom React Hooks
│   └── useAuth.js          # Authentication logic
│
├── context/                # React Context
│   └── CartContext.jsx     # Quản lý giỏ hàng toàn cục
│
├── components/             # React Components
│   ├── common/             # Common/Utility components
│   │   └── ProtectedRoute.jsx   # Bảo vệ route theo role
│   │
│   ├── shared/             # Shared UI components
│   │   └── Navbar.jsx           # Thanh điều hướng
│   │
│   └── modules/            # Admin management modules
│       ├── ProductManager.jsx    # CRUD sản phẩm
│       ├── StaffManager.jsx      # Quản lý nhân viên
│       ├── PartnerManager.jsx    # Quản lý đối tác
│       └── StatisticsView.jsx    # Thống kê
│
├── features/               # Tính năng theo vai trò (Pages)
│   ├── guest/              # Khách vãng lai
│   │   ├── HomePage.jsx         # Trang chủ
│   │   └── LoginPage.jsx        # Đăng nhập
│   │
│   ├── customer/           # Khách hàng đã đăng nhập
│   │   ├── CartPage.jsx         # Giỏ hàng
│   │   ├── CheckoutPage.jsx     # Thanh toán
│   │   └── CustomerDashboardPage.jsx # Dashboard
│   │
│   ├── staff/              # Nhân viên
│   │   └── StaffDashboardPage.jsx    # Dashboard
│   │
│   └── admin/              # Quản trị viên
│       └── AdminDashboardPage.jsx    # Dashboard
│
├── assets/                 # Hình ảnh, media
└── README.md               # Tài liệu
```

## Quy tắc tổ chức

### 1. **constants/** - Hằng số toàn bộ app
- API endpoints tập trung
- Role definitions
- Configuration values

### 2. **utils/** - Hàm tiện ích (stateless)
- Không có side effects
- Pure functions
- Helper functions được dùng lại nhiều nơi

### 3. **services/** - Gọi API
- Tất cả axios calls ở đây
- Mỗi role có một file service
- Error handling tập trung
- Trả về { success, data, message }

### 4. **hooks/** - Custom React Hooks
- Chứa logic có thể tái sử dụng
- useAuth, useCart, etc.

### 5. **context/** - Global state
- Quản lý state toàn cục (Cart, User, etc.)
- Chia sẻ giữa nhiều components

### 6. **components/**
- **common/**: Utility components (ProtectedRoute, etc.)
- **shared/**: Reusable UI components (Navbar, etc.)
- **modules/**: Feature-specific components (admin management)

### 7. **features/** - Tính năng/Pages
- Tổ chức theo vai trò (guest, customer, staff, admin)
- Mỗi vai trò là một thư mục riêng
- Chứa các page component chính

## Cách sử dụng

### Import constants
```javascript
import { ADMIN_ENDPOINTS, ROLES } from '../constants/api';
```

### Import services
```javascript
import { productService } from '../services/productService';
import { adminService } from '../services/adminService';

// Sử dụng
const data = await productService.getPublicProducts();
const result = await adminService.getStatistics();
```

### Import utilities
```javascript
import { formatCurrencyVND } from '../utils/format';
import { getAuthHeader, isAuthenticated } from '../utils/auth';

// Sử dụng
const price = formatCurrencyVND(50000); // "50,000 đ"
if (isAuthenticated()) { /* ... */ }
```

### Import hooks
```javascript
import { useAuth } from '../hooks/useAuth';

const { login, logout, isAuthenticated, userRole } = useAuth();
```

## Lợi ích của cấu trúc này

✅ **Rõ ràng**: Biết chỗ mỗi thứ ở đâu  
✅ **Tái sử dụng**: Services, utils, hooks dùng lại ở nhiều nơi  
✅ **Bảo trì dễ**: Thay đổi API endpoint chỉ cần sửa 1 chỗ  
✅ **Mở rộng dễ**: Thêm role mới, thêm feature mới  
✅ **Test dễ**: Services và hooks dễ test riêng biệt  
✅ **Tách biệt**: Logic nghiệp vụ (services) riêng, UI (components) riêng  
