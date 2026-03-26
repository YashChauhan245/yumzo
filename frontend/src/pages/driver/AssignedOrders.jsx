import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { driverAPI, getApiErrorMessage } from '../../services/api';
import RejectReasonModal from '../../components/ui/RejectReasonModal';

const nextStatusMap = {
  preparing: 'picked_up',
  picked_up: 'out_for_delivery',
  out_for_delivery: 'delivered',
};

const statusLabelMap = {
  preparing: 'Preparing',
  picked_up: 'Picked Up',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
};

const statusClassMap = {
  preparing: 'border-zinc-600/30 bg-zinc-500/15 text-zinc-300',
  picked_up: 'border-blue-600/30 bg-blue-500/15 text-blue-300',
  out_for_delivery: 'border-indigo-600/30 bg-indigo-500/15 text-indigo-300',
  delivered: 'border-emerald-600/30 bg-emerald-500/15 text-emerald-300',
};

const progressByStatus = {
  preparing: 25,
  picked_up: 55,
  out_for_delivery: 82,
  delivered: 100,
};

const getStatusActionLabel = (nextStatus) => {
  if (nextStatus === 'picked_up') return 'Mark Picked Up';
  if (nextStatus === 'out_for_delivery') return 'Mark Out for Delivery';
  if (nextStatus === 'delivered') return 'Mark Delivered';
  return null;
};

const rejectionReasons = [
  'Vehicle issue',
  'High traffic in route',
  'Restaurant delay too long',
  'Personal emergency',
  'Other',
];

const TRACKABLE_STATUSES = ['out_for_delivery'];

const getLocationPayload = (coords) => ({
  latitude: coords.latitude,
  longitude: coords.longitude,
  accuracy: coords.accuracy,
  heading: coords.heading,
  speed: coords.speed,
});

const getGoogleMapsDirectionsUrl = (addressText) => {
  const destination = encodeURIComponent(addressText || 'India');
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
};

const openExternalNavigation = (addressText) => {
  const destination = String(addressText || '').trim();
  const webUrl = getGoogleMapsDirectionsUrl(destination);
  const userAgent = navigator.userAgent || '';

  if (/Android/i.test(userAgent)) {
    const appUrl = `google.navigation:q=${encodeURIComponent(destination || 'India')}&mode=d`;
    window.location.href = appUrl;
    setTimeout(() => window.open(webUrl, '_blank', 'noopener,noreferrer'), 1200);
    return;
  }

  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    const appUrl = `comgooglemaps://?daddr=${encodeURIComponent(destination || 'India')}&directionsmode=driving`;
    window.location.href = appUrl;
    setTimeout(() => window.open(webUrl, '_blank', 'noopener,noreferrer'), 1200);
    return;
  }

  window.open(webUrl, '_blank', 'noopener,noreferrer');
};

