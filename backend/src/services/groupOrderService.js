const prismaCartService = require('./prismaCartService');
const prismaRestaurantService = require('./prismaRestaurantService');

// Simple in-memory store for group rooms.
// This is easy to explain in interviews and works well for demo projects.
const roomStore = new Map();
const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const makeCode = (length = 6) => {
  let code = '';
  for (let i = 0; i < length; i += 1) {
    const randomIndex = Math.floor(Math.random() * ROOM_CODE_CHARS.length);
    code += ROOM_CODE_CHARS[randomIndex];
  }
  return code;
};

const generateUniqueCode = () => {
  for (let i = 0; i < 20; i += 1) {
    const nextCode = makeCode();
    if (!roomStore.has(nextCode)) {
      return nextCode;
    }
  }

  return `${makeCode(4)}${Date.now().toString().slice(-2)}`;
};

const toNumber = (value) => Number.parseFloat(value || 0) || 0;

const resolveJoinBaseUrl = () => {
  const origins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  const localhostOrigin = origins.find((origin) => origin.includes('localhost'));
  return localhostOrigin || origins[0] || 'http://localhost:5173';
};

const ensureParticipant = (room, user) => {
  const alreadyInRoom = room.participants.find((person) => person.user_id === user.id);
  if (alreadyInRoom) return;

  room.participants.push({
    user_id: user.id,
    name: user.name || user.email || 'Member',
    joined_at: new Date().toISOString(),
  });
};

const computeSummary = ({ participants, items }) => {
  const amountByUser = {};
  let totalAmount = 0;

  // Calculate each person's contribution and total room amount.
  for (const item of items) {
    const lineAmount = toNumber(item.price) * Number(item.quantity || 0);
    totalAmount += lineAmount;

    if (!amountByUser[item.added_by_user_id]) {
      amountByUser[item.added_by_user_id] = {
        amount: 0,
        item_count: 0,
      };
    }

    amountByUser[item.added_by_user_id].amount += lineAmount;
    amountByUser[item.added_by_user_id].item_count += Number(item.quantity || 0);
  }

  const perPerson = participants.map((person) => ({
    user_id: person.user_id,
    name: person.name,
    amount: Number((amountByUser[person.user_id]?.amount || 0).toFixed(2)),
    item_count: amountByUser[person.user_id]?.item_count || 0,
  }));

  const equalSplit = participants.length > 0
    ? Number((totalAmount / participants.length).toFixed(2))
    : 0;

  return {
    total_amount: Number(totalAmount.toFixed(2)),
    participants_count: participants.length,
    equal_split_per_person: equalSplit,
    per_person: perPerson,
  };
};

const buildRoomResponse = (room, currentUserId) => ({
  code: room.code,
  host_user_id: room.host_user_id,
  is_host: room.host_user_id === currentUserId,
  restaurant: room.restaurant,
  join_link: room.join_link,
  created_at: room.created_at,
  participants: room.participants,
  items: room.items,
  split_bill: computeSummary({ participants: room.participants, items: room.items }),
});

const createRoom = async ({ hostUser, restaurantId }) => {
  const restaurant = await prismaRestaurantService.findRestaurantById(restaurantId);
  if (!restaurant) {
    throw new Error('Restaurant not found');
  }

  const code = generateUniqueCode();
  const room = {
    code,
    host_user_id: hostUser.id,
    restaurant: {
      id: restaurant.id,
      name: restaurant.name,
      image_url: restaurant.image_url || null,
    },
    join_link: `${resolveJoinBaseUrl()}/group-order?room=${code}`,
    created_at: new Date().toISOString(),
    participants: [],
    items: [],
    status: 'OPEN',
  };

  ensureParticipant(room, hostUser);
  roomStore.set(code, room);

  return buildRoomResponse(room, hostUser.id);
};

const getRoom = async (code, user) => {
  const normalizedCode = String(code || '').toUpperCase();
  const room = roomStore.get(normalizedCode);
  if (!room) return null;

  ensureParticipant(room, user);
  return buildRoomResponse(room, user.id);
};

