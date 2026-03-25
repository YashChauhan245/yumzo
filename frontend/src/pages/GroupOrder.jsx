import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import AppLayout from '../components/layout/AppLayout';
import { getApiErrorMessage, groupOrderAPI, restaurantsAPI } from '../services/api';

const GroupOrder = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [activeRoomCode, setActiveRoomCode] = useState(searchParams.get('room') || '');

  const [room, setRoom] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedMenuItemId, setSelectedMenuItemId] = useState('');
  const [quantity, setQuantity] = useState(1);

  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [loadingRoom, setLoadingRoom] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const loadRestaurants = useCallback(async () => {
    try {
      const { data } = await restaurantsAPI.getAll({ page: 1, limit: 50 });
      const list = data?.data?.restaurants || [];
      setRestaurants(list);
      if (!selectedRestaurantId && list.length > 0) {
        setSelectedRestaurantId(list[0].id);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not load restaurants.'));
      setRestaurants([]);
    }
  }, [selectedRestaurantId]);

  const loadMenu = useCallback(async (restaurantId) => {
    if (!restaurantId) return;
    try {
      const { data } = await restaurantsAPI.getMenu(restaurantId);
      const list = data?.data?.menuItems || [];
      setMenuItems(list);
      setSelectedMenuItemId((prev) => prev || list[0]?.id || '');
    } catch {
      setMenuItems([]);
      setSelectedMenuItemId('');
    }
  }, []);

  const loadRoom = useCallback(async (code) => {
    if (!code) return;
    setLoadingRoom(true);
    try {
      const normalized = code.toUpperCase();
      const { data } = await groupOrderAPI.getRoom(normalized);
      const loadedRoom = data?.data?.room;
      setRoom(loadedRoom || null);
      setActiveRoomCode(normalized);
      setSearchParams({ room: normalized });

      if (loadedRoom?.restaurant?.id) {
        await loadMenu(loadedRoom.restaurant.id);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not load room.'));
      setRoom(null);
    } finally {
      setLoadingRoom(false);
    }
  }, [loadMenu, setSearchParams]);

  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  useEffect(() => {
    if (selectedRestaurantId) {
      loadMenu(selectedRestaurantId);
    }
  }, [selectedRestaurantId, loadMenu]);

  useEffect(() => {
    if (activeRoomCode) {
      loadRoom(activeRoomCode);
    }
  }, [activeRoomCode, loadRoom]);

  const handleCreateRoom = async () => {
    if (!selectedRestaurantId) {
      toast.error('Select a restaurant first.');
      return;
    }

    setCreating(true);
    try {
      const { data } = await groupOrderAPI.createRoom({ restaurant_id: selectedRestaurantId });
      const nextRoom = data?.data?.room;
      if (nextRoom?.code) {
        setRoom(nextRoom);
        setActiveRoomCode(nextRoom.code);
        setRoomCodeInput(nextRoom.code);
        setSearchParams({ room: nextRoom.code });
        await loadMenu(nextRoom.restaurant?.id);
        toast.success('Group room created. Share code or link with friends.');
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not create room.'));
    } finally {
      setCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    const code = roomCodeInput.trim().toUpperCase();
    if (!code) {
      toast.error('Enter room code.');
      return;
    }

    setJoining(true);
    try {
      const { data } = await groupOrderAPI.joinRoom(code);
      const joinedRoom = data?.data?.room;
      setRoom(joinedRoom || null);
      setActiveRoomCode(code);
      setSearchParams({ room: code });
      await loadMenu(joinedRoom?.restaurant?.id);
      toast.success('Joined room');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not join room.'));
    } finally {
      setJoining(false);
    }
  };

  const handleAddItem = async () => {
    if (!activeRoomCode || !selectedMenuItemId) {
      toast.error('Select item first.');
      return;
    }

    setAddingItem(true);
    try {
      const { data } = await groupOrderAPI.addItem(activeRoomCode, {
        menu_item_id: selectedMenuItemId,
        quantity: Number(quantity || 1),
      });
      setRoom(data?.data?.room || null);
      toast.success('Item added to group room');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not add item.'));
    } finally {
      setAddingItem(false);
    }
  };

  const handleCheckout = async () => {
    if (!activeRoomCode) return;

    setCheckingOut(true);
    try {
      await groupOrderAPI.checkoutRoom(activeRoomCode);
      window.dispatchEvent(new Event('cart:updated'));
      toast.success('Group room synced to host cart. Complete checkout from cart page.');
      navigate('/cart');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not checkout room.'));
    } finally {
      setCheckingOut(false);
    }
  };

  const handleUpdateRoomItem = async (itemId, nextQty) => {
    if (!activeRoomCode || nextQty < 1) return;
    try {
      const { data } = await groupOrderAPI.updateItem(activeRoomCode, itemId, { quantity: nextQty });
      setRoom(data?.data?.room || null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not update room item.'));
    }
  };

  const handleRemoveRoomItem = async (itemId) => {
    if (!activeRoomCode) return;
    try {
      const { data } = await groupOrderAPI.removeItem(activeRoomCode, itemId);
      setRoom(data?.data?.room || null);
      toast.success('Item removed from room');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not remove room item.'));
    }
  };

  const totalItems = useMemo(() => room?.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0, [room]);

  return (
    <AppLayout>
      <div className="group-order-page">
      <section className="surface-card rounded-2xl p-6 md:p-7">
        <h1 className="group-order-title text-2xl font-semibold tracking-tight text-white md:text-3xl">Group Ordering Room</h1>
        <p className="group-order-muted mt-2 text-sm text-[#A1A1AA]">
          One person creates room, friends join with code/link, everyone adds items, host does one checkout.
        </p>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <article className="group-order-panel rounded-xl border border-[#2A2A2A] bg-[#0B0B0B] p-4">
            <h2 className="group-order-title text-sm font-semibold text-white">Create room</h2>
            <label className="group-order-muted mt-3 block text-xs text-[#A1A1AA]">Restaurant</label>
            <select
              value={selectedRestaurantId}
              onChange={(e) => setSelectedRestaurantId(e.target.value)}
              className="group-order-input mt-1 w-full rounded-xl border border-[#2A2A2A] bg-[#111111] px-3 py-2 text-sm text-white"
            >
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleCreateRoom}
              disabled={creating}
              className="group-order-primary-btn mt-3 rounded-xl bg-[#3A3A3A] px-4 py-2 text-sm font-medium text-white hover:bg-[#2F2F2F] disabled:opacity-60"
            >
              {creating ? 'Creating...' : 'Create room'}
            </button>
          </article>

          <article className="group-order-panel rounded-xl border border-[#2A2A2A] bg-[#0B0B0B] p-4">
            <h2 className="group-order-title text-sm font-semibold text-white">Join room</h2>
            <label className="group-order-muted mt-3 block text-xs text-[#A1A1AA]">Room code</label>
            <input
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
              placeholder="Enter code"
              className="group-order-input mt-1 w-full rounded-xl border border-[#2A2A2A] bg-[#111111] px-3 py-2 text-sm text-white"
            />
            <button
              onClick={handleJoinRoom}
              disabled={joining}
              className="group-order-secondary-btn mt-3 rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-2 text-sm font-medium text-white hover:border-[#3A3A3A] disabled:opacity-60"
            >
              {joining ? 'Joining...' : 'Join room'}
            </button>
          </article>
        </div>
      </section>

      {room ? (
        <section className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <article className="surface-card rounded-2xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="group-order-title text-lg font-semibold text-white">Room {room.code}</h2>
              <span className="group-order-chip rounded-full border border-[#2A2A2A] bg-[#0B0B0B] px-3 py-1 text-xs text-[#A1A1AA]">
                {room.restaurant?.name}
              </span>
            </div>

            <p className="group-order-muted mt-2 text-sm text-[#A1A1AA]">Join link: {room.join_link}</p>

            <div className="group-order-panel mt-4 rounded-xl border border-[#2A2A2A] bg-[#0B0B0B] p-4">
              <h3 className="group-order-title text-sm font-semibold text-white">Add menu item</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_90px_auto]">
                <select
                  value={selectedMenuItemId}
                  onChange={(e) => setSelectedMenuItemId(e.target.value)}
                  className="group-order-input rounded-xl border border-[#2A2A2A] bg-[#111111] px-3 py-2 text-sm text-white"
                >
                  {menuItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} - ₹{item.price}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value || 1))}
                  className="group-order-input rounded-xl border border-[#2A2A2A] bg-[#111111] px-3 py-2 text-sm text-white"
                />
                <button
                  onClick={handleAddItem}
                  disabled={addingItem}
                  className="group-order-primary-btn rounded-xl bg-[#3A3A3A] px-4 py-2 text-sm font-medium text-white hover:bg-[#2F2F2F] disabled:opacity-60"
                >
                  {addingItem ? 'Adding...' : 'Add'}
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {(room.items || []).map((item) => (
                <div key={item.id} className="group-order-item rounded-xl border border-[#2A2A2A] bg-[#0B0B0B] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="group-order-title text-sm font-semibold text-white">{item.name}</p>
                    <p className="group-order-title text-sm text-white">₹{Number(item.price) * Number(item.quantity)}</p>
                  </div>
                  <p className="group-order-muted mt-1 text-xs text-[#A1A1AA]">
                    Qty {item.quantity} • added by {item.added_by_name}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateRoomItem(item.id, Number(item.quantity || 1) - 1)}
                      className="group-order-mini-btn rounded-md border border-[#2A2A2A] px-2 py-1 text-xs text-[#D4D4D8]"
                    >
                      -
                    </button>
                    <button
                      onClick={() => handleUpdateRoomItem(item.id, Number(item.quantity || 1) + 1)}
                      className="group-order-mini-btn rounded-md border border-[#2A2A2A] px-2 py-1 text-xs text-[#D4D4D8]"
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleRemoveRoomItem(item.id)}
                      className="group-order-mini-btn rounded-md border border-[#2A2A2A] px-2 py-1 text-xs text-[#D4D4D8]"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {(room.items || []).length === 0 ? (
                <p className="group-order-muted text-sm text-[#A1A1AA]">No items in room yet.</p>
              ) : null}
            </div>
          </article>

          <aside className="surface-card rounded-2xl p-5">
            <h2 className="group-order-title text-lg font-semibold text-white">Split bill</h2>
            <p className="group-order-muted mt-1 text-sm text-[#A1A1AA]">Auto split by person contribution.</p>

            <div className="group-order-item mt-4 rounded-xl border border-[#2A2A2A] bg-[#0B0B0B] p-4 text-sm text-[#D4D4D8]">
              <p>Total items: {totalItems}</p>
              <p className="mt-1">Total amount: ₹{room.split_bill?.total_amount || 0}</p>
              <p className="mt-1">Equal split: ₹{room.split_bill?.equal_split_per_person || 0} per person</p>
            </div>

            <div className="mt-3 space-y-2">
              {(room.split_bill?.per_person || []).map((person) => (
                <div key={person.user_id} className="group-order-item rounded-lg border border-[#2A2A2A] bg-[#0B0B0B] p-3">
                  <p className="group-order-title text-sm font-semibold text-white">{person.name}</p>
                  <p className="group-order-muted text-xs text-[#A1A1AA]">Items: {person.item_count}</p>
                  <p className="group-order-muted text-xs text-[#A1A1AA]">Contribution: ₹{person.amount}</p>
                </div>
              ))}
            </div>

            {room.is_host ? (
              <button
                onClick={handleCheckout}
                disabled={checkingOut || loadingRoom || !(room.items || []).length}
                className="group-order-primary-btn mt-4 w-full rounded-xl bg-[#3A3A3A] px-4 py-2 text-sm font-medium text-white hover:bg-[#2F2F2F] disabled:opacity-60"
              >
                {checkingOut ? 'Syncing to cart...' : 'One checkout (host)'}
              </button>
            ) : (
              <p className="group-order-muted mt-4 text-xs text-[#A1A1AA]">Only host can perform final checkout.</p>
            )}
          </aside>
        </section>
      ) : (
        <section className="mt-6 surface-card rounded-2xl p-5">
          <p className="group-order-muted text-sm text-[#A1A1AA]">Create or join a room to start collaborative ordering.</p>
        </section>
      )}
      </div>
    </AppLayout>
  );
};

export default GroupOrder;
