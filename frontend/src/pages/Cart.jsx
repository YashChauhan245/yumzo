import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AppLayout from '../components/layout/AppLayout';
import EmptyState from '../components/ui/EmptyState';
import { CartSkeleton } from '../components/ui/Skeletons';
import { addressesAPI, cartAPI, getApiErrorMessage, ordersAPI, paymentsAPI } from '../services/api';

const toFixedCoord = (value) => Number(value).toFixed(6);

const Cart = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [addressForm, setAddressForm] = useState({
    label: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    is_default: false,
  });
  const [addingAddress, setAddingAddress] = useState(false);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [capturingGps, setCapturingGps] = useState(false);

  const mapQuery = encodeURIComponent(deliveryAddress || 'India');
  const mapSrc = `https://www.google.com/maps?q=${mapQuery}&z=15&output=embed`;

  const loadCart = async () => {
    setLoading(true);
    try {
      const { data } = await cartAPI.getCart();
      setItems(data?.data?.items || []);
      setTotalAmount(data?.data?.totalAmount || 0);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load cart.'));
      setItems([]);
      setTotalAmount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const { data } = await addressesAPI.getAll();
      const addresses = data?.data?.addresses || [];
      setSavedAddresses(addresses);

      const defaultAddress = addresses.find((address) => address.is_default) || addresses[0];
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
        setDeliveryAddress(
          [defaultAddress.line1, defaultAddress.line2, defaultAddress.city, defaultAddress.state, defaultAddress.postal_code]
            .filter(Boolean)
            .join(', '),
        );
      }
    } catch {
      setSavedAddresses([]);
    }
  };

  const handleAddressFormChange = (field, value) => {
    setAddressForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddAddress = async () => {
    if (!addressForm.line1.trim() || !addressForm.city.trim()) {
      toast.error('Line 1 and city are required for address.');
      return;
    }

    setAddingAddress(true);
    try {
      const payload = {
        ...addressForm,
        label: addressForm.label.trim() || undefined,
        line1: addressForm.line1.trim(),
        line2: addressForm.line2.trim() || undefined,
        city: addressForm.city.trim(),
        state: addressForm.state.trim() || undefined,
        postal_code: addressForm.postal_code.trim() || undefined,
      };
      const { data } = await addressesAPI.add(payload);
      const created = data?.data?.address;

      if (created) {
        toast.success('Address added');
        await loadAddresses();
        setSelectedAddressId(created.id);
      }

      setAddressForm({
        label: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        postal_code: '',
        is_default: false,
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not add address.'));
    } finally {
      setAddingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await addressesAPI.remove(addressId);
      toast.success('Address deleted');

      if (selectedAddressId === addressId) {
        setSelectedAddressId('');
        setDeliveryAddress('');
      }

      await loadAddresses();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not delete address.'));
    }
  };

  const handleMakeDefault = async (addressId) => {
    try {
      await addressesAPI.update(addressId, { is_default: true });
      toast.success('Default address updated');
      await loadAddresses();
      setSelectedAddressId(addressId);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not update default address.'));
    }
  };

  const groupedRestaurant = useMemo(() => {
    if (items.length === 0) return null;
    return items[0]?.restaurant_name;
  }, [items]);

  const handleUpdateQuantity = async (item, qty) => {
    if (qty < 1) return;
    try {
      await cartAPI.updateItem(item.id, { quantity: qty });
      await loadCart();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to update quantity.'));
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await cartAPI.removeItem(itemId);
      toast.success('Item removed from cart');
      await loadCart();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to remove item.'));
    }
  };

  const handleClearCart = async () => {
    try {
      await cartAPI.clearCart();
      toast.success('Cart cleared');
      await loadCart();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to clear cart.'));
    }
  };

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim() && !selectedAddressId) {
      toast.error('Please add delivery address before placing order.');
      return;
    }

    setPlacingOrder(true);
    try {
      const { data } = await ordersAPI.placeOrder({
        delivery_address: selectedAddressId ? undefined : deliveryAddress.trim(),
        address_id: selectedAddressId || undefined,
      });
      const orderId = data?.data?.order?.id;

      // Auto-confirm with COD so drivers receive this order in their available queue immediately.
      if (orderId) {
        await paymentsAPI.payOrder(orderId, {
          payment_method: 'cash_on_delivery',
          payment_details: 'Auto COD at checkout',
        });
      }

      toast.success('Order placed and sent to nearby drivers');

      if (orderId) {
        navigate(`/orders?orderId=${orderId}`);
      } else {
        navigate('/orders');
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not place order.'));
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported in this browser.');
      return;
    }

    setCapturingGps(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const gpsAddress = `GPS: ${toFixedCoord(latitude)}, ${toFixedCoord(longitude)}`;

        // GPS location is treated as manual address text for order placement.
        setSelectedAddressId('');
        setDeliveryAddress(gpsAddress);
        setCapturingGps(false);
        toast.success('Current location added.');
      },
      () => {
        toast.error('Could not fetch your current location.');
        setCapturingGps(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 10000,
      },
    );
  };

  return (
    <AppLayout>
      <section className="surface-card rounded-2xl p-6 md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Your cart</h1>
          {items.length > 0 ? (
            <button
              onClick={handleClearCart}
              className="rounded-xl border border-[#2A2A2A] bg-[#0B0B0B] px-3 py-2 text-sm font-medium text-[#A1A1AA] transition-colors hover:border-[#3A3A3A] hover:text-[#D4D4D8]"
            >
              Clear cart
            </button>
          ) : null}
        </div>
        {groupedRestaurant ? (
          <p className="mt-2 text-sm text-[#A1A1AA]">Ordering from {groupedRestaurant}</p>
        ) : null}
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => <CartSkeleton key={idx} />)
          ) : items.length === 0 ? (
            <EmptyState
              title="Your cart is empty"
              description="Add items from restaurant menus to start your order."
              ctaLabel="Browse restaurants"
              ctaTo="/home"
            />
          ) : (
            items.map((item) => (
              <article key={item.id} className="surface-card rounded-2xl p-4 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-white">{item.item_name}</h3>
                      {item.is_veg ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-600" />
                          Veg
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-1 text-[11px] font-semibold text-rose-700">
                          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-rose-600" />
                          Non-Veg
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-[#A1A1AA]">₹{item.price} each</p>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="rounded-lg border border-[#2A2A2A] px-2 py-1 text-sm text-[#A1A1AA] transition-colors hover:border-[#3A3A3A] hover:text-[#D4D4D8]"
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                      className="rounded-lg border border-[#2A2A2A] bg-[#0B0B0B] px-3 py-1.5 text-sm font-semibold text-white hover:border-[#3A3A3A]"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-white">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                      className="rounded-lg border border-[#2A2A2A] bg-[#0B0B0B] px-3 py-1.5 text-sm font-semibold text-white hover:border-[#3A3A3A]"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-white">₹{(Number(item.price) * Number(item.quantity)).toFixed(2)}</p>
                </div>
              </article>
            ))
          )}
        </div>

        <aside className="surface-card h-fit rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-white">Checkout</h2>
          <p className="mt-1 text-sm text-[#A1A1AA]">Confirm details and place your order.</p>

          <div className="mt-5">
            <label htmlFor="deliveryAddress" className="mb-1 block text-sm font-medium text-white">
              Delivery address
            </label>

            {savedAddresses.length > 0 ? (
              <div className="mb-3 space-y-2">
                <select
                  value={selectedAddressId}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    setSelectedAddressId(nextId);
                    const selected = savedAddresses.find((address) => address.id === nextId);
                    if (selected) {
                      setDeliveryAddress(
                        [selected.line1, selected.line2, selected.city, selected.state, selected.postal_code]
                          .filter(Boolean)
                          .join(', '),
                      );
                    }
                  }}
                  className="w-full rounded-xl border border-[#2A2A2A] bg-[#0B0B0B] px-3 py-2 text-sm text-white outline-none transition focus:border-[#3A3A3A]"
                >
                  <option value="">Use manual address</option>
                  {savedAddresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {(address.label || 'Saved address')} - {address.line1}, {address.city}
                    </option>
                  ))}
                </select>

                <div className="space-y-2">
                  {savedAddresses.map((address) => (
                    <div key={`saved-${address.id}`} className="flex items-center justify-between rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-xs">
                      <span className="text-[#D4D4D8]">
                        {(address.label || 'Saved')} - {address.line1}, {address.city}
                        {address.is_default ? ' (Default)' : ''}
                      </span>
                      <div className="flex items-center gap-2">
                        {!address.is_default ? (
                          <button
                            type="button"
                            onClick={() => handleMakeDefault(address.id)}
                            className="rounded-md border border-[#2A2A2A] px-2 py-1 text-[#A1A1AA] hover:text-white"
                          >
                            Make default
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(address.id)}
                          className="rounded-md border border-[#2A2A2A] px-2 py-1 text-[#A1A1AA] hover:text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <textarea
              id="deliveryAddress"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              rows={4}
              placeholder="Flat, street, area, city"
              disabled={Boolean(selectedAddressId)}
              className="w-full rounded-xl border border-[#2A2A2A] bg-[#0B0B0B] px-3 py-2 text-sm text-white outline-none transition focus:border-[#3A3A3A]"
            />

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={capturingGps}
                className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-1.5 text-xs text-white hover:border-[#3A3A3A] disabled:opacity-60"
              >
                {capturingGps ? 'Getting GPS location...' : 'Use current GPS location'}
              </button>
              <span className="text-xs text-[#A1A1AA]">Manual address input also supported.</span>
            </div>

            {deliveryAddress ? (
              <div className="mt-3 overflow-hidden rounded-lg border border-[#2A2A2A]">
                <iframe
                  title="checkout-address-map"
                  src={mapSrc}
                  className="h-48 w-full"
                  loading="lazy"
                />
              </div>
            ) : null}

            <div className="mt-3 rounded-xl border border-[#2A2A2A] bg-[#0B0B0B] p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#A1A1AA]">Add new address</p>
              <div className="grid gap-2 md:grid-cols-2">
                <input
                  value={addressForm.label}
                  onChange={(e) => handleAddressFormChange('label', e.target.value)}
                  placeholder="Label (Home/Work)"
                  className="rounded-lg border border-[#2A2A2A] bg-[#0B0B0B] px-3 py-2 text-sm text-white"
                />
                <input
                  value={addressForm.line1}
                  onChange={(e) => handleAddressFormChange('line1', e.target.value)}
                  placeholder="Line 1"
                  className="rounded-lg border border-[#2A2A2A] bg-[#0B0B0B] px-3 py-2 text-sm text-white"
                />
                <input
                  value={addressForm.line2}
                  onChange={(e) => handleAddressFormChange('line2', e.target.value)}
                  placeholder="Line 2 (optional)"
                  className="rounded-lg border border-[#2A2A2A] bg-[#0B0B0B] px-3 py-2 text-sm text-white"
                />
                <input
                  value={addressForm.city}
                  onChange={(e) => handleAddressFormChange('city', e.target.value)}
                  placeholder="City"
                  className="rounded-lg border border-[#2A2A2A] bg-[#0B0B0B] px-3 py-2 text-sm text-white"
                />
                <input
                  value={addressForm.state}
                  onChange={(e) => handleAddressFormChange('state', e.target.value)}
                  placeholder="State"
                  className="rounded-lg border border-[#2A2A2A] bg-[#0B0B0B] px-3 py-2 text-sm text-white"
                />
                <input
                  value={addressForm.postal_code}
                  onChange={(e) => handleAddressFormChange('postal_code', e.target.value)}
                  placeholder="Postal code"
                  className="rounded-lg border border-[#2A2A2A] bg-[#0B0B0B] px-3 py-2 text-sm text-white"
                />
              </div>

              <label className="mt-2 flex items-center gap-2 text-xs text-[#A1A1AA]">
                <input
                  type="checkbox"
                  checked={addressForm.is_default}
                  onChange={(e) => handleAddressFormChange('is_default', e.target.checked)}
                />
                Set as default address
              </label>

              <button
                type="button"
                onClick={handleAddAddress}
                disabled={addingAddress}
                className="mt-3 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-sm text-white disabled:opacity-60"
              >
                {addingAddress ? 'Adding...' : 'Save address'}
              </button>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-[#2A2A2A] bg-[#0B0B0B] p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#A1A1AA]">Subtotal</span>
              <span className="font-semibold text-white">₹{Number(totalAmount).toFixed(2)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-[#A1A1AA]">Delivery</span>
              <span className="font-semibold text-white">₹0.00</span>
            </div>
            <div className="mt-3 border-t border-[#2A2A2A] pt-3 text-base font-semibold text-white">
              Total: ₹{Number(totalAmount).toFixed(2)}
            </div>
          </div>

          <button
            disabled={items.length === 0 || placingOrder}
            onClick={handlePlaceOrder}
            className="mt-5 w-full rounded-xl bg-[#3A3A3A] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2F2F2F] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {placingOrder ? 'Placing order...' : 'Place order'}
          </button>

          <Link to="/orders" className="mt-3 inline-block text-sm font-medium text-[#A1A1AA] hover:text-[#D4D4D8]">
            View order history
          </Link>
        </aside>
      </section>
    </AppLayout>
  );
};

export default Cart;
