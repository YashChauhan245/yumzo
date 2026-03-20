const { validationResult } = require('express-validator');
const RestaurantModel = require('../models/restaurant');
const MenuItemModel = require('../models/menuItem');

/**
 * GET /api/restaurants
 * Return all active restaurants.
 * Optional query params: city, cuisine
 */
const getAllRestaurants = async (req, res) => {
  try {
    const { city, cuisine } = req.query;
    const restaurants = await RestaurantModel.findAll({ city, cuisine });
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

/**
 * GET /api/restaurants/:id/menu
 * Return menu items for a specific restaurant.
 * Optional query params: category, is_veg
 */
const getMenuByRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify the restaurant exists
    const restaurant = await RestaurantModel.findById(id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const { category, is_veg } = req.query;
    const isVegFilter =
      is_veg === 'true' ? true : is_veg === 'false' ? false : undefined;

    const menuItems = await MenuItemModel.findByRestaurant(id, {
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

/**
 * POST /api/restaurants
 * Add a new restaurant.  Admin only (enforced via `authorize` middleware).
 */
const addRestaurant = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  const { name, description, cuisine_type, address, city, phone, image_url } =
    req.body;

  try {
    const restaurant = await RestaurantModel.create({
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
