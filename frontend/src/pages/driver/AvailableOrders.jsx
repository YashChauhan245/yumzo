import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { driverAPI, getApiErrorMessage } from '../../services/api';

const getOrderPayout = (order) => Number(order.total_price ?? order.total_amount ?? 0);

const getAveragePayout = (orders) => {
  if (!orders.length) return 0;
  const total = orders.reduce((sum, order) => sum + getOrderPayout(order), 0);
  return Math.round(total / orders.length);
};

export default function AvailableOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingOrderId, setAcceptingOrderId] = useState('');
  const previousCountRef = useRef(0);

  const loadOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await driverAPI.getAvailableOrders();
      const nextOrders = data?.data?.orders || [];

      if (silent && nextOrders.length > previousCountRef.current) {
        toast.success('New order request received');
      }

      previousCountRef.current = nextOrders.length;
      setOrders(nextOrders);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load available orders'));
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();

    // Poll every 10s so drivers see new requests quickly.
    const poll = setInterval(() => {
      loadOrders(true);
    }, 10000);

    return () => clearInterval(poll);
  }, []);

  const acceptOrder = async (orderId) => {
    setAcceptingOrderId(orderId);
    try {
      await driverAPI.acceptOrder(orderId);
      toast.success('Order accepted');
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not accept this order'));
    } finally {
      setAcceptingOrderId('');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] px-4 py-6 md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">Available Orders</h1>
            <p className="text-sm text-[#A1A1AA]">Confirmed orders waiting to be picked up by you.</p>
          </div>
          <Link to="/driver/dashboard" className="text-sm text-[#D4D4D8] hover:underline">
            Back to dashboard
          </Link>
        </div>

        <section className="mb-5 rounded-2xl border border-[#2A2A2A] bg-[#151515] p-4 md:p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-[#A1A1AA]">Queue Size</p>
              <p className="mt-2 text-3xl font-semibold text-white">{orders.length}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-[#A1A1AA]">Avg Payout</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                Rs {getAveragePayout(orders)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-[#A1A1AA]">Notifications</p>
              <p className="mt-2 text-sm text-[#D4D4D8]">
                {orders.length > 0
                  ? `${orders.length} fresh requests in your nearby zone.`
                  : 'No new requests at this moment.'}
              </p>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-4 text-sm text-[#A1A1AA]">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-4 text-sm text-[#A1A1AA]">No available orders right now.</div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <article key={order.id} className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm text-[#A1A1AA]">Order ID</p>
                    <p className="text-sm font-medium text-white">{order.id}</p>
                  </div>
                  <span className="rounded-lg border border-blue-600/30 bg-blue-500/15 px-2.5 py-1 text-xs text-blue-300">Ready to accept</span>
                </div>

                <div className="mt-3 grid gap-2 text-sm text-[#C4C4CC] md:grid-cols-2">
                  <p><span className="text-[#8E8E96]">Restaurant:</span> {order.restaurant_name || 'Unknown'}</p>
                  <p><span className="text-[#8E8E96]">Customer:</span> {order.customer_name || 'N/A'}</p>
                  <p><span className="text-[#8E8E96]">Payout:</span> Rs {getOrderPayout(order).toFixed(2)}</p>
                  <p><span className="text-[#8E8E96]">Distance:</span> 2.4 km (est.)</p>
                </div>

                <p className="mt-2 text-sm text-[#A1A1AA]">Address: {order.delivery_address}</p>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => acceptOrder(order.id)}
                    disabled={acceptingOrderId === order.id}
                    className="rounded-xl bg-[#3A3A3A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2F2F2F] disabled:opacity-60"
                  >
                    {acceptingOrderId === order.id ? 'Accepting...' : 'Accept Order'}
                  </button>
                  <span className="text-xs text-[#7E7E87]">Instant assignment on accept</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
