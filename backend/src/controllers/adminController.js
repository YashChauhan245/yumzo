const { validationResult } = require('express-validator');
const prismaAdminService = require('../services/prismaAdminService');

const getDashboard = async (_req, res) => {
  try {
    const stats = await prismaAdminService.getDashboardStats();
    return res.status(200).json({ success: true, data: { stats } });
  } catch (error) {
    console.error('getDashboard error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getRestaurants = async (_req, res) => {
  try {
    const restaurants = await prismaAdminService.listRestaurants();
    return res.status(200).json({ success: true, count: restaurants.length, data: { restaurants } });
  } catch (error) {
    console.error('getRestaurants error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const createRestaurant = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, description, cuisine_type, address, city, phone, image_url } = req.body;
    const restaurant = await prismaAdminService.createRestaurant({
      ownerId: req.user.id,
      name,
      description,
      cuisineType: cuisine_type,
      address,
      city,
      phone,
      imageUrl: image_url,
    });

    return res.status(201).json({
      success: true,
      message: 'Restaurant added',
      data: { restaurant },
    });
  } catch (error) {
    console.error('createRestaurant error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const editRestaurant = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const { restaurantId } = req.params;
    const { name, description, cuisine_type, address, city, phone, image_url, is_active } = req.body;

    const restaurant = await prismaAdminService.updateRestaurant(restaurantId, {
      name,
      description,
      cuisineType: cuisine_type,
      address,
      city,
      phone,
      imageUrl: image_url,
      isActive: is_active,
    });

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    return res.status(200).json({ success: true, message: 'Restaurant updated', data: { restaurant } });
  } catch (error) {
    console.error('editRestaurant error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const removeRestaurant = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const { restaurantId } = req.params;
    const deleted = await prismaAdminService.deleteRestaurant(restaurantId);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    return res.status(200).json({ success: true, message: 'Restaurant deleted' });
  } catch (error) {
    console.error('removeRestaurant error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getMenuItems = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const { restaurantId } = req.query;
    const menuItems = await prismaAdminService.listMenuItems(restaurantId);
    return res.status(200).json({ success: true, count: menuItems.length, data: { menuItems } });
  } catch (error) {
    console.error('getMenuItems error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const createMenuItem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const {
      restaurant_id,
      name,
      description,
      price,
      category,
      image_url,
      is_veg = false,
      is_available = true,
    } = req.body;

    const menuItem = await prismaAdminService.createMenuItem({
      restaurantId: restaurant_id,
      name,
      description,
      price,
      category,
      imageUrl: image_url,
      isVeg: is_veg,
      isAvailable: is_available,
    });

    return res.status(201).json({ success: true, message: 'Menu item added', data: { menuItem } });
  } catch (error) {
    console.error('createMenuItem error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const editMenuItem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const { menuItemId } = req.params;
    const {
      name,
      description,
      price,
      category,
      image_url,
      is_veg,
      is_available,
    } = req.body;

    const menuItem = await prismaAdminService.updateMenuItem(menuItemId, {
      name,
      description,
      price,
      category,
      imageUrl: image_url,
      isVeg: is_veg,
      isAvailable: is_available,
    });

    if (!menuItem) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    return res.status(200).json({ success: true, message: 'Menu item updated', data: { menuItem } });
  } catch (error) {
    console.error('editMenuItem error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const removeMenuItem = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const { menuItemId } = req.params;
    const deleted = await prismaAdminService.deleteMenuItem(menuItemId);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    return res.status(200).json({ success: true, message: 'Menu item deleted' });
  } catch (error) {
    console.error('removeMenuItem error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getOrdersOverview = async (_req, res) => {
  try {
    const orders = await prismaAdminService.listOrders();
    return res.status(200).json({ success: true, count: orders.length, data: { orders } });
  } catch (error) {
    console.error('getOrdersOverview error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateOrderStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const { orderId } = req.params;
    const { status, reason } = req.body;

    const order = await prismaAdminService.updateOrderStatus(orderId, status, reason);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.status(200).json({ success: true, message: 'Order status updated', data: { order } });
  } catch (error) {
    console.error('updateOrderStatus error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getDashboard,
  getRestaurants,
  createRestaurant,
  editRestaurant,
  removeRestaurant,
  getMenuItems,
  createMenuItem,
  editMenuItem,
  removeMenuItem,
  getOrdersOverview,
  updateOrderStatus,
};
