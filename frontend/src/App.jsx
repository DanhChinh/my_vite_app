// src/App.jsx (Ví dụ cấu hình Route)
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard'; // <-- Import trang Admin chính

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* Đường dẫn dành cho Nhân viên kho */}
          <Route 
            path="/staff" 
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <StaffDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Đường dẫn dành cho Quản trị viên (Admin) */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;