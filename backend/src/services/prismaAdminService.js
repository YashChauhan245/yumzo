const prisma = require('../config/prisma');

const orderListInclude = {
  user: { select: { name: true } },
  driver: { select: { name: true } },
  restaurant: { select: { name: true } },
};

const isDriverOnlyStatus = (status) => ['preparing', 'picked_up', 'out_for_delivery', 'delivered'].includes(status);
const canAdminCancel = (status) => ['pending', 'confirmed'].includes(status);

const buildAdminCancellationNote = (existingNotes, reason) => {
  const trimmedReason = typeof reason === 'string' ? reason.trim() : '';
  const cancellationNote = trimmedReason
    ? `[Admin Cancellation] ${trimmedReason}`
    : '[Admin Cancellation] Cancelled by admin';

  return existingNotes ? `${existingNotes}\n${cancellationNote}` : cancellationNote;
};

const formatRestaurant = (restaurant) => ({
  id: restaurant.id,
  owner_id: restaurant.ownerId ?? restaurant.owner_id,
  name: restaurant.name,
  description: restaurant.description,
  cuisine_type: restaurant.cuisineType ?? restaurant.cuisine_type,
  address: restaurant.address,
  city: restaurant.city,
  phone: restaurant.phone,
  image_url: restaurant.imageUrl ?? restaurant.image_url,
  rating: restaurant.rating,
  is_active: restaurant.isActive ?? restaurant.is_active,
  created_at: restaurant.createdAt ?? restaurant.created_at,
  updated_at: restaurant.updatedAt ?? restaurant.updated_at,
});

const formatMenuItem = (item) => ({
  id: item.id,
  restaurant_id: item.restaurantId,
  name: item.name,
  description: item.description,
  price: item.price,
  category: item.category,
  image_url: item.imageUrl,
  is_veg: item.isVeg,
  is_available: item.isAvailable,
  created_at: item.createdAt,
  updated_at: item.updatedAt,
});

const formatOrder = (order) => ({
  id: order.id,
  user_id: order.userId,
  driver_id: order.driverId,
  customer_name: order.user?.name || null,
  driver_name: order.driver?.name || null,
  restaurant_name: order.restaurant?.name || null,
  status: order.status,
  notes: order.notes,
  total_price: order.totalPrice,
  total_amount: order.totalPrice,
  created_at: order.createdAt,
});

const getDashboardStats = async () => {
  const [totalUsers, totalOrders, totalRestaurants, totalMenuItems, activeDeliveries] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.restaurant.count(),
    prisma.food.count(),
    prisma.order.count({ where: { status: { in: ['preparing', 'picked_up', 'out_for_delivery'] } } }),
  ]);

  return {
    total_users: totalUsers,
    total_orders: totalOrders,
    total_restaurants: totalRestaurants,
    total_menu_items: totalMenuItems,
    active_deliveries: activeDeliveries,
  };
};

const listRestaurants = async ({ skip = 0, limit = 10 } = {}) => {
  const safeSkip = Number.isInteger(skip) && skip >= 0 ? skip : 0;
  const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 10;

  // Use raw SQL for listing so legacy rows with NULL owner_id do not crash Prisma field conversion.
  const [restaurants, countResult] = await Promise.all([
    prisma.$queryRaw`
      SELECT
        id,
        owner_id,
        name,
        description,
        cuisine_type,
        address,
        city,
        phone,
        image_url,
        rating,
        is_active,
        created_at,
        updated_at
      FROM restaurants
      ORDER BY created_at DESC
      OFFSET ${safeSkip}
      LIMIT ${safeLimit}
    `,
    prisma.$queryRaw`SELECT COUNT(*)::int AS total FROM restaurants`,
  ]);

  const total = Array.isArray(countResult) && countResult.length > 0
    ? Number(countResult[0].total) || 0
    : 0;

  return {
    rows: restaurants.map(formatRestaurant),
    total,
  };
};

const createRestaurant = async ({ ownerId, name, description, cuisineType, address, city, phone, imageUrl }) => {
  const restaurant = await prisma.restaurant.create({
    data: {
      ownerId,
      name,
      description,
      cuisineType,
      address,
      city,
      phone,
      imageUrl,
    },
  });

  return formatRestaurant(restaurant);
};

const updateRestaurant = async (id, payload) => {
  const existing = await prisma.restaurant.findUnique({ where: { id } });
  if (!existing) return null;

  const restaurant = await prisma.restaurant.update({
    where: { id },
    data: payload,
  });

  return formatRestaurant(restaurant);
};

const deleteRestaurant = async (id) => {
  const existing = await prisma.restaurant.findUnique({ where: { id } });
  if (!existing) return null;

  await prisma.restaurant.delete({ where: { id } });
  return { id };
};

const listMenuItems = async (restaurantId, { skip = 0, limit = 10 } = {}) => {
  const where = restaurantId ? { restaurantId } : {};

  const [items, total] = await Promise.all([
    prisma.food.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.food.count({ where }),
  ]);

  return {
    rows: items.map(formatMenuItem),
    total,
  };
};

const createMenuItem = async ({ restaurantId, name, description, price, category, imageUrl, isVeg, isAvailable }) => {
  const item = await prisma.food.create({
    data: {
      restaurantId,
      name,
      description,
      price,
      category,
      imageUrl,
      isVeg,
      isAvailable,
    },
  });

  return formatMenuItem(item);
};

const updateMenuItem = async (id, payload) => {
  const existing = await prisma.food.findUnique({ where: { id } });
  if (!existing) return null;

  const item = await prisma.food.update({
    where: { id },
    data: payload,
  });

  return formatMenuItem(item);
};

const deleteMenuItem = async (id) => {
  const existing = await prisma.food.findUnique({ where: { id } });
  if (!existing) return null;

  await prisma.food.delete({ where: { id } });
  return { id };
};

const listOrders = async ({ skip = 0, limit = 10 } = {}) => {
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      include: orderListInclude,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count(),
  ]);

  return {
    rows: orders.map(formatOrder),
    total,
  };
};

const updateOrderStatus = async (orderId, status, reason) => {
  const existing = await prisma.order.findUnique({ where: { id: orderId } });
  if (!existing) return null;

  if (isDriverOnlyStatus(status)) {
    const error = new Error('Delivery-stage statuses must be updated by driver');
    error.statusCode = 400;
    throw error;
  }

  if (status === 'confirmed' && existing.status !== 'pending') {
    const error = new Error('Only pending orders can be confirmed by admin');
    error.statusCode = 400;
    throw error;
  }

  if (status === 'pending' && existing.status !== 'pending') {
    const error = new Error('Cannot move order back to pending from current status');
    error.statusCode = 400;
    throw error;
  }

  if (status === 'cancelled' && !canAdminCancel(existing.status)) {
    const error = new Error('Only pending or confirmed orders can be cancelled by admin');
    error.statusCode = 400;
    throw error;
  }

  const data = { status };
  if (status === 'cancelled') {
    data.notes = buildAdminCancellationNote(existing.notes, reason);
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data,
    include: orderListInclude,
  });

  return formatOrder(updated);
};

module.exports = {
  getDashboardStats,
  listRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  listMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  listOrders,
  updateOrderStatus,
};
