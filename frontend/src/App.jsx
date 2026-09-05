// src/App.jsx (Router chính)
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import HomePage from './features/guest/HomePage';
import LoginPage from './features/guest/LoginPage';
import ProductDetailPage from './features/guest/ProductDetailPage';
import CartPage from './features/customer/CartPage';
import CheckoutPage from './features/customer/CheckoutPage';
import CustomerDashboardPage from './features/customer/CustomerDashboardPage';
import StaffDashboardPage from './features/staff/StaffDashboardPage';
import AdminDashboardPage from './features/admin/AdminDashboardPage';

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/products/:productId" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />

          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <StaffDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/dashboard"
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <StaffDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;