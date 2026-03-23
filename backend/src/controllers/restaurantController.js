const { validationResult } = require('express-validator');
const prismaRestaurantService = require('../services/prismaRestaurantService');

const restaurantService = {
  findAll: prismaRestaurantService.findAllRestaurants,
  findById: prismaRestaurantService.findRestaurantById,
  create: prismaRestaurantService.createRestaurant,
};
const menuService = {
  findByRestaurant: prismaRestaurantService.findMenuByRestaurant,
};

const isUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

// GET /api/user/restaurants - list active restaurants for customers
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

// GET /api/user/restaurants/:id/menu - get menu items for a restaurant
const getMenuByRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isUuid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid restaurant id format' });
    }

    const restaurantId = id;

    // Make sure the restaurant exists
    const restaurant = await restaurantService.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const { category, is_veg } = req.query;
    // Convert is_veg query string to boolean (or leave undefined if not provided)
    const isVegFilter = is_veg === 'true' ? true : is_veg === 'false' ? false : undefined;

    const menuItems = await menuService.findByRestaurant(restaurantId, {
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
