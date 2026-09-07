import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/public/Navbar';
import Footer from '../components/public/Footer';
import LoginModal from '../components/auth/LoginModal';

export default function PublicLayout() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Navbar chung */}
      <Navbar onOpenLoginModal={() => setIsLoginModalOpen(true)} />

      {/* Nội dung trang thay đổi theo Route */}
      <main className="flex-grow-1">
        <Outlet />
      </main>

      {/* Footer chung */}
      <Footer />

      {/* Modal đăng nhập bật nhanh */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}