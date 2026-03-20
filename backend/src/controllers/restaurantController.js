const { validationResult } = require('express-validator');
const RestaurantModel = require('../models/restaurant');
const MenuItemModel = require('../models/menuItem');
const prismaRestaurantService = require('../services/prismaRestaurantService');

const usePrisma = process.env.USE_PRISMA === 'true';
const restaurantService = usePrisma
  ? {
      findAll: prismaRestaurantService.findAllRestaurants,
      findById: prismaRestaurantService.findRestaurantById,
      create: prismaRestaurantService.createRestaurant,
    }
  : RestaurantModel;
const menuService = usePrisma
  ? {
      findByRestaurant: prismaRestaurantService.findMenuByRestaurant,
    }
  : MenuItemModel;

// GET /api/restaurants - list all active restaurants
const getAllRestaurants = async (req, res) => {
  try {
    const { city, cuisine } = req.query;
    const restaurants = await restaurantService.findAll({ city, cuisine });
    return res.status(200).json({
      success: true,
      count: restaurants.length,
      data: { restaurants },
    });
  } catch (err) {
    console.error('getAllRestaurants error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/restaurants/:id/menu - get menu items for a restaurant
const getMenuByRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantId = Number(id);

    // Make sure the restaurant exists
    const restaurant = usePrisma
      ? await restaurantService.findById(restaurantId)
      : await restaurantService.findById(id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const { category, is_veg } = req.query;
    // Convert is_veg query string to boolean (or leave undefined if not provided)
    const isVegFilter = is_veg === 'true' ? true : is_veg === 'false' ? false : undefined;

    const menuItems = usePrisma
      ? await menuService.findByRestaurant(restaurantId, {
          category,
          is_veg: isVegFilter,
        })
      : await menuService.findByRestaurant(id, {
          category,
          is_veg: isVegFilter,
        });

    return res.status(200).json({
      success: true,
      count: menuItems.length,
      data: { restaurant, menuItems },
    });
  } catch (err) {
    console.error('getMenuByRestaurant error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/restaurants - add a new restaurant (admin or restaurant_owner only)
const addRestaurant = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  const { name, description, cuisine_type, address, city, phone, image_url } = req.body;

  try {
    const restaurant = await restaurantService.create({
      owner_id: req.user.id,
      name,
      description,
      cuisine_type,
      address,
      city,
      phone,
      image_url,
    });

    return res.status(201).json({
      success: true,
      message: 'Restaurant added successfully',
      data: { restaurant },
    });
  } catch (err) {
    console.error('addRestaurant error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { getAllRestaurants, getMenuByRestaurant, addRestaurant };
