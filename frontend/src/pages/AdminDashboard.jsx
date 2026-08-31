// src/pages/AdminDashboard.jsx
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import StaffManager from '../components/admin/StaffManager';
import PartnerManager from '../components/admin/PartnerManager';
import ProductManager from '../components/admin/ProductManager';
import StatisticsView from '../components/admin/StatisticsView';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('stats');

  return (
    <div className="bg-light min-vh-100">
      <Navbar />

      <div className="container-fluid py-4">
        <div className="row">
          {/* Sidebar Menu */}
          <div className="col-md-3 col-lg-2 px-md-4 mb-4">
            <div className="card border-0 shadow-sm p-3 bg-white rounded-3">
              <h5 className="fw-bold text-dark mb-3 px-2">
                <i className="fa-solid fa-user-shield me-2 text-danger"></i>Quản Trị Viên
              </h5>
              <div className="nav flex-column nav-pills gap-2">
                <button 
                  className={`nav-link text-start fw-semibold ${activeTab === 'stats' ? 'active bg-dark text-white' : 'text-dark'}`}
                  onClick={() => setActiveTab('stats')}
                >
                  <i className="fa-solid fa-chart-pie me-2"></i> Thống kê hệ thống
                </button>
                <button 
                  className={`nav-link text-start fw-semibold ${activeTab === 'staff' ? 'active bg-dark text-white' : 'text-dark'}`}
                  onClick={() => setActiveTab('staff')}
                >
                  <i className="fa-solid fa-users-gear me-2"></i> Quản lý nhân viên
                </button>
                <button 
                  className={`nav-link text-start fw-semibold ${activeTab === 'partners' ? 'active bg-dark text-white' : 'text-dark'}`}
                  onClick={() => setActiveTab('partners')}
                >
                  <i className="fa-solid fa-handshake me-2"></i> Quản lý đối tác
                </button>
                <button 
                  className={`nav-link text-start fw-semibold ${activeTab === 'products' ? 'active bg-dark text-white' : 'text-dark'}`}
                  onClick={() => setActiveTab('products')}
                >
                  <i className="fa-solid fa-box-open me-2"></i> Quản lý sản phẩm
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-md-9 col-lg-10 px-md-4">
            {activeTab === 'stats' && <StatisticsView />}
            {activeTab === 'staff' && <StaffManager />}
            {activeTab === 'partners' && <PartnerManager />}
            {activeTab === 'products' && <ProductManager />}
          </div>
        </div>
      </div>
    </div>
  );
}