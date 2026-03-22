import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { driverAPI, getApiErrorMessage } from '../../services/api';

const nextStatusMap = {
  picked_up: 'out_for_delivery',
  out_for_delivery: 'delivered',
};

const statusLabelMap = {
  picked_up: 'Picked Up',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
};

export default function AssignedOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data } = await driverAPI.getAssignedOrders();
      setOrders(data?.data?.orders || []);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load assigned orders'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (order) => {
    const nextStatus = nextStatusMap[order.status];
    if (!nextStatus) return;

    setUpdatingOrderId(order.id);
    try {
      await driverAPI.updateOrderStatus(order.id, nextStatus);
      toast.success(`Order marked as ${statusLabelMap[nextStatus]}`);
      setOrders((prev) => prev.map((item) => (item.id === order.id ? { ...item, status: nextStatus } : item)));
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not update status'));
    } finally {
      setUpdatingOrderId('');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] px-4 py-6 md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">Assigned Orders</h1>
            <p className="text-sm text-[#A1A1AA]">Update delivery progress for accepted orders.</p>
          </div>
          <Link to="/driver/dashboard" className="text-sm text-[#D4D4D8] hover:underline">
            Back to dashboard
          </Link>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-4 text-sm text-[#A1A1AA]">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-4 text-sm text-[#A1A1AA]">No assigned orders yet.</div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const nextStatus = nextStatusMap[order.status];
              const cta =
                nextStatus === 'out_for_delivery'
                  ? 'Mark Out for Delivery'
                  : nextStatus === 'delivered'
                    ? 'Mark Delivered'
                    : null;

              return (
                <article key={order.id} className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-4">
                  <p className="text-sm text-white">Order ID: {order.id}</p>
                  <p className="mt-1 text-sm text-[#A1A1AA]">Restaurant: {order.restaurant_name || 'Unknown'}</p>
                  <p className="mt-1 text-sm text-[#A1A1AA]">Customer: {order.customer_name || 'N/A'}</p>
                  <p className="mt-1 text-sm text-[#A1A1AA]">Status: {statusLabelMap[order.status] || order.status}</p>
                  <p className="mt-1 text-sm text-[#A1A1AA]">Address: {order.delivery_address}</p>

                  {cta ? (
                    <button
                      onClick={() => updateStatus(order)}
                      disabled={updatingOrderId === order.id}
                      className="mt-3 rounded-xl bg-[#3A3A3A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2F2F2F] disabled:opacity-60"
                    >
                      {updatingOrderId === order.id ? 'Updating...' : cta}
                    </button>
                  ) : (
                    <p className="mt-3 text-sm text-emerald-400">Completed</p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
