import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AppLayout from '../components/layout/AppLayout';
import EmptyState from '../components/ui/EmptyState';
import { CartSkeleton } from '../components/ui/Skeletons';
import { cartAPI, getApiErrorMessage, ordersAPI, paymentsAPI } from '../services/api';

const Cart = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

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
  }, []);

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
    if (!deliveryAddress.trim()) {
      toast.error('Please add delivery address before placing order.');
      return;
    }

    setPlacingOrder(true);
    try {
      const { data } = await ordersAPI.placeOrder({
        delivery_address: deliveryAddress.trim(),
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
              ctaTo="/"
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
            <textarea
              id="deliveryAddress"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              rows={4}
              placeholder="Flat, street, area, city"
              className="w-full rounded-xl border border-[#2A2A2A] bg-[#0B0B0B] px-3 py-2 text-sm text-white outline-none transition focus:border-[#3A3A3A]"
            />
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