const joinRoom = async (code, user) => {
  const normalizedCode = String(code || '').toUpperCase();
  const room = roomStore.get(normalizedCode);
  if (!room) return null;

  ensureParticipant(room, user);
  return buildRoomResponse(room, user.id);
};

const addItem = async ({ code, user, menuItemId, quantity }) => {
  const normalizedCode = String(code || '').toUpperCase();
  const room = roomStore.get(normalizedCode);
  if (!room) return { error: 'Room not found', room: null };
  if (room.status !== 'OPEN') return { error: 'Room is not open', room: null };

  const menuItem = await prismaCartService.findMenuItemById(menuItemId);
  if (!menuItem) return { error: 'Menu item not found', room: null };
  if (!menuItem.is_available) return { error: 'Menu item unavailable', room: null };
  if (menuItem.restaurant_id !== room.restaurant.id) {
    return { error: 'Only same-restaurant items are allowed in this room', room: null };
  }

  ensureParticipant(room, user);

  room.items.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    menu_item_id: menuItem.id,
    name: menuItem.name,
    price: toNumber(menuItem.price),
    quantity: Number(quantity || 1),
    is_veg: Boolean(menuItem.is_veg),
    added_by_user_id: user.id,
    added_by_name: user.name || user.email || 'Member',
    created_at: new Date().toISOString(),
  });

  return { error: null, room: buildRoomResponse(room, user.id) };
};

const updateItem = async ({ code, itemId, user, quantity }) => {
  const normalizedCode = String(code || '').toUpperCase();
  const room = roomStore.get(normalizedCode);
  if (!room) return { error: 'Room not found', room: null };
  if (room.status !== 'OPEN') return { error: 'Room is not open', room: null };

  const roomItem = room.items.find((item) => item.id === itemId);
  if (!roomItem) return { error: 'Room item not found', room: null };

  const canEdit = roomItem.added_by_user_id === user.id || room.host_user_id === user.id;
  if (!canEdit) return { error: 'Not allowed to edit this item', room: null };

  roomItem.quantity = Number(quantity || 1);
  return { error: null, room: buildRoomResponse(room, user.id) };
};

const removeItem = async ({ code, itemId, user }) => {
  const normalizedCode = String(code || '').toUpperCase();
  const room = roomStore.get(normalizedCode);
  if (!room) return { error: 'Room not found', room: null };
  if (room.status !== 'OPEN') return { error: 'Room is not open', room: null };

  const roomItem = room.items.find((item) => item.id === itemId);
  if (!roomItem) return { error: 'Room item not found', room: null };

  const canDelete = roomItem.added_by_user_id === user.id || room.host_user_id === user.id;
  if (!canDelete) return { error: 'Not allowed to remove this item', room: null };

  room.items = room.items.filter((item) => item.id !== itemId);
  return { error: null, room: buildRoomResponse(room, user.id) };
};

const checkoutToHostCart = async ({ code, user }) => {
  const normalizedCode = String(code || '').toUpperCase();
  const room = roomStore.get(normalizedCode);
  if (!room) return { error: 'Room not found', room: null };
  if (room.host_user_id !== user.id) return { error: 'Only host can checkout', room: null };

  await prismaCartService.clearCart(user.id);

  // Merge same menu item quantities before writing to host cart.
  const quantityByMenu = {};
  for (const item of room.items) {
    if (!quantityByMenu[item.menu_item_id]) {
      quantityByMenu[item.menu_item_id] = 0;
    }
    quantityByMenu[item.menu_item_id] += Number(item.quantity || 0);
  }

  const menuIds = Object.keys(quantityByMenu);
  for (const menuItemId of menuIds) {
    await prismaCartService.upsertItem({
      userId: user.id,
      menuItemId,
      restaurantId: room.restaurant.id,
      quantity: quantityByMenu[menuItemId],
    });
  }

  room.status = 'CHECKED_OUT';

  return {
    error: null,
    room: buildRoomResponse(room, user.id),
    synced_items: room.items.length,
  };
};

module.exports = {
  computeSummary,
  createRoom,
  getRoom,
  joinRoom,
  addItem,
  updateItem,
  removeItem,
  checkoutToHostCart,
};
