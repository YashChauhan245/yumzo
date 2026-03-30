const { validationResult } = require('express-validator');
const prismaRestaurantService = require('../services/prismaRestaurantService');
const smartComboService = require('../services/smartComboService');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

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
    const { page, limit, skip } = getPagination(req.query, { defaultLimit: 9, maxLimit: 30 });
    const { rows, total } = await restaurantService.findAll({ city, cuisine, skip, limit });

    return res.status(200).json({
      success: true,
      count: rows.length,
      pagination: buildPaginationMeta({ page, limit, total }),
      data: { restaurants: rows },
    });
  } catch (err) {
    console.error('getAllRestaurants error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/user/restaurants/:id/reviews - create/update restaurant review from current user
const addOrUpdateRestaurantReview = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const { id } = req.params;
    if (!isUuid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid restaurant id format' });
    }

    const restaurant = await restaurantService.findById(id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const rating = Number(req.body.rating);
    const reviewText = req.body.review_text?.trim() || null;

    const review = await prismaRestaurantService.upsertReview({
      restaurantId: id,
      userId: req.user.id,
      rating,
      reviewText,
    });

    return res.status(200).json({
      success: true,
      message: 'Review saved successfully',
      data: {
        review: {
          id: review.id,
          restaurant_id: review.restaurantId,
          user_id: review.userId,
          rating: review.rating,
          review_text: review.reviewText,
          created_at: review.createdAt,
          updated_at: review.updatedAt,
        },
      },
    });
  } catch (err) {
    console.error('addOrUpdateRestaurantReview error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/user/restaurants/:id/reviews - paginated reviews for one restaurant
const getRestaurantReviews = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isUuid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid restaurant id format' });
    }

    const restaurant = await restaurantService.findById(id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const { page, limit, skip } = getPagination(req.query, { defaultLimit: 5, maxLimit: 20 });
    const { rows, total, averageRating } = await prismaRestaurantService.findReviewsByRestaurant({
      restaurantId: id,
      skip,
      limit,
    });

    return res.status(200).json({
      success: true,
      count: rows.length,
      pagination: buildPaginationMeta({ page, limit, total }),
      data: {
        reviews: rows,
        average_rating: Number(averageRating.toFixed(1)),
      },
    });
  } catch (err) {
    console.error('getRestaurantReviews error:', err);
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

// POST /api/user/restaurants/:id/smart-combo - suggest goal-based combo using AI + fallback scoring
const getSmartComboSuggestion = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const { id } = req.params;
    if (!isUuid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid restaurant id format' });
    }

    const restaurant = await restaurantService.findById(id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const menuItems = await menuService.findByRestaurant(id, {});
    const combo = await smartComboService.suggestSmartCombo({
      restaurantName: restaurant.name,
      menuItems,
      goal: req.body.goal,
    });

    return res.status(200).json({
      success: true,
      data: {
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
        },
        combo,
      },
    });
  } catch (err) {
    if (err?.message?.includes('Unsupported goal')) {
      return res.status(400).json({ success: false, message: err.message });
    }

    console.error('getSmartComboSuggestion error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getAllRestaurants,
  getMenuByRestaurant,
  addRestaurant,
  addOrUpdateRestaurantReview,
  getRestaurantReviews,
  getSmartComboSuggestion,
};
