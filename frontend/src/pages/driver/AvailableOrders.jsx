import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { driverAPI, getApiErrorMessage } from '../../services/api';

export default function AvailableOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingOrderId, setAcceptingOrderId] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data } = await driverAPI.getAvailableOrders();
      setOrders(data?.data?.orders || []);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load available orders'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
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
            <p className="text-sm text-[#A1A1AA]">Confirmed orders waiting for drivers.</p>
          </div>
          <Link to="/driver/dashboard" className="text-sm text-[#D4D4D8] hover:underline">
            Back to dashboard
          </Link>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-4 text-sm text-[#A1A1AA]">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-4 text-sm text-[#A1A1AA]">No available orders right now.</div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <article key={order.id} className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-4">
                <p className="text-sm text-white">Order ID: {order.id}</p>
                <p className="mt-1 text-sm text-[#A1A1AA]">Restaurant: {order.restaurant_name || 'Unknown'}</p>
                <p className="mt-1 text-sm text-[#A1A1AA]">Customer: {order.customer_name || 'N/A'}</p>
                <p className="mt-1 text-sm text-[#A1A1AA]">Total: ₹{Number(order.total_amount || 0).toFixed(2)}</p>
                <p className="mt-1 text-sm text-[#A1A1AA]">Address: {order.delivery_address}</p>

                <button
                  onClick={() => acceptOrder(order.id)}
                  disabled={acceptingOrderId === order.id}
                  className="mt-3 rounded-xl bg-[#3A3A3A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2F2F2F] disabled:opacity-60"
                >
                  {acceptingOrderId === order.id ? 'Accepting...' : 'Accept Order'}
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
