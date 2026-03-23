import { useEffect, useMemo, useState } from 'react';
import { useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import AppLayout from '../components/layout/AppLayout';
import EmptyState from '../components/ui/EmptyState';
import { getApiErrorMessage, ordersAPI, paymentsAPI } from '../services/api';

const paymentMethods = [
  { label: 'Card', value: 'card' },
  { label: 'UPI', value: 'upi' },
  { label: 'Cash on delivery', value: 'cash_on_delivery' },
];

const orderTimeline = ['pending', 'confirmed', 'preparing', 'picked_up', 'out_for_delivery', 'delivered'];

const getDriverLocation = (orderId) => {
  const seed = orderId
    .split('')
    .reduce((sum, ch) => sum + ch.charCodeAt(0), 0);

  const lat = 28.6139 + ((seed % 10) - 5) * 0.003;
  const lng = 77.209 + ((seed % 8) - 4) * 0.003;

  return { lat: lat.toFixed(5), lng: lng.toFixed(5) };
};

const getCurrentTimelineStep = (status) => {
  const step = orderTimeline.indexOf(status);
  return step < 0 ? 0 : step;
};

const Orders = () => {
  const [searchParams] = useSearchParams();
  const highlightOrderId = searchParams.get('orderId');

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingOrderId, setPayingOrderId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [trackingOrderId, setTrackingOrderId] = useState('');
  const previousOrdersRef = useRef(new Map());

  const loadOrders = async (silent = false) => {
    setLoading(true);
    try {
      const { data } = await ordersAPI.getOrders();
      const nextOrders = data?.data?.orders || [];

      if (silent) {
        for (const order of nextOrders) {
          const prev = previousOrdersRef.current.get(order.id);
          if (!prev) continue;

          if (prev.status !== order.status) {
            toast.success(`Order ${order.id.slice(0, 8)} status updated: ${order.status.replaceAll('_', ' ')}`);
          }

          const hasNewRejectionNote =
            order.status === 'confirmed'
            && order.notes
            && order.notes.includes('[Driver Rejection]')
            && prev.notes !== order.notes;

          if (hasNewRejectionNote) {
            toast.error('Driver rejected your order. Reassigning to another nearby driver.');
          }
        }
      }

      previousOrdersRef.current = new Map(nextOrders.map((order) => [order.id, order]));
      setOrders(nextOrders);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load orders.'));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();

    const interval = setInterval(() => {
      loadOrders(true);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const pendingCount = useMemo(() => orders.filter((o) => o.status === 'pending').length, [orders]);

  const handlePayment = async (orderId) => {
    setPayingOrderId(orderId);
    try {
      await paymentsAPI.payOrder(orderId, {
        payment_method: paymentMethod,
        payment_details: paymentMethod === 'upi' ? 'test@upi' : 'demo payment',
      });
      toast.success('Payment successful');
      await loadOrders();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Payment failed.'));
    } finally {
      setPayingOrderId('');
    }
  };

  const statusClass = (status) => {
    if (status === 'pending') return 'bg-[#2A2A2A] text-[#A1A1AA]';
    if (status === 'confirmed') return 'bg-[#2A2A2A] text-[#A1A1AA]';
    if (status === 'cancelled') return 'bg-[#2A2A2A] text-[#A1A1AA]';
    return 'bg-[#2A2A2A] text-[#A1A1AA]';
  };

  const toggleTracking = (orderId) => {
    setTrackingOrderId((prev) => (prev === orderId ? '' : orderId));
  };

  const renderTrackingCard = (order) => {
    const location = getDriverLocation(order.id);
    const currentStep = getCurrentTimelineStep(order.status);

    return (
      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-800">Live tracking (demo)</p>
        <p className="mt-1 text-xs text-slate-500">Assigned driver: Rahul Verma</p>

        <div className="mt-3 grid gap-2 sm:grid-cols-5">
          {orderTimeline.map((step, idx) => (
            <div
              key={step}
              className={`rounded-md px-2 py-1 text-center text-xs font-semibold ${
                idx <= currentStep ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {step.replaceAll('_', ' ')}
            </div>
          ))}
        </div>

        <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
          <iframe
            title={`order-map-${order.id}`}
            src={`https://www.google.com/maps?q=${location.lat},${location.lng}&z=13&output=embed`}
            className="h-56 w-full"
            loading="lazy"
          />
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      <section className="surface-card rounded-2xl p-6 md:p-7">
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Order history</h1>
        <p className="mt-2 text-sm text-[#A1A1AA]">
          Track your recent orders and complete payment for pending ones. Pending orders: {pendingCount}
        </p>

        <div className="mt-5 max-w-sm">
          <label htmlFor="paymentMethod" className="mb-1 block text-sm font-medium text-white">
            Default payment method
          </label>
          <select
            id="paymentMethod"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full rounded-xl border border-[#2A2A2A] bg-[#0B0B0B] px-3 py-2 text-sm text-white outline-none transition focus:border-[#3A3A3A]"
          >
            {paymentMethods.map((method) => (
              <option value={method.value} key={method.value}>
                {method.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="mt-6 space-y-4">
        {loading ? (
          <div className="surface-card rounded-2xl p-4 text-sm text-[#A1A1AA]">Loading orders...</div>
        ) : orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            description="Place your first order from the cart page and it will appear here."
            ctaLabel="Go to cart"
            ctaTo="/cart"
          />
        ) : (
          orders.map((order) => {
            const canTrack = order.status !== 'cancelled';
            const isTrackingThisOrder = trackingOrderId === order.id;

            return (
              <article
                key={order.id}
                className={`surface-card rounded-2xl p-5 transition ${
                  order.id === highlightOrderId ? 'border-[#3A3A3A]' : 'border-[#2A2A2A]'
                }`}
              >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-white">{order.restaurant_name}</h3>
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="mt-3 grid gap-2 text-sm text-[#A1A1AA] sm:grid-cols-2">
                <p>Total: ₹{Number(order.total_price ?? order.total_amount ?? 0).toFixed(2)}</p>
                <p>Date: {new Date(order.created_at).toLocaleString()}</p>
                <p className="sm:col-span-2">Address: {order.delivery_address}</p>
              </div>

              {canTrack && (
                <button
                  onClick={() => toggleTracking(order.id)}
                  className="mt-3 rounded-lg border border-[#2A2A2A] bg-[#0B0B0B] px-3 py-2 text-sm font-medium text-white hover:border-[#3A3A3A]"
                >
                  {isTrackingThisOrder ? 'Hide tracking' : 'Track on map'}
                </button>
              )}

              {order.status === 'pending' ? (
                <button
                  onClick={() => handlePayment(order.id)}
                  disabled={payingOrderId === order.id}
                  className="mt-4 rounded-lg bg-[#3A3A3A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2F2F2F] disabled:opacity-60"
                >
                  {payingOrderId === order.id ? 'Processing payment...' : 'Pay now'}
                </button>
              ) : null}

              {canTrack && isTrackingThisOrder ? renderTrackingCard(order) : null}
              </article>
            );
          })
        )}
      </section>
    </AppLayout>
  );
};

export default Orders;
