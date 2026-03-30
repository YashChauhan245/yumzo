import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { driverAPI, getApiErrorMessage } from '../../services/api';
import LiveDeliveryMap from '../../components/dashboard/LiveDeliveryMap';

const mockEarnings = [320, 450, 390, 610, 520, 740, 680];
const APP_LOGO_SRC = '/images/yumzo-logo.svg';

const getSparklinePath = (values, width = 240, height = 70, pad = 6) => {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const stepX = (width - pad * 2) / (values.length - 1);

  return values
    .map((v, idx) => {
      const ratio = max === min ? 0.5 : (v - min) / (max - min);
      const x = pad + idx * stepX;
      const y = height - pad - ratio * (height - pad * 2);
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
};

const statusBadgeClass = (status) => {
  if (status === 'delivered') return 'bg-emerald-500/15 text-emerald-300 border-emerald-600/30';
  if (status === 'out_for_delivery') return 'bg-blue-500/15 text-blue-300 border-blue-600/30';
  if (status === 'picked_up') return 'bg-cyan-500/15 text-cyan-300 border-cyan-600/30';
  return 'bg-zinc-500/15 text-zinc-300 border-zinc-600/30';
};

const nextStatusMap = {
  preparing: 'picked_up',
  picked_up: 'out_for_delivery',
  out_for_delivery: 'delivered',
};

const activeDeliveryStatuses = ['preparing', 'picked_up', 'out_for_delivery'];

export default function DriverDashboard() {
  const { user, logout } = useAuth();
  const [availableOrders, setAvailableOrders] = useState([]);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshOrders = async () => {
    // Step 1: fetch available and assigned orders.
    const availableRes = await driverAPI.getAvailableOrders();
    const assignedRes = await driverAPI.getAssignedOrders();

    // Step 2: update local state used by all dashboard cards.
    setAvailableOrders(availableRes?.data?.data?.orders || []);
    setAssignedOrders(assignedRes?.data?.data?.orders || []);
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        await refreshOrders();
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to load driver dashboard'));
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const activeOrders = useMemo(
    () => assignedOrders.filter((order) => activeDeliveryStatuses.includes(order.status)),
    [assignedOrders],
  );

  const completedOrders = useMemo(
    () => assignedOrders.filter((order) => order.status === 'delivered'),
    [assignedOrders],
  );

  const revenueThisWeek = useMemo(() => mockEarnings.reduce((sum, val) => sum + val, 0), []);

  const quickStats = [
    { label: 'Available Orders', value: availableOrders.length, helper: 'Ready to pick' },
    { label: 'Active Deliveries', value: activeOrders.length, helper: 'In progress' },
    { label: 'Completed Today', value: completedOrders.length, helper: 'Successful drops' },
    { label: 'Weekly Earnings', value: `₹${revenueThisWeek}`, helper: 'Estimated' },
  ];

  const handleAccept = async (orderId) => {
    try {
      // Accept order and then refresh dashboard counters/lists.
      await driverAPI.acceptOrder(orderId);
      toast.success('Order accepted');
      await refreshOrders();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not accept this order'));
    }
  };

  const handleDeliverUpdate = async (order) => {
    const nextStatus = nextStatusMap[order.status];
    if (!nextStatus) return;

    try {
      // Move order to next valid delivery stage.
      await driverAPI.updateOrderStatus(order.id, nextStatus);
      toast.success(`Order moved to ${nextStatus.replaceAll('_', ' ')}`);
      await refreshOrders();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not update delivery status'));
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_8%_8%,rgba(236,109,49,0.16),transparent_30%),radial-gradient(circle_at_92%_14%,rgba(245,184,112,0.12),transparent_32%),linear-gradient(180deg,#0B0B0B_0%,#0E0E0E_50%,#0B0B0B_100%)] px-4 py-6 md:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-5 flex items-center justify-between rounded-2xl border border-[#2A2A2A] bg-linear-to-r from-[#1A1A1A] to-[#161616] px-5 py-4 shadow-[0_16px_36px_rgba(0,0,0,0.28)]">
          <div className="flex items-center gap-3">
            <img src={APP_LOGO_SRC} alt="Yumzo" className="h-10 w-auto" loading="eager" />
            <div>
            <h1 className="text-xl font-semibold text-white">Driver Command Center</h1>
            <p className="text-sm text-[#A1A1AA]">Welcome back, {user?.name || 'Driver'}. Track routes, deliveries, and order flow live.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/driver/orders/available" className="rounded-xl border border-[#3C2A1E] bg-[#120F0D] px-4 py-2 text-sm font-medium text-[#F3E3D3] transition-all hover:border-[#EE6A2C] hover:bg-[#1A1410] hover:text-white">
              Available
            </Link>
            <button
              onClick={logout}
              className="rounded-xl border border-[#2A2A2A] bg-[#0B0B0B] px-4 py-2 text-sm text-white transition-all hover:border-[#3A3A3A] hover:bg-[#141414] hover:text-[#D4D4D8]"
            >
              Logout
            </button>
          </div>
        </header>

        {loading ? <div className="mb-5 rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-4 text-sm text-[#A1A1AA]">Loading dashboard...</div> : null}

        <section className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickStats.map((stat) => (
            <article key={stat.label} className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#3A3A3A] hover:shadow-[0_18px_32px_rgba(0,0,0,0.3)]">
              <p className="text-xs uppercase tracking-wide text-[#A1A1AA]">{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
              <p className="mt-1 text-xs text-[#7E7E87]">{stat.helper}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
          <article className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5 transition-all duration-300 hover:border-[#3A3A3A] hover:shadow-[0_20px_34px_rgba(0,0,0,0.28)]">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Earnings Trend</h2>
                <p className="text-sm text-[#A1A1AA]">Last 7 delivery shifts</p>
              </div>
              <span className="rounded-lg border border-emerald-600/40 bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-300">
                +18%
              </span>
            </div>

            <svg viewBox="0 0 240 70" className="h-24 w-full" role="img" aria-label="Driver earnings trend">
              <path d={getSparklinePath(mockEarnings)} fill="none" stroke="#6B7280" strokeWidth="3" strokeLinecap="round" />
            </svg>

            <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] text-[#7E7E87]">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5 transition-all duration-300 hover:border-[#3A3A3A] hover:shadow-[0_20px_34px_rgba(0,0,0,0.28)]">
            <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
            <p className="mt-1 text-sm text-[#A1A1AA]">Jump directly to your work queue</p>

            <div className="mt-4 space-y-2">
              <Link to="/driver/orders/available" className="block rounded-xl border border-[#2A2A2A] bg-[#0B0B0B] px-3 py-2 text-sm text-white transition-all hover:border-[#EE6A2C]/60 hover:bg-[#15110E]">
                View available orders
              </Link>
              <Link to="/driver/orders/assigned" className="block rounded-xl border border-[#2A2A2A] bg-[#0B0B0B] px-3 py-2 text-sm text-white transition-all hover:border-[#EE6A2C]/60 hover:bg-[#15110E]">
                Manage assigned orders
              </Link>
            </div>

            <div className="mt-4 rounded-xl border border-[#2A2A2A] bg-[#0E0E0E] p-3">
              <p className="text-xs uppercase tracking-wide text-[#A1A1AA]">Notifications</p>
              <div className="mt-2 space-y-2 text-sm">
                <p className="text-[#D4D4D8]">{availableOrders.length} new orders are waiting nearby.</p>
                <p className="text-[#D4D4D8]">{activeOrders.length} deliveries currently in progress.</p>
              </div>
            </div>
          </article>
        </section>

        <section className="mt-5 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
          <article className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-3 transition-all duration-300 hover:border-[#3A3A3A] hover:shadow-[0_18px_32px_rgba(0,0,0,0.28)]">
            <LiveDeliveryMap />
          </article>

          <article className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5 transition-all duration-300 hover:border-[#3A3A3A] hover:shadow-[0_18px_32px_rgba(0,0,0,0.28)]">
            <h2 className="text-lg font-semibold text-white">Active Orders</h2>
            <p className="mt-1 text-sm text-[#A1A1AA]">Live status updates</p>

            <div className="mt-3 space-y-2">
              {activeOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="rounded-lg border border-[#2A2A2A] bg-[#0B0B0B] p-3 text-sm text-[#D4D4D8]">
                  <p className="font-medium text-white">{order.restaurant_name || 'Restaurant'}</p>
                  <p className="mt-1 text-xs text-[#8D8D97]">{order.customer_name || 'Customer'} • {order.delivery_address || 'Address pending'}</p>
                  <span className={`mt-2 inline-flex rounded-md border px-2 py-1 text-[11px] ${statusBadgeClass(order.status)}`}>
                    {order.status.replaceAll('_', ' ')}
                  </span>
                </div>
              ))}
              {activeOrders.length === 0 ? <p className="text-sm text-[#A1A1AA]">No active deliveries.</p> : null}
            </div>
          </article>
        </section>

        <section className="mt-5">
          <article className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5 transition-all duration-300 hover:border-[#3A3A3A] hover:shadow-[0_18px_32px_rgba(0,0,0,0.28)]">
            <h2 className="text-lg font-semibold text-white">Completed Deliveries</h2>
            <p className="mt-1 text-sm text-[#A1A1AA]">{completedOrders.length} completed</p>

            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {completedOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="rounded-lg border border-[#2A2A2A] bg-[#0B0B0B] p-3 text-sm text-[#D4D4D8]">
                  <p className="font-medium text-white">{order.restaurant_name || 'Restaurant'}</p>
                  <p className="mt-1 text-xs text-[#8D8D97]">Delivered to {order.customer_name || 'Customer'}</p>
                </div>
              ))}
              {completedOrders.length === 0 ? <p className="text-sm text-[#A1A1AA]">No completed deliveries yet.</p> : null}
            </div>
          </article>
        </section>

        <section className="mt-5 grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5 transition-all duration-300 hover:border-[#3A3A3A] hover:shadow-[0_18px_32px_rgba(0,0,0,0.28)]">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Available Orders</h2>
              <span className="text-xs text-[#A1A1AA]">{availableOrders.length} open</span>
            </div>

            <div className="space-y-2">
              {availableOrders.slice(0, 4).map((order) => (
                <div key={order.id} className="rounded-lg border border-[#2A2A2A] bg-[#0B0B0B] p-3">
                  <p className="text-sm font-medium text-white">{order.restaurant_name || 'Restaurant'}</p>
                  <p className="mt-1 text-xs text-[#8D8D97]">{order.delivery_address}</p>
                  <button
                    onClick={() => handleAccept(order.id)}
                    className="mt-2 rounded-lg bg-linear-to-r from-[#EE6A2C] to-[#F68C3E] px-3 py-1.5 text-xs font-semibold text-white transition-all hover:brightness-105"
                  >
                    Accept
                  </button>
                </div>
              ))}
              {availableOrders.length === 0 ? <p className="text-sm text-[#A1A1AA]">No available orders right now.</p> : null}
            </div>
          </article>

          <article className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-5 transition-all duration-300 hover:border-[#3A3A3A] hover:shadow-[0_18px_32px_rgba(0,0,0,0.28)]">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Assigned Orders</h2>
              <span className="text-xs text-[#A1A1AA]">{activeOrders.length} active</span>
            </div>

            <div className="space-y-2">
              {activeOrders.slice(0, 4).map((order) => (
                <div key={order.id} className="rounded-lg border border-[#2A2A2A] bg-[#0B0B0B] p-3">
                  <p className="text-sm font-medium text-white">{order.restaurant_name || 'Restaurant'}</p>
                  <p className="mt-1 text-xs text-[#8D8D97]">Status: {order.status.replaceAll('_', ' ')}</p>
                  <button
                    onClick={() => handleDeliverUpdate(order)}
                    className="mt-2 rounded-lg bg-linear-to-r from-[#EE6A2C] to-[#F68C3E] px-3 py-1.5 text-xs font-semibold text-white transition-all hover:brightness-105"
                  >
                    Deliver
                  </button>
                </div>
              ))}
              {activeOrders.length === 0 ? <p className="text-sm text-[#A1A1AA]">No assigned orders yet.</p> : null}
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
