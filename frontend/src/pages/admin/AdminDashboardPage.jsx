import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../../components/shared/Header';
import StaffManager from '../../components/modules/StaffManager';
import PartnerManager from '../../components/modules/PartnerManager';
import ProductManager from '../../components/modules/ProductManager';
import StatisticsView from '../../components/modules/StatisticsView';
import CustomerManager from '../../components/modules/CustomerManager';
import ReviewManager from '../../components/modules/ReviewManager';
import DashboardSidebar from '../../components/common/DashboardSidebar';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('stats');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const requestedTab = searchParams.get('tab');
    if (['stats', 'staff', 'partners', 'products', 'customers', 'reviews'].includes(requestedTab)) setActiveTab(requestedTab);
  }, [searchParams]);

  return (
    <div className="bg-light min-vh-100">
      <Header />

      <div className="container-fluid py-4"><div className="dashboard-layout">
          <DashboardSidebar role="admin" />
          <div className="dashboard-content">
            {activeTab === 'stats' && <StatisticsView />}
            {activeTab === 'staff' && <StaffManager />}
            {activeTab === 'partners' && <PartnerManager />}
            {activeTab === 'products' && <ProductManager />}
            {activeTab === 'customers' && <CustomerManager />}
            {activeTab === 'reviews' && <ReviewManager />}
          </div></div>
      </div>
    </div>
  );
}
