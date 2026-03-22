/**
 * DashboardPreview — Standalone preview (no auth required)
 * Access at /dashboard-preview to see the full dashboard without logging in.
 * Perfect for portfolio demos & screenshots.
 */
import { useState, useEffect } from 'react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import StatsCards from '../components/dashboard/StatsCards';
import RevenueChart from '../components/dashboard/RevenueChart';
import OrdersDonut from '../components/dashboard/OrdersDonut';
import RecentOrders from '../components/dashboard/RecentOrders';
import TopRestaurants from '../components/dashboard/TopRestaurants';
import LiveDeliveryMap from '../components/dashboard/LiveDeliveryMap';

const DashboardPreview = () => {
  const mockUser = { name: 'Yash Chauhan', role: 'admin', email: 'yash@yumzo.com' };
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');
  const theme = 'dark';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('yumzo-theme', theme);
  }, [theme]);

  return (
    <div className={`dashboard-shell ${theme}`}>
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeNav={activeNav}
        onNavChange={setActiveNav}
      />

      <div className={`dashboard-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <DashboardHeader
          user={mockUser}
          theme={theme}
          onToggleTheme={() => {}}
        />

        <div className="dashboard-content">
          <StatsCards />

          <div className="charts-row">
            <RevenueChart />
            <OrdersDonut />
          </div>

          <RecentOrders />

          <div className="bottom-row">
            <TopRestaurants />
            <LiveDeliveryMap />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPreview;
