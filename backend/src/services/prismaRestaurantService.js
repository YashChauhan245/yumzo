const prisma = require('../config/prisma');

const formatRestaurant = (r) => ({
  id: r.id,
  owner_id: r.ownerId,
  name: r.name,
  description: r.description,
  cuisine_type: r.cuisineType,
  address: r.address,
  city: r.city,
  phone: r.phone,
  image_url: r.imageUrl,
  rating: r.rating,
  is_active: r.isActive,
  created_at: r.createdAt,
  owner_name: r.owner ? r.owner.name : null,
});

const formatFood = (f) => ({
  id: f.id,
  restaurant_id: f.restaurantId,
  name: f.name,
  description: f.description,
  price: f.price,
  category: f.category,
  image_url: f.imageUrl,
  is_veg: f.isVeg,
  is_available: f.isAvailable,
  created_at: f.createdAt,
});

const findAllRestaurants = async ({ city, cuisine }) => {
  const where = { isActive: true };

  if (city) where.city = { contains: city, mode: 'insensitive' };
  if (cuisine) where.cuisineType = { contains: cuisine, mode: 'insensitive' };

  const restaurants = await prisma.restaurant.findMany({
    where,
    include: { owner: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return restaurants.map(formatRestaurant);
};

const findRestaurantById = async (id) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
    include: { owner: { select: { name: true } } },
  });

  return restaurant ? formatRestaurant(restaurant) : null;
};

const createRestaurant = async ({ owner_id, name, description, cuisine_type, address, city, phone, image_url }) => {
  const restaurant = await prisma.restaurant.create({
    data: {
      ownerId: owner_id,
      name,
      description,
      cuisineType: cuisine_type,
      address,
      city,
      phone,
      imageUrl: image_url,
    },
    include: { owner: { select: { name: true } } },
  });

  return formatRestaurant(restaurant);
};

const findMenuByRestaurant = async (restaurantId, { category, is_veg }) => {
  const where = {
    restaurantId,
    isAvailable: true,
  };

  if (category) where.category = { contains: category, mode: 'insensitive' };
  if (is_veg !== undefined) where.isVeg = is_veg;

  const foods = await prisma.food.findMany({
    where,
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });

  return foods.map(formatFood);
};

const createMenuItem = async ({ restaurant_id, name, description, price, category, image_url, is_veg }) => {
  const food = await prisma.food.create({
    data: {
      restaurantId: restaurant_id,
      name,
      description,
      price,
      category,
      imageUrl: image_url,
      isVeg: is_veg,
      isAvailable: true,
    },
  });

  return formatFood(food);
};

module.exports = {
  findAllRestaurants,
  findRestaurantById,
  createRestaurant,
  findMenuByRestaurant,
  createMenuItem,
};
