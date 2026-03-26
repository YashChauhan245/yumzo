import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import StatsCards from '../components/dashboard/StatsCards';
import RevenueChart from '../components/dashboard/RevenueChart';
import OrdersDonut from '../components/dashboard/OrdersDonut';
import RecentOrders from '../components/dashboard/RecentOrders';
import TopRestaurants from '../components/dashboard/TopRestaurants';
import LiveDeliveryMap from '../components/dashboard/LiveDeliveryMap';

const THEME_STORAGE_KEY = 'yumzo-theme';

const renderDefaultDashboardSection = () => {
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

const Dashboard = () => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    window.dispatchEvent(new Event('yumzo-theme-change'));
  }, [theme]);

  const renderDashboardSection = () => {
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
              <p className="chart-subtitle">Basic dashboard preferences</p>
            </div>
          </div>
          <div className="space-y-3 p-1 text-sm text-[#A1A1AA]">
            <p>Current theme: <span className="font-semibold text-white">{theme}</span></p>
            <p>Use the top-right theme button to switch dashboard appearance.</p>
          </div>
        </section>
      );
    }

    return renderDefaultDashboardSection();
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
          user={user}
          theme={theme}
          onToggleTheme={() => setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'))}
        />

        <div className="dashboard-content">
          {renderDashboardSection()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
