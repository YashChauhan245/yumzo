import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AppLayout from '../components/layout/AppLayout';
import EmptyState from '../components/ui/EmptyState';
import { CartSkeleton } from '../components/ui/Skeletons';
import { cartAPI, getApiErrorMessage, ordersAPI } from '../services/api';

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
      toast.success('Order placed successfully');
      const orderId = data?.data?.order?.id;
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
      <section className="surface-card rounded-3xl p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-4xl">Your cart</h1>
          {items.length > 0 ? (
            <button
              onClick={handleClearCart}
              className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
            >
              Clear cart
            </button>
          ) : null}
        </div>
        {groupedRestaurant ? (
          <p className="mt-2 text-sm text-slate-500">Ordering from {groupedRestaurant}</p>
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
              <article key={item.id} className="surface-card rounded-2xl p-4 transition hover:shadow-lg">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-900">{item.item_name}</h3>
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
                    <p className="mt-1 text-sm text-slate-500">₹{item.price} each</p>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="rounded-lg px-2 py-1 text-sm text-rose-600 transition hover:bg-rose-50"
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                      className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                      className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">₹{(Number(item.price) * Number(item.quantity)).toFixed(2)}</p>
                </div>
              </article>
            ))
          )}
        </div>

        <aside className="surface-card h-fit rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-slate-900">Checkout</h2>
          <p className="mt-1 text-sm text-slate-500">Confirm details and place your order.</p>

          <div className="mt-5">
            <label htmlFor="deliveryAddress" className="mb-1 block text-sm font-medium text-slate-700">
              Delivery address
            </label>
            <textarea
              id="deliveryAddress"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              rows={4}
              placeholder="Flat, street, area, city"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-orange-400 focus:ring-2"
            />
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-semibold text-slate-900">₹{Number(totalAmount).toFixed(2)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-slate-500">Delivery</span>
              <span className="font-semibold text-slate-900">₹0.00</span>
            </div>
            <div className="mt-3 border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
              Total: ₹{Number(totalAmount).toFixed(2)}
            </div>
          </div>

          <button
            disabled={items.length === 0 || placingOrder}
            onClick={handlePlaceOrder}
            className="mt-5 w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {placingOrder ? 'Placing order...' : 'Place order'}
          </button>

          <Link to="/orders" className="mt-3 inline-block text-sm font-medium text-slate-600 hover:text-slate-900">
            View order history
          </Link>
        </aside>
      </section>
    </AppLayout>
  );
};

export default Cart;
