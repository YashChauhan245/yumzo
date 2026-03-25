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
          {/* Stats Cards */}
          <StatsCards />

          {/* Charts Row */}
          <div className="charts-row">
            <RevenueChart />
            <OrdersDonut />
          </div>

          {/* Recent Orders */}
          <RecentOrders />

          {/* Bottom Row */}
          <div className="bottom-row">
            <TopRestaurants />
            <LiveDeliveryMap />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
