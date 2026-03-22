const prisma = require('../config/prisma');

const formatOrderItem = (item) => ({
  id: item.id,
  menu_item_id: item.foodId,
  name: item.name,
  price: item.price,
  quantity: item.quantity,
  created_at: item.createdAt,
});

const formatOrder = (order) => ({
  id: order.id,
  user_id: order.userId,
  driver_id: null,
  restaurant_id: order.restaurantId,
  restaurant_name: order.restaurant?.name || null,
  customer_name: order.user?.name || null,
  status: order.status,
  total_amount: order.totalAmount,
  delivery_address: order.deliveryAddress,
  notes: order.notes,
  created_at: order.createdAt,
  items: Array.isArray(order.items) ? order.items.map(formatOrderItem) : undefined,
});

const createOrder = async ({ userId, restaurantId, deliveryAddress, notes = null, items }) => {
  const totalAmount = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        userId,
        restaurantId,
        deliveryAddress,
        notes,
        totalAmount,
      },
    });

    const createdItems = await Promise.all(
      items.map((item) =>
        tx.orderItem.create({
          data: {
            orderId: createdOrder.id,
            foodId: item.menuItemId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          },
        }),
      ),
    );

    return { ...createdOrder, items: createdItems };
  });

  return formatOrder(order);
};

const findByUser = async (userId) => {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      restaurant: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return orders.map((order) => formatOrder(order));
};

const findById = async (orderId, userId) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      restaurant: {
        select: { name: true },
      },
      user: {
        select: { id: true, name: true },
      },
      items: {
        orderBy: { id: 'asc' },
      },
    },
  });

  return order
    ? {
        ...formatOrder(order),
        customer_name: order.user?.name || null,
      }
    : null;
};

const updateStatus = async (orderId, status) => {
  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  return formatOrder(updated);
};

const findAvailableForDriver = async () => {
  const orders = await prisma.order.findMany({
    where: {
      status: 'confirmed',
    },
    include: {
      restaurant: {
        select: { name: true },
      },
      user: {
        select: { id: true, name: true },
      },
      items: {
        orderBy: { id: 'asc' },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return orders.map((order) => ({
    ...formatOrder(order),
    customer_name: order.user?.name || null,
  }));
};

const acceptOrder = async ({ orderId, driverId }) => {
  void driverId;

  const result = await prisma.order.updateMany({
    where: {
      id: orderId,
      status: 'confirmed',
    },
    data: {
      status: 'preparing',
    },
  });

  if (result.count === 0) return null;

  const updated = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      restaurant: {
        select: { name: true },
      },
      user: {
        select: { id: true, name: true },
      },
      items: {
        orderBy: { id: 'asc' },
      },
    },
  });

  return updated
    ? {
        ...formatOrder(updated),
        customer_name: updated.user?.name || null,
      }
    : null;
};

const findAssignedToDriver = async (driverId) => {
  void driverId;

  const orders = await prisma.order.findMany({
    where: {
      status: {
        in: ['preparing', 'out_for_delivery', 'delivered'],
      },
    },
    include: {
      restaurant: {
        select: { name: true },
      },
      user: {
        select: { id: true, name: true },
      },
      items: {
        orderBy: { id: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return orders.map((order) => ({
    ...formatOrder(order),
    customer_name: order.user?.name || null,
  }));
};

const updateDriverOrderStatus = async ({ orderId, driverId, status }) => {
  void driverId;

  const result = await prisma.order.updateMany({
    where: {
      id: orderId,
      status: {
        not: 'pending',
      },
    },
    data: {
      status,
    },
  });

  if (result.count === 0) return null;

  const updated = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      restaurant: {
        select: { name: true },
      },
      user: {
        select: { id: true, name: true },
      },
      items: {
        orderBy: { id: 'asc' },
      },
    },
  });

  return updated
    ? {
        ...formatOrder(updated),
        customer_name: updated.user?.name || null,
      }
    : null;
};

module.exports = {
  createOrder,
  findByUser,
  findById,
  updateStatus,
  findAvailableForDriver,
  acceptOrder,
  findAssignedToDriver,
  updateDriverOrderStatus,
};
