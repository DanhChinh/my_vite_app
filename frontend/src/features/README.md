# Frontend feature structure

This project is organized by user role and access level:

- `guest/`: public pages such as home, login, landing views
- `customer/`: cart, checkout, customer profile/dashboard
- `staff/`: staff cart review and operations
- `admin/`: admin dashboard and management tools

This keeps the UI separated by business domain and makes the application easier to grow. 
