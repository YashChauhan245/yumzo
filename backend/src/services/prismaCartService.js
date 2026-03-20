const prisma = require('../config/prisma');

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
});

const formatCartRow = (row) => ({
  id: row.id,
  user_id: row.userId,
  menu_item_id: row.menuItemId,
  restaurant_id: row.restaurantId,
  quantity: row.quantity,
  created_at: row.createdAt,
  updated_at: row.updatedAt,
});

const findMenuItemById = async (id) => {
  const item = await prisma.food.findUnique({ where: { id } });
  return item ? formatMenuItem(item) : null;
};

const getByUser = async (userId) => {
  const rows = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      menuItem: true,
      restaurant: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return rows.map((row) => ({
    id: row.id,
    user_id: row.userId,
    quantity: row.quantity,
    created_at: row.createdAt,
    menu_item_id: row.menuItemId,
    item_name: row.menuItem?.name,
    item_description: row.menuItem?.description,
    price: row.menuItem?.price,
    image_url: row.menuItem?.imageUrl,
    is_veg: row.menuItem?.isVeg,
    category: row.menuItem?.category,
    restaurant_id: row.restaurantId,
    restaurant_name: row.restaurant?.name,
  }));
};

const upsertItem = async ({ userId, menuItemId, restaurantId, quantity = 1 }) => {
  const row = await prisma.cartItem.upsert({
    where: {
      userId_menuItemId: {
        userId,
        menuItemId,
      },
    },
    update: {
      quantity: { increment: quantity },
    },
    create: {
      userId,
      menuItemId,
      restaurantId,
      quantity,
    },
  });

  return formatCartRow(row);
};

const updateQuantity = async (cartItemId, userId, quantity) => {
  const result = await prisma.cartItem.updateMany({
    where: {
      id: cartItemId,
      userId,
    },
    data: { quantity },
  });

  if (result.count === 0) return null;

  const row = await prisma.cartItem.findUnique({ where: { id: cartItemId } });
  return row ? formatCartRow(row) : null;
};

const removeItem = async (cartItemId, userId) => {
  const existing = await prisma.cartItem.findFirst({
    where: {
      id: cartItemId,
      userId,
    },
  });

  if (!existing) return null;

  const deleted = await prisma.cartItem.delete({ where: { id: cartItemId } });
  return formatCartRow(deleted);
};

const clearCart = async (userId) => {
  await prisma.cartItem.deleteMany({ where: { userId } });
};

module.exports = {
  findMenuItemById,
  getByUser,
  upsertItem,
  updateQuantity,
  removeItem,
  clearCart,
};
