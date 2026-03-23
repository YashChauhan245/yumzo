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
  driver_id: order.driverId || null,
  driver_name: order.driver?.name || null,
  restaurant_id: order.restaurantId,
  restaurant_name: order.restaurant?.name || null,
  customer_name: order.user?.name || null,
  status: order.status,
  total_price: order.totalPrice,
  total_amount: order.totalPrice,
  delivery_address: order.deliveryAddress,
  notes: order.notes,
  created_at: order.createdAt,
  updated_at: order.updatedAt,
  items: Array.isArray(order.items) ? order.items.map(formatOrderItem) : undefined,
});

const createOrder = async ({ userId, restaurantId, deliveryAddress, notes = null, items }) => {
  const totalPrice = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        userId,
        restaurantId,
        deliveryAddress,
        notes,
        totalPrice,
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
      driver: {
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
      driver: {
        select: { name: true },
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
      driverId: null,
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
  const result = await prisma.order.updateMany({
    where: {
      id: orderId,
      status: 'confirmed',
      driverId: null,
    },
    data: {
      driverId,
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
      driver: {
        select: { name: true },
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
  const orders = await prisma.order.findMany({
    where: {
      driverId,
      status: {
        in: ['preparing', 'picked_up', 'out_for_delivery', 'delivered'],
      },
    },
    include: {
      restaurant: {
        select: { name: true },
      },
      user: {
        select: { id: true, name: true },
      },
      driver: {
        select: { name: true },
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
  const result = await prisma.order.updateMany({
    where: {
      id: orderId,
      driverId,
      status: {
        in: ['preparing', 'picked_up', 'out_for_delivery'],
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
      driver: {
        select: { name: true },
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

const rejectAssignedOrder = async ({ orderId, driverId, reason = '' }) => {
  // Driver can reject only before pickup; then order goes back to available queue.
  const existing = await prisma.order.findFirst({
    where: {
      id: orderId,
      driverId,
      status: 'preparing',
    },
    select: { notes: true },
  });

  if (!existing) return null;

  const reasonText = reason ? ` Reason: ${reason}` : '';
  const rejectionNote = `[Driver Rejection] Driver reassigned.${reasonText}`;
  const nextNotes = existing.notes ? `${existing.notes}\n${rejectionNote}` : rejectionNote;

  const result = await prisma.order.updateMany({
    where: {
      id: orderId,
      driverId,
      status: 'preparing',
    },
    data: {
      driverId: null,
      status: 'confirmed',
      notes: nextNotes,
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
      driver: {
        select: { name: true },
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
  rejectAssignedOrder,
};
