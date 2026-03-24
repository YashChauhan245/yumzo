import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';
import { adminAPI, getApiErrorMessage } from '../../services/api';
import RejectReasonModal from '../../components/ui/RejectReasonModal';
import PaginationControls from '../../components/ui/PaginationControls';

const getStatusOptionsForOrder = (currentStatus) => {
  if (currentStatus === 'pending') return ['pending', 'confirmed', 'cancelled'];
  if (currentStatus === 'confirmed') return ['confirmed', 'cancelled'];
  return [currentStatus];
};
const cancellationReasons = [
  'Customer requested cancellation',
  'Restaurant closed',
  'Item out of stock',
  'Delivery not serviceable',
  'Other',
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingOrderId, setSavingOrderId] = useState('');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState('');
  const [selectedReason, setSelectedReason] = useState(cancellationReasons[0]);
  const [customReason, setCustomReason] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    hasPrevPage: false,
    hasNextPage: false,
  });

  const loadOrders = useCallback(async (requestedPage = page) => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getOrders({ page: requestedPage, limit: 8 });
      setOrders(data?.data?.orders || []);
      setPagination(
        data?.pagination || {
          page: requestedPage,
          totalPages: 1,
          hasPrevPage: requestedPage > 1,
          hasNextPage: false,
        },
      );
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load orders'));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadOrders(page);
  }, [page, loadOrders]);

  const closeCancelModal = () => {
    setIsCancelModalOpen(false);
    setCancelOrderId('');
    setSelectedReason(cancellationReasons[0]);
    setCustomReason('');
  };

  const submitStatusChange = async (orderId, status, reason = '') => {
    setSavingOrderId(orderId);
    try {
      await adminAPI.updateOrderStatus(orderId, status, reason ? { reason } : {});
      setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status } : order)));
      toast.success('Order status updated');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update order status'));
    } finally {
      setSavingOrderId('');
    }
  };

  const handleStatusChange = async (orderId, currentStatus, nextStatus) => {
    if (nextStatus === 'cancelled' && currentStatus !== 'cancelled') {
      setCancelOrderId(orderId);
      setSelectedReason(cancellationReasons[0]);
      setCustomReason('');
      setIsCancelModalOpen(true);
      return;
    }

    await submitStatusChange(orderId, nextStatus);
  };

  const confirmCancellation = async () => {
    if (!cancelOrderId) return;

    const reason = selectedReason === 'Other' ? customReason.trim() : selectedReason;
    await submitStatusChange(cancelOrderId, 'cancelled', reason || 'Cancelled by admin');
    closeCancelModal();
  };

  return (
    <AdminLayout
      title="Orders Overview"
      subtitle="View all orders and monitor their status."
    >
      <section className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-5">
        {loading ? (
          <p className="text-sm text-[#A1A1AA]">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-[#A1A1AA]">No orders available.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const statusOptions = getStatusOptionsForOrder(order.status);
              const canEditStatus = statusOptions.length > 1;

              return (
                <article key={order.id} className="rounded-xl border border-[#2A2A2A] bg-[#0B0B0B] p-4">
                <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                  <div>
                    <p className="font-medium text-white">Order: {order.id}</p>
                    <p className="mt-1 text-sm text-[#A1A1AA]">Restaurant: {order.restaurant_name || 'N/A'}</p>
                    <p className="text-sm text-[#A1A1AA]">Customer: {order.customer_name || 'N/A'}</p>
                    <p className="text-sm text-[#A1A1AA]">Driver: {order.driver_name || 'Not assigned'}</p>
                    <p className="text-sm text-[#A1A1AA]">Total: ₹{Number(order.total_price || 0).toFixed(2)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={order.status}
                      disabled={savingOrderId === order.id || !canEditStatus}
                      onChange={(e) => handleStatusChange(order.id, order.status, e.target.value)}
                      className="rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-sm text-white"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
                </article>
              );
            })}

            <PaginationControls
              page={pagination.page}
              totalPages={pagination.totalPages}
              hasPrevPage={pagination.hasPrevPage}
              hasNextPage={pagination.hasNextPage}
              onPrev={() => setPage((prev) => Math.max(1, prev - 1))}
              onNext={() => setPage((prev) => prev + 1)}
              className="pt-2"
            />
          </div>
        )}

        <RejectReasonModal
          isOpen={isCancelModalOpen}
          title="Cancel order"
          description="This will mark the order as cancelled and add a cancellation note."
          reasons={cancellationReasons}
          selectedReason={selectedReason}
          onReasonChange={setSelectedReason}
          customReason={customReason}
          onCustomReasonChange={setCustomReason}
          customReasonPlaceholder="Add short cancellation reason for order notes"
          maxCustomReasonLength={200}
          isSubmitting={savingOrderId === cancelOrderId}
          disableSubmit={selectedReason === 'Other' && !customReason.trim()}
          submitLabel="Confirm Cancel"
          onCancel={closeCancelModal}
          onSubmit={confirmCancellation}
        />
      </section>
    </AdminLayout>
  );
}
