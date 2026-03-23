const prisma = require('../config/prisma');

const formatRestaurant = (restaurant) => ({
  id: restaurant.id,
  owner_id: restaurant.ownerId,
  name: restaurant.name,
  description: restaurant.description,
  cuisine_type: restaurant.cuisineType,
  address: restaurant.address,
  city: restaurant.city,
  phone: restaurant.phone,
  image_url: restaurant.imageUrl,
  rating: restaurant.rating,
  is_active: restaurant.isActive,
  created_at: restaurant.createdAt,
  updated_at: restaurant.updatedAt,
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

const listRestaurants = async () => {
  const restaurants = await prisma.$queryRaw`
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
    WHERE owner_id IS NOT NULL
    ORDER BY created_at DESC
  `;

  return restaurants;
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

const listMenuItems = async (restaurantId) => {
  const where = restaurantId ? { restaurantId } : {};

  const items = await prisma.food.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return items.map(formatMenuItem);
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

const listOrders = async () => {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true } },
      driver: { select: { name: true } },
      restaurant: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return orders.map(formatOrder);
};

const updateOrderStatus = async (orderId, status, reason) => {
  const existing = await prisma.order.findUnique({ where: { id: orderId } });
  if (!existing) return null;

  const data = { status };
  if (status === 'cancelled') {
    const trimmedReason = typeof reason === 'string' ? reason.trim() : '';
    const cancellationNote = trimmedReason
      ? `[Admin Cancellation] ${trimmedReason}`
      : '[Admin Cancellation] Cancelled by admin';
    data.notes = existing.notes ? `${existing.notes}\n${cancellationNote}` : cancellationNote;
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data,
    include: {
      user: { select: { name: true } },
      driver: { select: { name: true } },
      restaurant: { select: { name: true } },
    },
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
