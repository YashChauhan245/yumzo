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

const renderDefaultPreviewSection = () => {
  return (
    <>
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
    </>
  );
};

const DashboardPreview = () => {
  const mockUser = { name: 'Yash Chauhan', role: 'admin', email: 'yash@yumzo.com' };
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');
  const theme = 'dark';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('yumzo-theme', theme);
  }, [theme]);

  const renderPreviewSection = () => {
    if (activeNav === 'orders') {
      return <RecentOrders />;
    }

    if (activeNav === 'restaurants') {
      return (
        <div className="bottom-row">
          <TopRestaurants />
          <LiveDeliveryMap />
        </div>
      );
    }

    if (activeNav === 'analytics') {
      return (
        <div className="charts-row">
          <RevenueChart />
          <OrdersDonut />
        </div>
      );
    }

    if (activeNav === 'customers') {
      return <StatsCards />;
    }

    if (activeNav === 'settings') {
      return (
        <section className="orders-card">
          <div className="orders-header">
            <div>
              <h3 className="chart-title">Settings</h3>
              <p className="chart-subtitle">Preview-only dashboard preferences</p>
            </div>
          </div>
          <div className="space-y-3 p-1 text-sm text-[#A1A1AA]">
            <p>Current preview theme: <span className="font-semibold text-white">{theme}</span></p>
            <p>This route is for UI preview without authentication.</p>
          </div>
        </section>
      );
    }

    return renderDefaultPreviewSection();
  };

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
          {renderPreviewSection()}
        </div>
      </div>
    </div>
  );
};

export default DashboardPreview;