export default function AssignedOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState('');
  const [rejectingOrderId, setRejectingOrderId] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectOrderTarget, setRejectOrderTarget] = useState(null);
  const [selectedReason, setSelectedReason] = useState(rejectionReasons[0]);
  const [customReason, setCustomReason] = useState('');
  const [expandedMapOrderId, setExpandedMapOrderId] = useState('');
  const lastLocationSentAtRef = useRef(0);
  const geolocationWatchRef = useRef(null);
  const geolocationErrorShownRef = useRef(false);

  const activeTrackedOrders = useMemo(
    () => orders.filter((order) => TRACKABLE_STATUSES.includes(order.status)),
    [orders],
  );

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

  useEffect(() => {
    if (!activeTrackedOrders.length) return;
    if (!('geolocation' in navigator)) return;

    const pushLocation = async (coords) => {
      const now = Date.now();
      if (now - lastLocationSentAtRef.current < 15000) return;
      lastLocationSentAtRef.current = now;

      const payload = getLocationPayload(coords);

      await Promise.all(
        activeTrackedOrders.map((order) => driverAPI.updateOrderLocation(order.id, payload).catch(() => null)),
      );
    };

    geolocationWatchRef.current = navigator.geolocation.watchPosition(
      (position) => {
        pushLocation(position.coords);
      },
      () => {
        if (!geolocationErrorShownRef.current) {
          geolocationErrorShownRef.current = true;
          toast.error('Enable location permission to share live tracking with customer.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 10000,
      },
    );

    return () => {
      if (geolocationWatchRef.current != null) {
        navigator.geolocation.clearWatch(geolocationWatchRef.current);
        geolocationWatchRef.current = null;
      }
    };
  }, [activeTrackedOrders]);

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

  const openRejectModal = (order) => {
    setRejectOrderTarget(order);
    setSelectedReason(rejectionReasons[0]);
    setCustomReason('');
    setIsRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    setIsRejectModalOpen(false);
    setRejectOrderTarget(null);
    setSelectedReason(rejectionReasons[0]);
    setCustomReason('');
  };

  const rejectAssignedOrder = async () => {
    if (!rejectOrderTarget) return;

    // Build reason text from preset or custom input.
    const reason = selectedReason === 'Other' ? customReason.trim() : selectedReason;
    setRejectingOrderId(rejectOrderTarget.id);
    try {
      await driverAPI.rejectOrder(rejectOrderTarget.id, { reason: reason || '' });
      toast.success('Order rejected. It is now available for other drivers.');
      setOrders((prev) => prev.filter((item) => item.id !== rejectOrderTarget.id));
      closeRejectModal();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not reject this order'));
    } finally {
      setRejectingOrderId('');
    }
  };

  const toggleMapForOrder = (orderId) => {
    setExpandedMapOrderId((prev) => (prev === orderId ? '' : orderId));
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] px-4 py-6 md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">Assigned Orders</h1>
            <p className="text-sm text-[#A1A1AA]">Track and update your delivery lifecycle in real time.</p>
          </div>
          <Link to="/driver/dashboard" className="text-sm text-[#D4D4D8] hover:underline">
            Back to dashboard
          </Link>
        </div>

        <section className="mb-5 rounded-2xl border border-[#2A2A2A] bg-[#151515] p-4 md:p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-[#A1A1AA]">Total Assigned</p>
              <p className="mt-2 text-3xl font-semibold text-white">{orders.length}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-[#A1A1AA]">Out for Delivery</p>
              <p className="mt-2 text-3xl font-semibold text-white">{orders.filter((order) => order.status === 'out_for_delivery').length}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-[#A1A1AA]">Notifications</p>
              <p className="mt-2 text-sm text-[#D4D4D8]">
                {orders.some((order) => order.status !== 'delivered')
                  ? 'You have active routes that need status updates.'
                  : 'All assigned deliveries are up to date.'}
              </p>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-4 text-sm text-[#A1A1AA]">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-4 text-sm text-[#A1A1AA]">No assigned orders yet.</div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const nextStatus = nextStatusMap[order.status];
              const cta = getStatusActionLabel(nextStatus);
              const customerMapQuery = encodeURIComponent(order.delivery_address || 'India');
              const customerMapSrc = `https://www.google.com/maps?q=${customerMapQuery}&z=15&output=embed`;
              const isMapOpen = expandedMapOrderId === order.id;

              return (
                <article key={order.id} className="rounded-2xl border border-[#2A2A2A] bg-[#151515] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-white">Order ID: {order.id}</p>
                    <span className={`inline-flex rounded-lg border px-2.5 py-1 text-xs ${statusClassMap[order.status] || 'border-zinc-600/30 bg-zinc-500/15 text-zinc-300'}`}>
                      {statusLabelMap[order.status] || order.status}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm text-[#C4C4CC] md:grid-cols-2">
                    <p><span className="text-[#8E8E96]">Restaurant:</span> {order.restaurant_name || 'Unknown'}</p>
                    <p><span className="text-[#8E8E96]">Customer:</span> {order.customer_name || 'N/A'}</p>
                    <p><span className="text-[#8E8E96]">ETA:</span> 18 min (est.)</p>
                    <p><span className="text-[#8E8E96]">Route:</span> Zone A to Zone C</p>
                  </div>

                  <p className="mt-2 text-sm text-[#A1A1AA]">Address: {order.delivery_address}</p>

                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => toggleMapForOrder(order.id)}
                      className="rounded-lg border border-[#2A2A2A] bg-[#0B0B0B] px-3 py-1.5 text-xs text-white hover:border-[#3A3A3A]"
                    >
                      {isMapOpen ? 'Hide customer map' : 'View customer location map'}
                    </button>
                  </div>

                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => openExternalNavigation(order.delivery_address)}
                      className="inline-flex rounded-lg border border-[#2A2A2A] bg-[#0B0B0B] px-3 py-1.5 text-xs text-white hover:border-[#3A3A3A]"
                    >
                      Open in Maps App
                    </button>
                  </div>

                  {isMapOpen ? (
                    <div className="mt-3 overflow-hidden rounded-lg border border-[#2A2A2A]">
                      <iframe
                        title={`assigned-order-map-${order.id}`}
                        src={customerMapSrc}
                        className="h-52 w-full"
                        loading="lazy"
                      />
                    </div>
                  ) : null}

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#0B0B0B]">
                    <div
                      className="h-full rounded-full bg-[#3A3A3A]"
                      style={{ width: `${progressByStatus[order.status] ?? 0}%` }}
                    />
                  </div>

                  {cta ? (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => updateStatus(order)}
                        disabled={updatingOrderId === order.id}
                        className="rounded-xl bg-[#3A3A3A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2F2F2F] disabled:opacity-60"
                      >
                        {updatingOrderId === order.id ? 'Updating...' : cta}
                      </button>

                      {order.status === 'preparing' ? (
                        <button
                          onClick={() => openRejectModal(order)}
                          disabled={rejectingOrderId === order.id}
                          className="rounded-xl border border-rose-600/30 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-300 transition-colors hover:bg-rose-500/20 disabled:opacity-60"
                        >
                          {rejectingOrderId === order.id ? 'Rejecting...' : 'Reject Order'}
                        </button>
                      ) : null}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-emerald-400">Completed</p>
                  )}
                </article>
              );
            })}
          </div>
        )}

        <RejectReasonModal
          isOpen={isRejectModalOpen && !!rejectOrderTarget}
          reasons={rejectionReasons}
          selectedReason={selectedReason}
          onReasonChange={setSelectedReason}
          customReason={customReason}
          onCustomReasonChange={setCustomReason}
          maxCustomReasonLength={200}
          isSubmitting={rejectingOrderId === rejectOrderTarget?.id}
          disableSubmit={selectedReason === 'Other' && !customReason.trim()}
          onCancel={closeRejectModal}
          onSubmit={rejectAssignedOrder}
        />
      </div>
    </div>
  );
}
