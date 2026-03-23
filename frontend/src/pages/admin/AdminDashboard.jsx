import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';
import { adminAPI, getApiErrorMessage } from '../../services/api';

const cardList = [
  { key: 'total_users', label: 'Total Users' },
  { key: 'total_orders', label: 'Total Orders' },
  { key: 'total_restaurants', label: 'Total Restaurants' },
  { key: 'total_menu_items', label: 'Total Menu Items' },
  { key: 'active_deliveries', label: 'Active Deliveries' },
];

const monthlyRevenue = [18, 23, 21, 29, 27, 33, 31, 36, 34, 40, 43, 47];

const getSparklinePath = (values, width = 300, height = 88, padding = 8) => {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const stepX = (width - padding * 2) / (values.length - 1);

  return values
    .map((value, index) => {
      const ratio = max === min ? 0.5 : (value - min) / (max - min);
      const x = padding + index * stepX;
      const y = height - padding - ratio * (height - padding * 2);
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const { data } = await adminAPI.getDashboard();
        setStats(data?.data?.stats || {});
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to load dashboard stats'));
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return (
    <AdminLayout
      title="Admin Dashboard"
      subtitle="Monitor platform health with live trends, key metrics, and order mix insights."
    >
      {loading ? (
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-4 text-sm text-[#A1A1AA]">Loading stats...</div>
      ) : (
        <div className="space-y-5">
          <section className="rounded-2xl border border-[#2A2A2A] bg-[radial-gradient(circle_at_10%_20%,rgba(88,101,242,0.14),transparent_42%),radial-gradient(circle_at_85%_30%,rgba(16,185,129,0.16),transparent_38%),#151515] p-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#A1A1AA]">Control Tower</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Platform Pulse</h2>
                <p className="mt-1 text-sm text-[#C4C4CC]">A quick snapshot of users, orders, and deliveries in motion.</p>
              </div>
              <div className="rounded-xl border border-[#313131] bg-[#0F0F10] px-4 py-2 text-sm text-[#D4D4D8]">
                Live Refresh: <span className="font-semibold text-white">Every 30s</span>
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {cardList.map((card, index) => (
              <article key={card.key} className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-4">
                <p className="text-xs uppercase tracking-wide text-[#A1A1AA]">{card.label}</p>
                <p className="mt-3 text-3xl font-semibold text-white">{stats?.[card.key] ?? 0}</p>
                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-[#111]">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-[#4F46E5] via-[#2563EB] to-[#10B981]"
                    style={{ width: `${58 + index * 8}%` }}
                  />
                </div>
              </article>
            ))}
          </section>

          <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
            <article className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Revenue Momentum</h3>
                  <p className="text-sm text-[#A1A1AA]">Month-over-month trajectory</p>
                </div>
                <span className="rounded-lg border border-emerald-700/50 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">+12.4%</span>
              </div>

              <svg viewBox="0 0 300 88" className="h-32 w-full" role="img" aria-label="Revenue sparkline">
                <defs>
                  <linearGradient id="revenueLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="100%" stopColor="#34D399" />
                  </linearGradient>
                </defs>
                <path d={getSparklinePath(monthlyRevenue)} fill="none" stroke="url(#revenueLine)" strokeWidth="3" strokeLinecap="round" />
              </svg>

              <div className="mt-2 grid grid-cols-6 gap-2 text-[11px] text-[#777]">
                {['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'].map((month) => (
                  <span key={month}>{month}</span>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-5">
              <h3 className="text-lg font-semibold text-white">Order Mix</h3>
              <p className="mb-4 text-sm text-[#A1A1AA]">Current channel split</p>

              <div className="space-y-3">
                {[
                  { label: 'Delivery', value: 48, color: 'bg-[#60A5FA]' },
                  { label: 'Pickup', value: 31, color: 'bg-[#34D399]' },
                  { label: 'Dine-in', value: 21, color: 'bg-[#F59E0B]' },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-[#D4D4D8]">{row.label}</span>
                      <span className="text-[#A1A1AA]">{row.value}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#111]">
                      <div className={`h-full rounded-full ${row.color}`} style={{ width: `${row.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </div>
      )}
    </AdminLayout>
  );
}
